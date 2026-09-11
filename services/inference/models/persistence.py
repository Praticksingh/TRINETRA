"""
TRINETRA Forecast Models: Persistence Baseline
Assumes current observed convective and radar activity persists into future horizons with atmospheric decorrelation decay.
"""

import math
from typing import Dict
from .base_model import BaseModel, ModelPredictionOutput


class PersistenceBaseline(BaseModel):
    def __init__(self, decorrelation_half_life_min: float = 75.0):
        super().__init__(
            model_name="persistence-atmospheric-decay",
            model_version="v0.1.0-persistence",
            model_type="baseline_heuristic",
        )
        self.half_life = decorrelation_half_life_min

    def predict_cell(
        self,
        cell_features: Dict[str, float],
        horizon_minutes: int,
        **kwargs
    ) -> ModelPredictionOutput:
        """
        Projects current radar and cloud features forward with exponential decay: P(t) = P_0 * 2^(-t / T_half) + P_clim
        """
        # Current observational strength based on radar dBZ and cooling rate
        radar_dbz = cell_features.get("radar_dbz", 0.0)
        cooling_rate = cell_features.get("cooling_rate", 0.0)

        # Baseline observed intensity P_0
        initial_ts_prob = min(1.0, max(0.05, (radar_dbz / 55.0) + (abs(min(0.0, cooling_rate)) / 30.0)))
        initial_cb_prob = min(1.0, max(0.02, (radar_dbz / 65.0) * 0.8))
        initial_ff_prob = min(1.0, max(0.05, initial_cb_prob * (cell_features.get("slope_deg", 15.0) / 40.0)))

        # Decay factor over forecast horizon
        decay = math.pow(2.0, -horizon_minutes / self.half_life)
        climatology_floor = 0.08

        ts_prob = round(float(min(1.0, max(0.0, initial_ts_prob * decay + climatology_floor * (1.0 - decay)))), 3)
        cb_prob = round(float(min(1.0, max(0.0, initial_cb_prob * decay + 0.03 * (1.0 - decay)))), 3)
        ff_prob = round(float(min(1.0, max(0.0, initial_ff_prob * decay + 0.04 * (1.0 - decay)))), 3)

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
                "current_reflectivity_dbz": radar_dbz,
                "convective_decay_factor": round(decay, 3),
            },
        )
