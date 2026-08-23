"""Prediction schemas for request/response validation."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PredictionResponse(BaseModel):
    """Schema for a single prediction response."""
    id: int
    original_filename: str
    predicted_class: str
    confidence: float
    probabilities: dict
    gradcam_url: Optional[str] = None
    processing_time_ms: float
    model_version: str
    image_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PredictionListResponse(BaseModel):
    """Schema for paginated prediction list response."""
    predictions: list[PredictionResponse]
    total: int
    page: int
    per_page: int
