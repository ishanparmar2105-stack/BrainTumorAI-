"""Authentication API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix='/auth', tags=['Authentication'])


@router.post('/register', response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Email already registered',
        )

    # Check if username already exists
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Username already taken',
        )

    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    access_token = create_access_token(data={'sub': str(user.id)})
    return TokenResponse(access_token=access_token)


@router.post('/login', response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user and return a token."""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid credentials',
        )

    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid credentials',
        )

    access_token = create_access_token(data={'sub': str(user.id)})
    return TokenResponse(access_token=access_token)


@router.get('/me', response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return current_user
