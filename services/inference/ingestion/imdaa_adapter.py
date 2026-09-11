"""
TRINETRA Data Ingestion: IMDAA Atmospheric Model Adapter
Ingests Indian Monsoon Data Assimilation and Analysis (IMDAA) and numerical reanalysis grids.
Extracts Convective Available Potential Energy (CAPE), CIN, TPW, and Omega 500.
"""

import hashlib
from typing import Dict, Any
from .base_adapter import BaseAdapter, NormalizedObservationGrid, NormalizedFeatureChannel, BoundingBox


class ImdaaAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(source_name="IMDAA_REANALYSIS", sensor_or_model="NCMRWF_ANALYSIS_12KM")

    def ingest(self, raw_payload: Dict[str, Any], **kwargs) -> NormalizedObservationGrid:
        """
        Ingest IMDAA atmospheric parameters into standardized unit grids.
        """
        timestamp = raw_payload.get("observation_timestamp")
        if not timestamp:
            raise ValueError("IMDAA ingestion failed: missing observation_timestamp.")

        raw_bytes = str(raw_payload).encode("utf-8")
        file_hash = hashlib.sha256(raw_bytes).hexdigest()[:16]

        raw_bounds = raw_payload.get("bounds", {
            "min_lon": 77.5, "min_lat": 28.5, "max_lon": 81.0, "max_lat": 31.5
        })
        bounds = BoundingBox(**raw_bounds)

        lats = raw_payload.get("lats", [29.5, 30.0, 30.5, 31.0])
        lons = raw_payload.get("lons", [78.0, 78.5, 79.0, 79.5])
        grid_shape = [len(lats), len(lons)]

        cape_data = raw_payload.get("cape_j_kg")
        cin_data = raw_payload.get("cin_j_kg")
        tpw_data = raw_payload.get("tpw_mm")
        omega_data = raw_payload.get("omega_500_pa_s")

        if not cape_data or not tpw_data:
            raise ValueError("IMDAA adapter error: mandatory CAPE or TPW fields missing.")

        quality_flag = "nominal"
        if not cin_data or not omega_data:
            quality_flag = "degraded"

        channels: Dict[str, NormalizedFeatureChannel] = {}

        # 1. CAPE (J/kg)
        channels["cape"] = NormalizedFeatureChannel(
            channel_name="cape",
            standard_name="convective_available_potential_energy",
            unit="J/kg",
            shape=grid_shape,
            values=cape_data,
            valid_range=[0.0, 7000.0],
        )

        # 2. CIN (J/kg)
        if cin_data:
            channels["cin"] = NormalizedFeatureChannel(
                channel_name="cin",
                standard_name="convective_inhibition",
                unit="J/kg",
                shape=grid_shape,
                values=cin_data,
                valid_range=[-1000.0, 0.0],
            )

        # 3. Total Precipitable Water (mm)
        channels["tpw"] = NormalizedFeatureChannel(
            channel_name="tpw",
            standard_name="atmosphere_water_vapor_content",
            unit="mm",
            shape=grid_shape,
            values=tpw_data,
            valid_range=[0.0, 100.0],
        )

        # 4. Omega at 500 hPa (Pa/s)
        if omega_data:
            channels["omega_500"] = NormalizedFeatureChannel(
                channel_name="omega_500",
                standard_name="lagrangian_tendency_of_air_pressure_at_500hpa",
                unit="Pa/s",
                shape=grid_shape,
                values=omega_data,
                valid_range=[-5.0, 5.0],
            )

        provenance = self.build_provenance(
            observation_timestamp=timestamp,
            bounds=bounds,
            quality_flag=quality_flag,
            is_synthetic_replay=raw_payload.get("is_synthetic_replay", False),
            file_hash=file_hash,
        )

        return NormalizedObservationGrid(
            grid_id=f"imdaa_{timestamp.replace(':', '').replace('-', '')}",
            provenance=provenance,
            lats=lats,
            lons=lons,
            channels=channels,
        )
