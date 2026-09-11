"""
TRINETRA Data Ingestion & Normalization Layer
"""

from .base_adapter import BaseAdapter, NormalizedObservationGrid, BoundingBox
from .insat_adapter import InsatAdapter
from .imdaa_adapter import ImdaaAdapter
from .dem_adapter import DemAdapter
from .normalizer import SpatiotemporalNormalizer
from .freshness import FreshnessService
from .synthetic_replay import generate_synthetic_nowcast_payload

__all__ = [
    "BaseAdapter",
    "NormalizedObservationGrid",
    "BoundingBox",
    "InsatAdapter",
    "ImdaaAdapter",
    "DemAdapter",
    "SpatiotemporalNormalizer",
    "FreshnessService",
    "generate_synthetic_nowcast_payload",
]
