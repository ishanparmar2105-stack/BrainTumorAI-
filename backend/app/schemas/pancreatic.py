"""Pancreatic Prediction schemas for request/response validation."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PancreaticPredictionResponse(BaseModel):
    """Schema for a single pancreatic prediction response."""
    id: int
    original_filename: str
    predicted_class: str
    confidence: float
    probabilities: dict
    processing_time_ms: float
    model_version: str
    image_url: str
    model_metrics: dict
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PancreaticPredictionListResponse(BaseModel):
    """Schema for paginated pancreatic prediction list response."""
    predictions: list[PancreaticPredictionResponse]
    total: int
    page: int
    per_page: int
