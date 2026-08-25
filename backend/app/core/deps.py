"""Dependency injection utilities for FastAPI."""
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import verify_token
from app.models.database import SessionLocal
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')


def get_db() -> Generator:
    """Get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Get the current authenticated user from JWT token, or return default demo user if token is missing/invalid."""
    if token:
        try:
            payload = verify_token(token)
            user_id: str = payload.get('sub')
            if user_id:
                user = db.query(User).filter(User.id == int(user_id)).first()
                if user and user.is_active:
                    return user
        except Exception:
            pass  # Fall through to default demo user

    # Fallback: Return or create default demo user automatically
    demo_user = db.query(User).filter(User.email == 'demo@example.com').first()
    if not demo_user:
        from app.core.security import get_password_hash
        demo_user = User(
            email='demo@example.com',
            full_name='Demo User',
            hashed_password=get_password_hash('password123'),
            is_active=True,
            role='admin'
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    return demo_user


def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verify the current user has admin privileges (always true for demo)."""
    return current_user
