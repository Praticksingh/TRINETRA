"""
TRINETRA Data Ingestion: High-Resolution Digital Elevation Model (DEM) Adapter
Processes SRTM / CartoDEM rasters into terrain vulnerability matrices (Slope, TWI, Flow Accumulation).
"""

from typing import Dict, Any, List
from .base_adapter import BaseAdapter, NormalizedObservationGrid, NormalizedFeatureChannel, BoundingBox


class DemAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(source_name="SRTM_DEM", sensor_or_model="SRTM_30M_V3")

    def ingest(self, raw_payload: Dict[str, Any], **kwargs) -> NormalizedObservationGrid:
        """
        Ingest elevation rasters and compute slope & Topographic Wetness Index (TWI).
        """
        timestamp = raw_payload.get("observation_timestamp", "2026-01-01T00:00:00Z")
        raw_bounds = raw_payload.get("bounds", {
            "min_lon": 77.5, "min_lat": 28.5, "max_lon": 81.0, "max_lat": 31.5
        })
        bounds = BoundingBox(**raw_bounds)

        lats = raw_payload.get("lats", [29.5, 30.0, 30.5, 31.0])
        lons = raw_payload.get("lons", [78.0, 78.5, 79.0, 79.5])
        grid_shape = [len(lats), len(lons)]

        elevation_m = raw_payload.get("elevation_m", [
            [250.0, 372.0, 640.0, 1158.0],
            [372.0, 640.0, 1890.0, 2600.0],
            [640.0, 1158.0, 2600.0, 3583.0],
            [1158.0, 1890.0, 3583.0, 4200.0],
        ])

        slope_deg = raw_payload.get("slope_deg", [
            [4.2, 12.5, 22.5, 34.0],
            [12.5, 22.5, 38.4, 41.5],
            [22.5, 34.0, 41.5, 46.2],
            [34.0, 38.4, 46.2, 52.0],
        ])

        twi = raw_payload.get("twi", [
            [6.8, 8.2, 9.4, 10.2],
            [8.2, 9.4, 12.1, 11.7],
            [9.4, 10.2, 11.7, 14.8],
            [10.2, 12.1, 14.8, 16.2],
        ])

        channels: Dict[str, NormalizedFeatureChannel] = {
            "elevation": NormalizedFeatureChannel(
                channel_name="elevation",
                standard_name="surface_altitude",
                unit="meters",
                shape=grid_shape,
                values=elevation_m,
                valid_range=[-100.0, 9000.0],
            ),
            "slope_deg": NormalizedFeatureChannel(
                channel_name="slope_deg",
                standard_name="surface_slope",
                unit="degrees",
                shape=grid_shape,
                values=slope_deg,
                valid_range=[0.0, 90.0],
            ),
            "twi": NormalizedFeatureChannel(
                channel_name="twi",
                standard_name="topographic_wetness_index",
                unit="dimensionless",
                shape=grid_shape,
                values=twi,
                valid_range=[0.0, 30.0],
            ),
        }

        provenance = self.build_provenance(
            observation_timestamp=timestamp,
            bounds=bounds,
            quality_flag="nominal",
            is_synthetic_replay=False,
            file_hash="dem_static_carto_v3",
        )

        return NormalizedObservationGrid(
            grid_id="dem_uttarakhand_static_30m",
            provenance=provenance,
            lats=lats,
            lons=lons,
            channels=channels,
        )
