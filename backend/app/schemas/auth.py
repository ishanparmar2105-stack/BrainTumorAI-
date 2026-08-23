"""Authentication schemas for request/response validation."""
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response data."""
    id: int
    email: str
    username: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = 'bearer'
