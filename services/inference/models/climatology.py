"""
TRINETRA Forecast Models: Climatological Baseline
Provides historical diurnal and orographic convective priors for the Central Himalayas.
"""

import math
from typing import Dict
from .base_model import BaseModel, ModelPredictionOutput


class ClimatologyBaseline(BaseModel):
    def __init__(self):
        super().__init__(
            model_name="climatological-diurnal-prior",
            model_version="v0.1.0-climatology",
            model_type="baseline_heuristic",
        )

    def predict_cell(
        self,
        cell_features: Dict[str, float],
        horizon_minutes: int,
        utc_hour: int = 10,
        **kwargs
    ) -> ModelPredictionOutput:
        """
        Computes climatological base rate modulated by diurnal solar heating cycle and elevation.
        Peak convection in Himalayas occurs around 14:00 - 18:00 IST (08:30 - 12:30 UTC).
        """
        valid_hour = (utc_hour + int(horizon_minutes / 60)) % 24

        # Diurnal solar cycle weight peaking at 11:00 UTC (16:30 IST)
        diurnal_factor = max(0.2, math.cos((valid_hour - 11.0) * math.pi / 12.0))

        # Orographic elevation factor: elevations between 1000m - 2500m have highest thunderstorm frequency
        elev = cell_features.get("elevation", 1200.0)
        orographic_factor = math.exp(-math.pow(elev - 1600.0, 2) / (2 * math.pow(1200.0, 2)))

        # Base climatological probabilities for monsoon season
        ts_prob = round(float(min(0.65, 0.12 + 0.35 * diurnal_factor * orographic_factor)), 3)
        cb_prob = round(float(min(0.40, 0.04 + 0.22 * diurnal_factor * (elev / 3000.0))), 3)
        ff_prob = round(float(min(0.45, cb_prob * (cell_features.get("slope_deg", 25.0) / 45.0))), 3)

        max_prob = max(ts_prob, cb_prob, ff_prob)
        severity = "none"
        if max_prob >= 0.70:
            severity = "warning"
        elif max_prob >= 0.45:
            severity = "watch"
        elif max_prob >= 0.20:
            severity = "advisory"

        return ModelPredictionOutput(
            model_name=self.model_name,
            model_version=self.model_version,
            model_type=self.model_type,
            horizon_minutes=horizon_minutes,
            is_test_baseline=True,
            thunderstorm_prob=ts_prob,
            cloudburst_prob=cb_prob,
            flash_flood_prob=ff_prob,
            severity=severity,
            contributing_factors={
                "diurnal_cycle_weight": round(diurnal_factor, 3),
                "orographic_elevation_factor": round(orographic_factor, 3),
            },
        )
