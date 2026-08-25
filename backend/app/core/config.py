"""Application configuration using Pydantic Settings."""
import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict, field_validator

# Project root directory (four levels up from backend/app/core/config.py)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    SECRET_KEY: str = 'dev-secret-key-change-in-production'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Paths defaults (made absolute relative to PROJECT_ROOT)
    DATABASE_URL: str = f'sqlite:///{os.path.join(PROJECT_ROOT, "braintumorai.db")}'
    MODEL_PATH: str = os.path.join(PROJECT_ROOT, 'models', 'best_model.keras')
    UPLOAD_DIR: str = os.path.join(PROJECT_ROOT, 'uploads')
    
    IMAGE_SIZE: int = 224
    MODEL_VERSION: str = '1.0.2'
    MAX_FILE_SIZE: int = 10485760
    FRONTEND_URL: str = 'http://localhost:5173'
    CLASS_NAMES: list = ['glioma', 'meningioma', 'notumor', 'pituitary']

    model_config = ConfigDict(env_file='.env', extra='ignore')

    @field_validator('DATABASE_URL')
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Convert relative sqlite URL to absolute relative to PROJECT_ROOT."""
        if v.startswith('sqlite:///./'):
            db_name = v.replace('sqlite:///./', '')
            return f'sqlite:///{os.path.join(PROJECT_ROOT, db_name)}'
        elif v.startswith('sqlite:///') and not os.path.isabs(v.replace('sqlite:///', '')):
            db_path = v.replace('sqlite:///', '')
            return f'sqlite:///{os.path.join(PROJECT_ROOT, db_path)}'
        return v

    @field_validator('MODEL_PATH')
    @classmethod
    def validate_model_path(cls, v: str) -> str:
        """Convert relative model path to absolute relative to PROJECT_ROOT."""
        if not os.path.isabs(v):
            return os.path.abspath(os.path.join(PROJECT_ROOT, v))
        return v

    @field_validator('UPLOAD_DIR')
    @classmethod
    def validate_upload_dir(cls, v: str) -> str:
        """Convert relative upload directory to absolute relative to PROJECT_ROOT."""
        if not os.path.isabs(v):
            return os.path.abspath(os.path.join(PROJECT_ROOT, v))
        return v

settings = Settings()
