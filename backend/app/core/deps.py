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
    """Get the current authenticated user from the JWT token."""
    payload = verify_token(token)
    user_id: str = payload.get('sub')
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Could not validate credentials',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User not found',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Inactive user',
        )
    return user


def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verify the current user has admin privileges."""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Admin privileges required',
        )
    return current_user
