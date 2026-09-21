"""
TRINETRA Historical & Operational Disaster Scenarios Catalog
Provides benchmark meteorological profiles for live hackathon demonstration,
testing, and sensitivity analysis against real Himalayan extreme convective events.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone


SCENARIOS_CATALOG: Dict[str, Dict[str, Any]] = {
    "kedarnath_2013": {
        "scenario_id": "kedarnath_2013",
        "name": "2013 Kedarnath Convective Cloudburst & Glacial Surge",
        "date": "2013-06-16T17:30:00Z",
        "focal_region": "Upper Mandakini / Kedarnath Valley",
        "target_cell_id": "3073_7906",
        "key_hazards": ["cloudburst", "flash_flood"],
        "description": (
            "Extreme orographic convection with intense IWV moisture convergence, "
            "explosive CTT cooling rate (-21.4 K/hr), and catastrophic gorge runoff along steep cirques."
        ),
        "meteorological_profile": {
            "tir1_bt_k": 198.5,
            "btd_split": 3.8,
            "cooling_rate_k_hr": -21.4,
            "cape_j_kg": 3850.0,
            "cin_j_kg": -12.0,
            "tpw_iwv_mm": 64.2,
            "omega_ascent": -1.8,
            "elevation_m": 3583.0,
            "slope_deg": 46.2,
            "twi": 14.8,
        },
        "probabilities": {
            "thunderstorm": 0.88,
            "cloudburst": 0.82,
            "flash_flood": 0.94,
        },
        "severity": "critical",
    },
    "chamoli_2021": {
        "scenario_id": "chamoli_2021",
        "name": "2021 Chamoli Rishiganga Gorge Surge",
        "date": "2021-02-07T10:00:00Z",
        "focal_region": "Rishiganga - Dhauliganga - Alaknanda Valley",
        "target_cell_id": "3055_7935",
        "key_hazards": ["flash_flood", "thunderstorm"],
        "description": (
            "Steep gorge hydraulic channeling with heavy antecedent moisture, "
            "abrupt runoff concentration in confined river corridors, and high kinetic head."
        ),
        "meteorological_profile": {
            "tir1_bt_k": 218.0,
            "btd_split": 2.6,
            "cooling_rate_k_hr": -17.8,
            "cape_j_kg": 2750.0,
            "cin_j_kg": -24.0,
            "tpw_iwv_mm": 56.4,
            "omega_ascent": -1.3,
            "elevation_m": 1890.0,
            "slope_deg": 41.5,
            "twi": 11.7,
        },
        "probabilities": {
            "thunderstorm": 0.74,
            "cloudburst": 0.68,
            "flash_flood": 0.86,
        },
        "severity": "warning",
    },
    "fair_weather_nominal": {
        "scenario_id": "fair_weather_nominal",
        "name": "Nominal Pre-Monsoon Afternoon (Fair Weather)",
        "date": "2026-05-15T14:00:00Z",
        "focal_region": "Dehradun - Upper Gangetic Plains",
        "target_cell_id": "2994_7816",
        "key_hazards": [],
        "description": (
            "Stable atmospheric boundary layer with strong CIN cap (-68 J/kg), "
            "negligible updraft cooling, low moisture flux convergence, and nominal flood susceptibility."
        ),
        "meteorological_profile": {
            "tir1_bt_k": 288.0,
            "btd_split": 0.8,
            "cooling_rate_k_hr": -2.2,
            "cape_j_kg": 1200.0,
            "cin_j_kg": -68.0,
            "tpw_iwv_mm": 24.5,
            "omega_ascent": 0.3,
            "elevation_m": 250.0,
            "slope_deg": 4.2,
            "twi": 6.8,
        },
        "probabilities": {
            "thunderstorm": 0.22,
            "cloudburst": 0.08,
            "flash_flood": 0.15,
        },
        "severity": "advisory",
    },
}


def list_scenarios() -> List[Dict[str, Any]]:
    return list(SCENARIOS_CATALOG.values())


def get_scenario(scenario_id: str) -> Dict[str, Any]:
    if scenario_id not in SCENARIOS_CATALOG:
        raise KeyError(f"Scenario '{scenario_id}' not found. Available: {list(SCENARIOS_CATALOG.keys())}")
    return SCENARIOS_CATALOG[scenario_id]
