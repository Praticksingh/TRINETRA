"""
Hydrometeorological Risk Fusion Engine for TRINETRA.
Combines dynamic convective precipitation probabilities with static DEM terrain susceptibility
to produce a calibrated, explainable Flash-Flood Risk score.

CRITICAL PROTOCOL:
Strictly presented as statistical risk estimation, NOT deterministic hydrological truth.
Explicitly separates meteorological probability from terrain vulnerability.
"""

from typing import Dict, Any, List, Optional
import numpy as np


class FlashFloodRiskFusion:
    """
    Transparent hydrometeorological risk engine fusing:
    1. Meteorological Forcing (P_meteo from Cloudburst and Thunderstorm heads)
    2. Static Terrain Susceptibility (S_terrain from DEM slope, TWI, relief)
    3. Non-linear Hydraulic Confinement Surge Interaction (P_meteo * S_terrain)
    """

    MODEL_VERSION = "v1.0.0-terrain-fusion"
    DISCLAIMER = (
        "STATISTICAL RISK ESTIMATION — NOT DETERMINISTIC HYDROLOGICAL TRUTH. "
        "Hydrometeorological indicator of catchment flash-flood susceptibility; "
        "does not simulate 1D/2D hydraulic hydrodynamic inundation or dam failure."
    )
    LIMITATIONS = [
        "Hydrometeorological proxy model: estimates surge potential without 2D shallow-water hydrodynamic flow equations.",
        "Infiltration capacity parameterized via Topographic Wetness Index (TWI) rather than live subsurface TDR soil probes.",
        "River discharge cross-sections and culvert capacities are unmodeled; local debris dams can alter surge behavior.",
        "Valid only for high-gradient Himalayan catchments (Uttarakhand / Himachal Pradesh pilot areas).",
    ]

    def __init__(
        self,
        weight_meteo: float = 0.40,
        weight_terrain: float = 0.30,
        weight_interaction: float = 0.30,
    ):
        self.w_meteo = weight_meteo
        self.w_terrain = weight_terrain
        self.w_interaction = weight_interaction

    def calculate_risk(
        self,
        cloudburst_prob: float,
        thunderstorm_prob: float,
        slope_deg: float,
        twi: float,
        elevation_m: float,
        antecedent_moisture_index: float = 0.75,
    ) -> Dict[str, Any]:
        """
        Calculates terrain-aware flash-flood risk with full dual-factor attribution.
        """
        # 1. Meteorological Forcing Component (P_meteo)
        # Cloudburst carries 75% weight due to extreme rainfall intensity (>=100 mm/h)
        p_cloudburst = float(np.clip(cloudburst_prob, 0.0, 1.0))
        p_thunderstorm = float(np.clip(thunderstorm_prob, 0.0, 1.0))
        p_meteo = float(np.clip(0.75 * p_cloudburst + 0.25 * p_thunderstorm, 0.0, 1.0))

        # 2. Static Terrain Susceptibility Component (S_terrain)
        # Normalize slope (35 deg max reference), TWI (15 max), elevation
        norm_slope = float(np.clip(slope_deg / 40.0, 0.0, 1.0))
        norm_twi = float(np.clip((twi - 2.0) / 12.0, 0.0, 1.0))
        s_terrain = float(np.clip(0.55 * norm_slope + 0.45 * norm_twi, 0.0, 1.0))

        # 3. Non-linear Hydraulic Confinement Surge Interaction
        # Intense rainfall on steep confined valleys generates catastrophic runoff waves
        surge_interaction = float((p_meteo * s_terrain) ** 0.8)

        # 4. Composite Risk Score
        raw_risk = (
            self.w_meteo * p_meteo
            + self.w_terrain * s_terrain
            + self.w_interaction * surge_interaction
        ) * (0.85 + 0.15 * antecedent_moisture_index)

        flash_flood_risk = float(np.clip(raw_risk, 0.0, 1.0))

        # Risk Classification
        if flash_flood_risk >= 0.70:
            severity = "EXTREME_SURGE_WARNING"
            threat_label = "CRITICAL FLASH-FLOOD THREAT"
            color_cue = "ROSE"
            icon_shape = "TRIANGLE_EXCLAMATION"
        elif flash_flood_risk >= 0.45:
            severity = "HIGH_SURGE_WATCH"
            threat_label = "HIGH FLASH-FLOOD RISK"
            color_cue = "AMBER"
            icon_shape = "DIAMOND_ALERT"
        elif flash_flood_risk >= 0.20:
            severity = "MODERATE_MONITORING"
            threat_label = "MODERATE RUNOFF RISK"
            color_cue = "YELLOW"
            icon_shape = "CIRCLE_INFO"
        else:
            severity = "LOW"
            threat_label = "LOW HYDROLOGICAL RISK"
            color_cue = "EMERALD"
            icon_shape = "CHECK_CIRCLE"

        # Dominant Factor Attribution
        if p_meteo > s_terrain + 0.20:
            dominant_driver = "METEOROLOGY_DRIVEN"
            explanation = f"Intense atmospheric rainfall forcing (Cloudburst P={round(p_cloudburst, 2)}) is primary driver."
        elif s_terrain > p_meteo + 0.20:
            dominant_driver = "TERRAIN_AMPLIFIED"
            explanation = f"Steep catchment gradient ({round(slope_deg, 1)}°) and convergent drainage (TWI={round(twi, 1)}) amplify moderate rain into runoff."
        else:
            dominant_driver = "COMPOUND_SURGE"
            explanation = f"Severe rainfall combined with steep valley topography creates compound flash-flood risk."

        return {
            "model_version": self.MODEL_VERSION,
            "flash_flood_risk_score": round(flash_flood_risk, 3),
            "severity_level": severity,
            "threat_label": threat_label,
            "color_cue": color_cue,
            "icon_shape": icon_shape,
            "dominant_driver": dominant_driver,
            "explanation": explanation,
            "dual_factor_attribution": {
                "meteorological_forcing": {
                    "score": round(p_meteo, 3),
                    "cloudburst_prob": round(p_cloudburst, 3),
                    "thunderstorm_prob": round(p_thunderstorm, 3),
                    "description": "Dynamic atmospheric precipitation forcing",
                },
                "terrain_susceptibility": {
                    "score": round(s_terrain, 3),
                    "slope_deg": round(slope_deg, 1),
                    "twi": round(twi, 2),
                    "elevation_m": round(elevation_m, 1),
                    "description": "Static topographic vulnerability (DEM slope + drainage concentration)",
                },
                "surge_interaction_term": round(surge_interaction, 3),
                "antecedent_moisture_multiplier": round(antecedent_moisture_index, 2),
            },
            "disclaimer": self.DISCLAIMER,
            "limitations": self.LIMITATIONS,
            "validation_status": "PILOT_VALIDATION_ACTIVE",
            "deterministic_hydrology": False,
        }
