"""
TRINETRA Spatiotemporal Normalization Engine
Aligns multi-sensor observations (satellite, reanalysis, DEM) into a unified 4D tensor representation.
Enforces EPSG:4326, 0.04° grid resolution, UTC timestamps, and deterministic reproducibility.
"""

import hashlib
import numpy as np
from typing import Dict, Any, List, Tuple
from .insat_adapter import InsatAdapter
from .imdaa_adapter import ImdaaAdapter
from .dem_adapter import DemAdapter
from .base_adapter import NormalizedObservationGrid


FEATURE_ORDER = [
    "bt_tir1",
    "btd_split",
    "cooling_rate",
    "cape",
    "cin",
    "tpw",
    "omega_500",
    "elevation",
    "slope_deg",
    "twi",
]


class SpatiotemporalNormalizer:
    def __init__(self):
        self.insat_adapter = InsatAdapter()
        self.imdaa_adapter = ImdaaAdapter()
        self.dem_adapter = DemAdapter()

    def process_raw_batch(self, raw_batch: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes end-to-end multi-sensor ingestion, normalization, and tensor alignment.
        Returns:
            - feature_tensor: 3D array [channels, lat, lon]
            - feature_names: ordered list of channel names
            - quality_flag: overall batch quality ('nominal', 'degraded', 'missing_channels')
            - provenance_trail: combined provenance from all data sources
            - tensor_hash: deterministic SHA-256 digest of normalized feature values
        """
        timestamp = raw_batch.get("observation_timestamp")
        if not timestamp:
            raise ValueError("Normalization failed: observation_timestamp is required.")

        # 1. Ingest from respective adapters
        insat_grid = self.insat_adapter.ingest(raw_batch["insat"])
        imdaa_grid = self.imdaa_adapter.ingest(raw_batch["imdaa"])
        dem_grid = self.dem_adapter.ingest(raw_batch.get("dem", {}))

        # 2. Determine composite quality flag
        quality_flags = [
            insat_grid.provenance.quality_flag,
            imdaa_grid.provenance.quality_flag,
            dem_grid.provenance.quality_flag,
        ]
        overall_quality = "nominal"
        if "missing_channels" in quality_flags:
            overall_quality = "missing_channels"
        elif "degraded" in quality_flags:
            overall_quality = "degraded"

        # 3. Stack into aligned 3D tensor [num_channels, num_lats, num_lons]
        n_lats = len(insat_grid.lats)
        n_lons = len(insat_grid.lons)
        tensor = np.zeros((len(FEATURE_ORDER), n_lats, n_lons), dtype=np.float32)

        for ch_idx, ch_name in enumerate(FEATURE_ORDER):
            if ch_name in insat_grid.channels:
                arr = np.array(insat_grid.channels[ch_name].values, dtype=np.float32)
                tensor[ch_idx] = arr
            elif ch_name in imdaa_grid.channels:
                arr = np.array(imdaa_grid.channels[ch_name].values, dtype=np.float32)
                tensor[ch_idx] = arr
            elif ch_name in dem_grid.channels:
                arr = np.array(dem_grid.channels[ch_name].values, dtype=np.float32)
                tensor[ch_idx] = arr
            else:
                # Missing channel: populate with 0.0 and mark degraded
                overall_quality = "degraded"

        # 4. Deterministic Hash Calculation
        tensor_bytes = tensor.tobytes()
        tensor_hash = hashlib.sha256(tensor_bytes).hexdigest()

        return {
            "batch_id": f"norm_{timestamp.replace(':', '').replace('-', '')}",
            "observation_timestamp": timestamp,
            "crs": "EPSG:4326",
            "grid_resolution_deg": 0.04,
            "lats": insat_grid.lats,
            "lons": insat_grid.lons,
            "shape": list(tensor.shape),
            "feature_names": FEATURE_ORDER,
            "quality_flag": overall_quality,
            "is_synthetic_replay": raw_batch.get("is_synthetic_replay", False),
            "tensor_hash": tensor_hash,
            "tensor_summary": {
                "min": float(tensor.min()),
                "max": float(tensor.max()),
                "mean": float(tensor.mean()),
            },
            "provenance_trail": [
                insat_grid.provenance.model_dump(),
                imdaa_grid.provenance.model_dump(),
                dem_grid.provenance.model_dump(),
            ],
        }
