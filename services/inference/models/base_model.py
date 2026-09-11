"""
TRINETRA Forecast Models: Base Model Specification
Authoritative contract for all heuristic, classical baseline, and deep learning nowcast models.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pydantic import BaseModel, Field


class ModelPredictionOutput(BaseModel):
    model_name: str
    model_version: str
    model_type: str # baseline_heuristic, baseline_tree, deep_spatiotemporal
    horizon_minutes: int
    is_test_baseline: bool = True
    thunderstorm_prob: float = Field(ge=0.0, le=1.0)
    cloudburst_prob: float = Field(ge=0.0, le=1.0)
    flash_flood_prob: float = Field(ge=0.0, le=1.0)
    severity: str
    contributing_factors: Dict[str, float] = {}


class BaseModel(ABC):
    """
    Abstract Base Class for Nowcast Prediction Models.
    Ensures consistent probability output boundaries and metadata tracking.
    """

    def __init__(self, model_name: str, model_version: str, model_type: str):
        self.model_name = model_name
        self.model_version = model_version
        self.model_type = model_type

    @abstractmethod
    def predict_cell(
        self,
        cell_features: Dict[str, float],
        horizon_minutes: int,
        **kwargs
    ) -> ModelPredictionOutput:
        """
        Compute calibrated hazard probabilities for a single spatial cell at a given lead time.
        """
        pass

    def get_metadata(self) -> Dict[str, Any]:
        """Returns model lineage, version, and architecture type."""
        return {
            "model_name": self.model_name,
            "model_version": self.model_version,
            "model_type": self.model_type,
            "is_test_baseline": True,
        }
