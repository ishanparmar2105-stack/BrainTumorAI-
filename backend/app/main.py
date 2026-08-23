"""FastAPI application entry point."""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.models.database import create_tables
from app.services.ml_service import ml_service
from app.services.pancreatic_ml_service import pancreatic_ml_service
from app.api import auth, predictions, admin, health, pancreatic

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info('Starting BrainTumorAI API...')
    create_tables()
    logger.info('Database tables created.')

    ml_service.load_model()
    pancreatic_ml_service.load_model()

    # Ensure upload directories exist
    os.makedirs(os.path.join(settings.UPLOAD_DIR, 'mri'), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, 'gradcam'), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, 'pancreatic'), exist_ok=True)
    logger.info('Upload directories ready.')

    yield

    # Shutdown
    logger.info('Shutting down BrainTumorAI API...')


app = FastAPI(
    title='BrainTumorAI API',
    description='AI-powered brain tumor classification from MRI scans',
    version=settings.MODEL_VERSION,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:3000',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Mount static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=settings.UPLOAD_DIR), name='uploads')

# Include API routers
app.include_router(auth.router, prefix='/api')
app.include_router(predictions.router, prefix='/api')
app.include_router(admin.router, prefix='/api')
app.include_router(health.router, prefix='/api')
app.include_router(pancreatic.router, prefix='/api')


@app.get('/')
def root():
    """Root endpoint."""
    return {
        'message': 'BrainTumorAI API',
        'docs_url': '/docs',
    }
