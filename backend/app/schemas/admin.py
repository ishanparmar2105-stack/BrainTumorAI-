"""Admin schemas for dashboard statistics."""
from pydantic import BaseModel


class SystemStats(BaseModel):
    """System-wide statistics."""
    total_predictions: int
    predictions_today: int
    total_users: int
    active_model: str
    model_version: str


class PredictionDistribution(BaseModel):
    """Distribution of predictions by class."""
    class_name: str
    count: int
    percentage: float


class AdminStatsResponse(BaseModel):
    """Complete admin statistics response."""
    stats: SystemStats
    distribution: list[PredictionDistribution]
    recent_predictions: list
