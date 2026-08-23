"""Database configuration and session management."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# Handle SQLite-specific connection args
connect_args = {}
if settings.DATABASE_URL.startswith('sqlite'):
    connect_args['check_same_thread'] = False

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def create_tables() -> None:
    """Create all database tables."""
    from app.models.user import User  # noqa: F401
    from app.models.prediction import Prediction  # noqa: F401
    Base.metadata.create_all(bind=engine)
