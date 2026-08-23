"""Admin API routes."""
import json
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_db, get_admin_user
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.admin import (
    AdminStatsResponse,
    SystemStats,
    PredictionDistribution,
)
from app.services.ml_service import ml_service

router = APIRouter(prefix='/admin', tags=['Admin'])


@router.get('/statistics', response_model=AdminStatsResponse)
def get_statistics(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Get system-wide statistics. Requires admin privileges."""
    total_predictions = db.query(Prediction).count()

    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    predictions_today = (
        db.query(Prediction)
        .filter(Prediction.created_at >= today_start)
        .count()
    )

    total_users = db.query(User).count()

    # Build prediction distribution
    distribution = []
    for class_name in settings.CLASS_NAMES:
        count = (
            db.query(Prediction)
            .filter(Prediction.predicted_class == class_name)
            .count()
        )
        percentage = (count / total_predictions * 100) if total_predictions > 0 else 0.0
        distribution.append(
            PredictionDistribution(
                class_name=class_name,
                count=count,
                percentage=round(percentage, 2),
            )
        )

    # Recent predictions
    recent = (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .limit(10)
        .all()
    )
    recent_predictions = [
        {
            'id': p.id,
            'original_filename': p.original_filename,
            'predicted_class': p.predicted_class,
            'confidence': p.confidence,
            'created_at': p.created_at.isoformat() if p.created_at else None,
            'user_id': p.user_id,
        }
        for p in recent
    ]

    stats = SystemStats(
        total_predictions=total_predictions,
        predictions_today=predictions_today,
        total_users=total_users,
        active_model=settings.MODEL_PATH,
        model_version=settings.MODEL_VERSION,
    )

    return AdminStatsResponse(
        stats=stats,
        distribution=distribution,
        recent_predictions=recent_predictions,
    )


@router.get('/model-metrics')
def get_model_metrics(
    admin_user: User = Depends(get_admin_user),
):
    """Get ML model metrics and information. Requires admin privileges."""
    metrics = {
        'model_version': settings.MODEL_VERSION,
        'model_path': settings.MODEL_PATH,
        'model_loaded': ml_service.model_loaded,
        'classes': settings.CLASS_NAMES,
        'image_size': settings.IMAGE_SIZE,
    }

    # Try to load evaluation results if available
    eval_path = os.path.join('models', 'evaluation_results.json')
    if os.path.exists(eval_path):
        try:
            with open(eval_path, 'r') as f:
                metrics['evaluation_results'] = json.load(f)
        except (json.JSONDecodeError, IOError):
            metrics['evaluation_results'] = None
    else:
        metrics['evaluation_results'] = None

    return metrics
