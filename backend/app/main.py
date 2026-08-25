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

    # Seed default users if database is empty to survive ephemeral resets
    from app.models.database import SessionLocal
    from app.models.user import User
    from app.core.security import hash_password
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            logger.info('Seeding default users...')
            db.add(User(
                email="demo@example.com",
                username="demouser",
                hashed_password=hash_password("password123"),
                role="user"
            ))
            db.add(User(
                email="admin@example.com",
                username="admin",
                hashed_password=hash_password("adminpassword"),
                role="admin"
            ))
            db.add(User(
                email="user@example.com",
                username="researcher",
                hashed_password=hash_password("userpassword"),
                role="user"
            ))
            db.commit()
            logger.info('Default users seeded successfully.')
    except Exception as e:
        logger.error(f'Failed to seed default users: {e}')
    finally:
        db.close()

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
        'https://brain-tumor-ai-sigma.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
    ],
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+",
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
