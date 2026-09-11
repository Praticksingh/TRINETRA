"""
TRINETRA Forecast Models: Gradient / Decision Tree Baseline
Classical non-linear baseline mapping multi-sensor atmospheric and terrain features to calibrated probabilities.
"""

import math
from typing import Dict
from .base_model import BaseModel, ModelPredictionOutput


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, x))))


class TreeBaseline(BaseModel):
    def __init__(self):
        super().__init__(
            model_name="gradient-boosted-tree-baseline",
            model_version="v0.1.0-tree-baseline",
            model_type="baseline_tree",
        )

    def predict_cell(
        self,
        cell_features: Dict[str, float],
        horizon_minutes: int,
        **kwargs
    ) -> ModelPredictionOutput:
        """
        Decision-tree feature weighting:
        Logit_TS = w1*CAPE + w2*Cooling + w3*TPW - w4*CIN - decay(horizon)
        Logit_CB = w_ts + w_moisture + orographic_lift
        Logit_FF = Logit_CB + w_slope + w_twi
        """
        cape = cell_features.get("cape", 1500.0)
        cin = cell_features.get("cin", -30.0)
        tpw = cell_features.get("tpw", 40.0)
        cooling = cell_features.get("cooling_rate", 0.0)
        slope = cell_features.get("slope_deg", 15.0)
        twi = cell_features.get("twi", 8.0)

        # Horizon attenuation (forecast lead time uncertainty penalty)
        horizon_penalty = (horizon_minutes / 360.0) * 0.45

        # 1. Thunderstorm Logit
        ts_logit = (
            (cape / 1800.0) * 1.6
            + (abs(min(0.0, cooling)) / 12.0) * 1.4
            + (tpw / 50.0) * 0.9
            - (abs(cin) / 50.0) * 0.8
            - 2.2
            - horizon_penalty
        )
        ts_prob = round(float(_sigmoid(ts_logit)), 3)

        # 2. Cloudburst Logit (requires high moisture + severe updraft)
        cb_logit = (
            (cape / 2200.0) * 1.8
            + (tpw / 45.0) * 1.5
            + (abs(min(0.0, cooling)) / 10.0) * 1.3
            - 3.5
            - horizon_penalty * 1.2
        )
        cb_prob = round(float(_sigmoid(cb_logit)), 3)

        # 3. Flash Flood Logit (coupled atmospheric storm + steep terrain)
        ff_logit = (
            cb_logit * 0.7
            + (slope / 30.0) * 1.5
            + (twi / 10.0) * 0.8
            - 0.8
        )
        ff_prob = round(float(_sigmoid(ff_logit)), 3)

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
                "cape_importance": round(min(1.0, cape / 3500.0), 3),
                "cooling_rate_importance": round(min(1.0, abs(min(0.0, cooling)) / 25.0), 3),
                "slope_vulnerability": round(min(1.0, slope / 45.0), 3),
                "tpw_saturation": round(min(1.0, tpw / 65.0), 3),
            },
        )
