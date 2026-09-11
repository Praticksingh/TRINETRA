"""
TRINETRA Data Ingestion: Deterministic Synthetic Replay Generator
Generates reproducible, synchronized multi-sensor batches for development, testing, and demos.
All payloads are strictly tagged with is_synthetic_replay = True.
"""

from datetime import datetime, timezone
from typing import Dict, Any


def generate_synthetic_nowcast_payload(
    observation_timestamp: str = "2026-09-11T08:30:00Z",
    event_scenario: str = "HIMALAYAN_SEVERE_CONVECTIVE_EVENT_01"
) -> Dict[str, Any]:
    """
    Produces deterministic synthetic satellite and atmospheric arrays
    over the Uttarakhand pilot region (77.5° - 81.0° E, 28.5° - 31.5° N).
    """
    lats = [29.5, 30.0, 30.5, 31.0]
    lons = [78.0, 78.5, 79.0, 79.5]

    # Simulated deep convective cluster centered over Kedarnath (lat ~30.7, lon ~79.0)
    # TIR1 Brightness Temp: Low temperatures (e.g. 205K ~ -68°C) indicate deep convective cloud tops
    tir1_bt_k = [
        [285.0, 278.0, 260.0, 245.0],
        [275.0, 252.0, 228.0, 218.0],
        [260.0, 235.0, 205.0, 212.0], # Core over Kedarnath
        [250.0, 220.0, 210.0, 225.0],
    ]

    tir2_bt_k = [
        [283.5, 276.2, 257.8, 242.5],
        [273.2, 249.5, 225.1, 215.3],
        [258.0, 232.4, 202.1, 209.4],
        [247.5, 217.8, 207.5, 222.0],
    ]

    wv_bt_k = [
        [245.0, 242.0, 236.0, 230.0],
        [240.0, 232.0, 222.0, 218.0],
        [235.0, 224.0, 212.0, 215.0],
        [232.0, 220.0, 214.0, 220.0],
    ]

    # Rapid convective cooling rate (K/hr): negative values indicate cloud vertical growth
    cooling_rate_k_hr = [
        [-2.5, -6.0, -10.5, -14.2],
        [-5.0, -11.4, -18.2, -19.5],
        [-8.2, -16.5, -21.4, -18.0], # Extreme updraft over Kedarnath
        [-6.5, -14.0, -17.5, -12.0],
    ]

    # Atmospheric Stability: CAPE (J/kg)
    cape_j_kg = [
        [1850.0, 2200.0, 2650.0, 2900.0],
        [2100.0, 2650.0, 3150.0, 3400.0],
        [2400.0, 2950.0, 3850.0, 3600.0], # Extreme instability
        [2200.0, 2750.0, 3300.0, 3100.0],
    ]

    cin_j_kg = [
        [-45.0, -32.0, -18.0, -8.0],
        [-38.0, -22.0, -12.0, -5.0],
        [-25.0, -15.0, -4.0, -2.0], # Broken capping inversion
        [-28.0, -18.0, -6.0, -4.0],
    ]

    tpw_mm = [
        [44.0, 48.5, 52.0, 54.5],
        [48.0, 53.2, 58.4, 61.0],
        [51.5, 56.8, 64.2, 62.5], # High column moisture
        [50.0, 55.0, 60.5, 58.0],
    ]

    omega_500_pa_s = [
        [-0.15, -0.42, -0.85, -1.20],
        [-0.35, -0.92, -1.65, -1.88],
        [-0.60, -1.45, -2.40, -2.10], # Strong vertical updrafts
        [-0.45, -1.15, -1.75, -1.40],
    ]

    return {
        "event_scenario": event_scenario,
        "is_synthetic_replay": True,
        "observation_timestamp": observation_timestamp,
        "bounds": {
            "min_lon": 77.5,
            "min_lat": 28.5,
            "max_lon": 81.0,
            "max_lat": 31.5,
        },
        "lats": lats,
        "lons": lons,
        "insat": {
            "observation_timestamp": observation_timestamp,
            "is_synthetic_replay": True,
            "tir1_bt_k": tir1_bt_k,
            "tir2_bt_k": tir2_bt_k,
            "wv_bt_k": wv_bt_k,
            "cooling_rate_k_hr": cooling_rate_k_hr,
        },
        "imdaa": {
            "observation_timestamp": observation_timestamp,
            "is_synthetic_replay": True,
            "cape_j_kg": cape_j_kg,
            "cin_j_kg": cin_j_kg,
            "tpw_mm": tpw_mm,
            "omega_500_pa_s": omega_500_pa_s,
        },
        "dem": {
            "observation_timestamp": "2026-01-01T00:00:00Z",
            "is_synthetic_replay": False,
        }
    }
