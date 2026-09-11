"""
TRINETRA Data Ingestion: Base Adapter Specification
Authoritative contract for all observational, satellite, atmospheric, and terrain feeds.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    min_lon: float = Field(ge=-180.0, le=180.0)
    min_lat: float = Field(ge=-90.0, le=90.0)
    max_lon: float = Field(ge=-180.0, le=180.0)
    max_lat: float = Field(ge=-90.0, le=90.0)


class ProvenanceMetadata(BaseModel):
    source_name: str
    sensor_or_model: str
    product_version: str
    observation_timestamp: str # ISO 8601 UTC
    ingested_at: str            # ISO 8601 UTC
    crs: str = "EPSG:4326"
    spatial_resolution_deg: float = 0.04
    bounds: BoundingBox
    quality_flag: str = "nominal" # nominal, degraded, interpolated, missing_channels
    is_synthetic_replay: bool = False
    raw_file_hash: Optional[str] = None


class NormalizedFeatureChannel(BaseModel):
    channel_name: str
    standard_name: str
    unit: str
    shape: List[int]
    values: List[List[float]] # 2D grid [lat_idx, lon_idx]
    fill_value: float = -9999.0
    valid_range: List[float]


class NormalizedObservationGrid(BaseModel):
    grid_id: str
    provenance: ProvenanceMetadata
    lats: List[float]
    lons: List[float]
    channels: Dict[str, NormalizedFeatureChannel]


from core.resilience import CircuitBreaker, with_retry


class BaseAdapter(ABC):
    """
    Abstract Base Class for Data Ingestion Adapters.
    Every observational feed must implement standard validation, CRS checking,
    and metadata extraction before passing data to the inference pipeline.
    """

    def __init__(self, source_name: str, sensor_or_model: str):
        self.source_name = source_name
        self.sensor_or_model = sensor_or_model
        self.circuit_breaker = CircuitBreaker(name=f"{source_name}_circuit", failure_threshold=4, recovery_timeout_seconds=20.0)

    @abstractmethod
    def ingest(self, raw_payload: Any, **kwargs) -> NormalizedObservationGrid:
        """
        Ingest raw observation payload and return standard NormalizedObservationGrid.
        """
        pass

    def build_provenance(
        self,
        observation_timestamp: str,
        bounds: BoundingBox,
        quality_flag: str = "nominal",
        is_synthetic_replay: bool = False,
        file_hash: Optional[str] = None,
    ) -> ProvenanceMetadata:
        """Construct standard provenance record."""
        return ProvenanceMetadata(
            source_name=self.source_name,
            sensor_or_model=self.sensor_or_model,
            product_version="v1.0.0",
            observation_timestamp=observation_timestamp,
            ingested_at=datetime.now(timezone.utc).isoformat(),
            crs="EPSG:4326",
            spatial_resolution_deg=0.04,
            bounds=bounds,
            quality_flag=quality_flag,
            is_synthetic_replay=is_synthetic_replay,
            raw_file_hash=file_hash,
        )
