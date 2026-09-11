"""
TRINETRA Data Ingestion: INSAT-3DR Satellite Adapter
Ingests geostationary thermal infrared and water vapor radiances from INSAT-3DR (MOSDAC).
Extracts Brightness Temperature, Split-Window BTD, and Cloud-Top Cooling Rate.
"""

import hashlib
from typing import Dict, Any, List
from .base_adapter import BaseAdapter, NormalizedObservationGrid, NormalizedFeatureChannel, BoundingBox


class InsatAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(source_name="INSAT_3DR", sensor_or_model="IMAGER_SOUNDER")

    def ingest(self, raw_payload: Dict[str, Any], **kwargs) -> NormalizedObservationGrid:
        """
        Processes multi-spectral infrared channels into normalized grids.
        """
        timestamp = raw_payload.get("observation_timestamp")
        if not timestamp:
            raise ValueError("INSAT ingestion failed: missing observation_timestamp in header.")

        raw_bytes = str(raw_payload).encode("utf-8")
        file_hash = hashlib.sha256(raw_bytes).hexdigest()[:16]

        raw_bounds = raw_payload.get("bounds", {
            "min_lon": 77.5, "min_lat": 28.5, "max_lon": 81.0, "max_lat": 31.5
        })
        bounds = BoundingBox(**raw_bounds)

        lats = raw_payload.get("lats", [29.5, 30.0, 30.5, 31.0])
        lons = raw_payload.get("lons", [78.0, 78.5, 79.0, 79.5])

        # Channel 1: TIR1 Brightness Temperature (10.8 µm)
        tir1_data = raw_payload.get("tir1_bt_k")
        # Channel 2: TIR2 Brightness Temperature (12.0 µm)
        tir2_data = raw_payload.get("tir2_bt_k")
        # Channel 3: Water Vapor Channel (6.8 µm)
        wv_data = raw_payload.get("wv_bt_k")
        # Channel 4: Cloud-top Cooling Rate (K/hr)
        cooling_data = raw_payload.get("cooling_rate_k_hr")

        quality_flag = "nominal"
        if not tir1_data:
            quality_flag = "missing_channels"
            raise ValueError("INSAT adapter error: mandatory TIR1 channel missing.")

        if not tir2_data or not wv_data:
            quality_flag = "degraded"

        grid_shape = [len(lats), len(lons)]

        channels: Dict[str, NormalizedFeatureChannel] = {}

        # 1. TIR1 Brightness Temperature
        channels["bt_tir1"] = NormalizedFeatureChannel(
            channel_name="bt_tir1",
            standard_name="brightness_temperature_10_8um",
            unit="Kelvin",
            shape=grid_shape,
            values=tir1_data,
            valid_range=[180.0, 340.0],
        )

        # 2. Split Window Difference: BTD = TIR1 - TIR2
        if tir2_data:
            btd_values = [
                [round(t1 - t2, 2) for t1, t2 in zip(r1, r2)]
                for r1, r2 in zip(tir1_data, tir2_data)
            ]
            channels["btd_split"] = NormalizedFeatureChannel(
                channel_name="btd_split",
                standard_name="split_window_brightness_temperature_difference",
                unit="Kelvin",
                shape=grid_shape,
                values=btd_values,
                valid_range=[-10.0, 15.0],
            )

        # 3. Water Vapor Channel
        if wv_data:
            channels["bt_wv"] = NormalizedFeatureChannel(
                channel_name="bt_wv",
                standard_name="brightness_temperature_water_vapor_6_8um",
                unit="Kelvin",
                shape=grid_shape,
                values=wv_data,
                valid_range=[200.0, 270.0],
            )

        # 4. Cloud-Top Cooling Rate (Convective Updraft Growth)
        if cooling_data:
            channels["cooling_rate"] = NormalizedFeatureChannel(
                channel_name="cooling_rate",
                standard_name="cloud_top_temperature_cooling_rate",
                unit="K/hr",
                shape=grid_shape,
                values=cooling_data,
                valid_range=[-50.0, 10.0],
            )

        provenance = self.build_provenance(
            observation_timestamp=timestamp,
            bounds=bounds,
            quality_flag=quality_flag,
            is_synthetic_replay=raw_payload.get("is_synthetic_replay", False),
            file_hash=file_hash,
        )

        return NormalizedObservationGrid(
            grid_id=f"insat_{timestamp.replace(':', '').replace('-', '')}",
            provenance=provenance,
            lats=lats,
            lons=lons,
            channels=channels,
        )
