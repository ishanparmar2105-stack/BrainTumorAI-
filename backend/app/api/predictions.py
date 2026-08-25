"""Prediction API routes."""
import json
import logging
import os
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_db, get_current_user
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction import PredictionResponse, PredictionListResponse
from app.services.ml_service import ml_service
from app.services.gradcam_service import gradcam_service
from app.services.storage_service import storage_service
from app.services.report_service import report_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/predictions', tags=['Predictions'])


def _build_prediction_response(prediction: Prediction) -> PredictionResponse:
    """Build a PredictionResponse from a Prediction model."""
    image_url = f'/uploads/mri/{os.path.basename(prediction.image_path)}'
    gradcam_url = None
    if prediction.gradcam_path:
        gradcam_url = f'/uploads/gradcam/{os.path.basename(prediction.gradcam_path)}'

    return PredictionResponse(
        id=prediction.id,
        original_filename=prediction.original_filename,
        predicted_class=prediction.predicted_class,
        confidence=prediction.confidence,
        probabilities=json.loads(prediction.probabilities_json),
        gradcam_url=gradcam_url,
        processing_time_ms=prediction.processing_time_ms,
        model_version=prediction.model_version,
        image_url=image_url,
        created_at=prediction.created_at,
    )


@router.post('/', response_model=PredictionResponse)
async def create_prediction(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload an MRI image and get a brain tumor prediction."""
    # Validate image
    await storage_service.validate_image(file)

    # Save uploaded file
    image_path = await storage_service.save_upload(file, 'mri')

    # Run prediction
    result = ml_service.predict(image_path, file.filename)

    # Generate Grad-CAM visualization
    gradcam_path = None
    try:
        img_array = ml_service.preprocess_image(image_path)
        pred_index = settings.CLASS_NAMES.index(result['predicted_class'])
        
        if ml_service.model_loaded and ml_service.model is not None:
            heatmap = gradcam_service.generate_gradcam(
                ml_service.model, img_array, pred_index
            )
        else:
            heatmap = gradcam_service.generate_gradcam(
                None, img_array, pred_index
            )
            
        gradcam_filename = f'gradcam_{uuid4().hex}.png'
        gradcam_path = os.path.join(
            settings.UPLOAD_DIR, 'gradcam', gradcam_filename
        )
        gradcam_service.save_gradcam_overlay(image_path, heatmap, gradcam_path)
    except Exception as e:
        logger.error(f'Failed to generate Grad-CAM: {e}')
        gradcam_path = None

    # Save prediction to database
    prediction = Prediction(
        user_id=current_user.id,
        original_filename=file.filename or 'unknown',
        image_path=image_path,
        predicted_class=result['predicted_class'],
        confidence=result['confidence'],
        probabilities_json=json.dumps(result['probabilities']),
        gradcam_path=gradcam_path,
        processing_time_ms=result['processing_time_ms'],
        model_version=settings.MODEL_VERSION,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return _build_prediction_response(prediction)


@router.get('/', response_model=PredictionListResponse)
def list_predictions(
    page: int = 1,
    per_page: int = 10,
    class_filter: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the current user's predictions with pagination."""
    query = db.query(Prediction).filter(Prediction.user_id == current_user.id)

    if class_filter:
        query = query.filter(Prediction.predicted_class == class_filter)

    if search:
        query = query.filter(Prediction.original_filename.ilike(f'%{search}%'))

    total = query.count()
    predictions = (
        query
        .order_by(Prediction.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return PredictionListResponse(
        predictions=[_build_prediction_response(p) for p in predictions],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get('/{prediction_id}', response_model=PredictionResponse)
def get_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific prediction by ID."""
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Prediction not found',
        )

    if prediction.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Not authorized to access this prediction',
        )

    return _build_prediction_response(prediction)


@router.delete('/{prediction_id}')
def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a prediction and its associated files."""
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Prediction not found',
        )

    if prediction.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Not authorized to delete this prediction',
        )

    # Delete associated files
    storage_service.delete_file(prediction.image_path)
    if prediction.gradcam_path:
        storage_service.delete_file(prediction.gradcam_path)

    db.delete(prediction)
    db.commit()

    return {'message': 'Prediction deleted successfully'}


@router.get('/{prediction_id}/report')
def get_prediction_report(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate and download a PDF report for a prediction."""
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Prediction not found',
        )

    if prediction.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Not authorized to access this prediction',
        )

    prediction_data = {
        'id': prediction.id,
        'created_at': prediction.created_at.isoformat() if prediction.created_at else 'N/A',
        'original_filename': prediction.original_filename,
        'predicted_class': prediction.predicted_class,
        'confidence': prediction.confidence,
        'probabilities': json.loads(prediction.probabilities_json),
        'model_version': prediction.model_version,
        'processing_time_ms': prediction.processing_time_ms,
    }

    pdf_bytes = report_service.generate_report(prediction_data)

    return Response(
        content=pdf_bytes,
        media_type='application/pdf',
        headers={
            'Content-Disposition': f'attachment; filename=report_{prediction.id}.pdf'
        },
    )
