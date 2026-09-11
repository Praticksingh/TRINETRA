"""
TRINETRA Forecast Models Package
"""

from .base_model import BaseModel, ModelPredictionOutput
from .persistence import PersistenceBaseline
from .climatology import ClimatologyBaseline
from .tree_baseline import TreeBaseline
from .data_split import TimeAwareSplitter
from .evaluator import Evaluator

# Phase 5: Spatiotemporal Deep Learning Model Components
from .spatiotemporal_net import (
    SpatiotemporalMultiTaskNet,
    MODEL_VERSION as DEEP_MODEL_VERSION,
    FEATURE_CHANNELS,
    DEFAULT_HORIZONS,
)
from .focal_loss import (
    BinaryFocalLoss,
    MultiTaskHazardLoss,
    TemperatureCalibrator,
    compute_expected_calibration_error,
)
from .trainer import ModelTrainer, SyntheticAtmosphericDataset
from .deep_inference import TrinetraDeepInference
from .hurdle_evaluator import HurdleEvaluator

__all__ = [
    "BaseModel",
    "ModelPredictionOutput",
    "PersistenceBaseline",
    "ClimatologyBaseline",
    "TreeBaseline",
    "TimeAwareSplitter",
    "Evaluator",
    "SpatiotemporalMultiTaskNet",
    "DEEP_MODEL_VERSION",
    "FEATURE_CHANNELS",
    "DEFAULT_HORIZONS",
    "BinaryFocalLoss",
    "MultiTaskHazardLoss",
    "TemperatureCalibrator",
    "compute_expected_calibration_error",
    "ModelTrainer",
    "SyntheticAtmosphericDataset",
    "TrinetraDeepInference",
    "HurdleEvaluator",
]
