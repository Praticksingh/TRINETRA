"""
Hydrological River Basin Catalog and Precomputed Terrain Profiles for TRINETRA.
Covers priority Himalayan convective flash-flood corridors in Uttarakhand.
"""

from typing import Dict, List, Any

PILOT_BASINS: Dict[str, Dict[str, Any]] = {
    "mandakini": {
        "basin_id": "basin_mandakini",
        "name": "Mandakini River Basin",
        "key_settlements": ["Kedarnath", "Gaurikund", "Sonprayag", "Kund", "Rudraprayag"],
        "catchment_area_km2": 1640.0,
        "elevation_range_m": [610.0, 3850.0],
        "mean_slope_deg": 38.5,
        "confinement_rating": "EXTREME_GLACIAL_GORGE",
        "primary_hazard": "Glacial & Convective Cloudburst Flash Flood",
        "centroid": [79.06, 30.73],
        "representative_cell_id": "3073_7906",
        "hydrologic_vulnerability_score": 0.88,
        "critical_rainfall_threshold_mm_h": 65.0,
    },
    "bhagirathi": {
        "basin_id": "basin_bhagirathi",
        "name": "Upper Bhagirathi Basin",
        "key_settlements": ["Gangotri", "Harsil", "Bhatwari", "Uttarkashi", "Tehri"],
        "catchment_area_km2": 4200.0,
        "elevation_range_m": [650.0, 3600.0],
        "mean_slope_deg": 33.2,
        "confinement_rating": "STEEP_RIVERINE_VALLEY",
        "primary_hazard": "Rapid Orographic Flash Flood & Debris Torrent",
        "centroid": [78.44, 30.73],
        "representative_cell_id": "3073_7844",
        "hydrologic_vulnerability_score": 0.79,
        "critical_rainfall_threshold_mm_h": 75.0,
    },
    "alaknanda": {
        "basin_id": "basin_alaknanda",
        "name": "Alaknanda Basin (Chamoli-Joshimath)",
        "key_settlements": ["Badrinath", "Joshimath", "Pipalkoti", "Chamoli", "Karnaprayag"],
        "catchment_area_km2": 11080.0,
        "elevation_range_m": [750.0, 3950.0],
        "mean_slope_deg": 36.4,
        "confinement_rating": "DEEP_FAULTED_GORGE",
        "primary_hazard": "Side-Tributary Cloudburst Surge & River Blockage",
        "centroid": [79.35, 30.55],
        "representative_cell_id": "3055_7935",
        "hydrologic_vulnerability_score": 0.85,
        "critical_rainfall_threshold_mm_h": 70.0,
    },
    "ganga_foothills": {
        "basin_id": "basin_ganga_foothills",
        "name": "Ganga Foothills (Shivpuri-Rishikesh)",
        "key_settlements": ["Byasi", "Shivpuri", "Tapovan", "Rishikesh", "Haridwar"],
        "catchment_area_km2": 21500.0,
        "elevation_range_m": [290.0, 1400.0],
        "mean_slope_deg": 22.8,
        "confinement_rating": "FOOTHILL_RIPARIAN_TRANSITION",
        "primary_hazard": "Downstream River Surge & Campsite Inundation",
        "centroid": [78.39, 30.14],
        "representative_cell_id": "3012_7824",
        "hydrologic_vulnerability_score": 0.62,
        "critical_rainfall_threshold_mm_h": 85.0,
    },
}


def get_basin_by_id(basin_id: str) -> Dict[str, Any]:
    for key, basin in PILOT_BASINS.items():
        if key == basin_id.lower() or basin["basin_id"] == basin_id:
            return basin
    raise KeyError(f"Basin '{basin_id}' not found in pilot catalog.")


def list_all_basins() -> List[Dict[str, Any]]:
    return list(PILOT_BASINS.values())
