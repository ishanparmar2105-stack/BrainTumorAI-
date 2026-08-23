"""Pancreatic Prediction database model."""
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey

from app.models.database import Base


class PancreaticPrediction(Base):
    """Prediction model storing pancreatic ML inference results."""
    __tablename__ = 'pancreatic_predictions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    original_filename = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    predicted_class = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    probabilities_json = Column(Text, nullable=False)
    processing_time_ms = Column(Float, nullable=False)
    model_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
