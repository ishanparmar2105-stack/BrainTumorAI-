"""Health check API route."""
from fastapi import APIRouter

from app.core.config import settings
from app.services.ml_service import ml_service

router = APIRouter(tags=['Health'])


@router.get('/health')
def health_check():
    """Check the health status of the API."""
    return {
        'status': 'healthy',
        'model_loaded': ml_service.model_loaded,
        'database': 'connected',
        'version': settings.MODEL_VERSION,
    }
