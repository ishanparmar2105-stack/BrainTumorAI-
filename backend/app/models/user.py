"""User database model."""
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, DateTime

from app.models.database import Base


class User(Base):
    """User model for authentication and authorization."""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default='user')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
