"""
Pytest Test Suite for Phase 6: Terrain-Aware Flash-Flood Risk Layer.
Verifies:
1. DEM slope, aspect, and Topographic Wetness Index (TWI) calculation
2. Terrain susceptibility scoring bounds and logic
3. Risk fusion monotonicity (increasing rain/slope strictly increases risk)
4. Explicit dual-factor decomposition (meteorological vs. terrain)
5. Anti-hallucination protocol: mandatory disclaimers and limitations
6. FastAPI endpoints for terrain risk fusion and river basin catalog
"""

import sys
from pathlib import Path

# Ensure services/inference is on sys.path
inference_dir = Path(__file__).resolve().parent
if str(inference_dir) not in sys.path:
    sys.path.insert(0, str(inference_dir))
root_dir = inference_dir.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import pytest
import numpy as np
from fastapi.testclient import TestClient

from terrain.dem_processor import DEMProcessor
from terrain.risk_fusion import FlashFloodRiskFusion
from terrain.basin_catalog import PILOT_BASINS, get_basin_by_id, list_all_basins
from main import app

client = TestClient(app)


def test_dem_slope_and_aspect_calculation():
    """Verify slope gradient computation on flat vs inclined surfaces."""
    processor = DEMProcessor(cell_size_meters=30.0)

    # 1. Flat terrain: all elevations equal 500m
    flat_elev = np.full((10, 10), 500.0, dtype=np.float32)
    slope_flat, aspect_flat = processor.compute_slope_and_aspect(flat_elev)
    assert np.allclose(slope_flat, 0.0, atol=1e-3)

    # 2. Known uniform incline: rise of 30m over 30m cell in X direction (45 deg)
    incline = np.zeros((10, 10), dtype=np.float32)
    for col in range(10):
        incline[:, col] = col * 30.0  # 30m rise per cell

    slope_inc, aspect_inc = processor.compute_slope_and_aspect(incline)
    # Inner cells where central difference applies: (col+1 - col-1)*30 / (2*30) = 30/30 = 1.0 -> 45 degrees
    assert np.allclose(slope_inc[:, 1:-1], 45.0, atol=1.0)


def test_dem_twi_bounds_and_behavior():
    """Verify TWI bounds and physical behavior (convergent valley vs ridge)."""
    processor = DEMProcessor()
    # High slope (ridge) vs low slope (valley floor)
    slope_grid = np.array([
        [40.0, 42.0],
        [2.0, 3.0],
    ], dtype=np.float32)

    twi = processor.compute_twi(slope_grid)
    # Valley floor (low slope) must have higher TWI than steep ridge
    assert twi[1, 0] > twi[0, 0]
    # Bound check
    assert np.all(twi >= 2.0)
    assert np.all(twi <= 18.0)


def test_terrain_susceptibility_scoring():
    """Verify terrain susceptibility index S_terrain bounds and weighting."""
    processor = DEMProcessor()
    # Steep Himalayan ridge (Kedarnath proxy)
    steep_elev = np.zeros((15, 15), dtype=np.float32)
    for r in range(15):
        steep_elev[r, :] = 2000.0 + r * 120.0  # Very steep rise

    res_steep = processor.calculate_terrain_susceptibility(steep_elev)
    assert 0.0 <= res_steep["terrain_susceptibility_score"] <= 1.0
    assert res_steep["mean_slope_deg"] > 30.0
    assert res_steep["terrain_susceptibility_score"] > 0.50

    # Gentle foothill plain (Haridwar proxy)
    flat_elev = np.full((15, 15), 300.0, dtype=np.float32)
    res_flat = processor.calculate_terrain_susceptibility(flat_elev)
    assert res_flat["terrain_susceptibility_score"] < res_steep["terrain_susceptibility_score"]


def test_risk_fusion_monotonicity():
    """Verify that increasing rainfall or slope strictly increases flash-flood risk."""
    fusion = FlashFloodRiskFusion()

    # Increasing cloudburst probability with fixed terrain
    r_low_rain = fusion.calculate_risk(
        cloudburst_prob=0.10, thunderstorm_prob=0.20, slope_deg=35.0, twi=10.0, elevation_m=2000.0
    )
    r_high_rain = fusion.calculate_risk(
        cloudburst_prob=0.85, thunderstorm_prob=0.90, slope_deg=35.0, twi=10.0, elevation_m=2000.0
    )
    assert r_high_rain["flash_flood_risk_score"] > r_low_rain["flash_flood_risk_score"]

    # Increasing slope with fixed rainfall
    r_gentle = fusion.calculate_risk(
        cloudburst_prob=0.50, thunderstorm_prob=0.50, slope_deg=8.0, twi=8.0, elevation_m=500.0
    )
    r_steep = fusion.calculate_risk(
        cloudburst_prob=0.50, thunderstorm_prob=0.50, slope_deg=42.0, twi=8.0, elevation_m=3000.0
    )
    assert r_steep["flash_flood_risk_score"] > r_gentle["flash_flood_risk_score"]


def test_dual_factor_attribution_separation():
    """Verify clean mathematical separation of meteorological forcing vs terrain susceptibility."""
    fusion = FlashFloodRiskFusion()

    # Case A: Heavy rain on flat plain -> METEOROLOGY_DRIVEN
    res_meteo = fusion.calculate_risk(
        cloudburst_prob=0.90, thunderstorm_prob=0.85, slope_deg=4.0, twi=6.0, elevation_m=350.0
    )
    attr_a = res_meteo["dual_factor_attribution"]
    assert attr_a["meteorological_forcing"]["score"] > attr_a["terrain_susceptibility"]["score"]
    assert res_meteo["dominant_driver"] == "METEOROLOGY_DRIVEN"

    # Case B: Moderate rain on ultra-steep Himalayan ravine -> TERRAIN_AMPLIFIED
    res_terrain = fusion.calculate_risk(
        cloudburst_prob=0.20, thunderstorm_prob=0.25, slope_deg=45.0, twi=14.0, elevation_m=3200.0
    )
    attr_b = res_terrain["dual_factor_attribution"]
    assert attr_b["terrain_susceptibility"]["score"] > attr_b["meteorological_forcing"]["score"]
    assert res_terrain["dominant_driver"] == "TERRAIN_AMPLIFIED"


def test_mandatory_disclaimer_and_limitations():
    """Verify anti-hallucination protocol: disclaimer and non-deterministic flags."""
    fusion = FlashFloodRiskFusion()
    res = fusion.calculate_risk(
        cloudburst_prob=0.70, thunderstorm_prob=0.80, slope_deg=38.0, twi=12.0, elevation_m=2400.0
    )

    # Must be explicitly labeled as statistical risk, not deterministic hydrology
    assert "STATISTICAL RISK ESTIMATION" in res["disclaimer"]
    assert res["deterministic_hydrology"] is False
    assert len(res["limitations"]) >= 3
    assert res["validation_status"] == "PILOT_VALIDATION_ACTIVE"


def test_basin_catalog():
    """Verify river basin catalog holds key Himalayan pilot catchments."""
    basins = list_all_basins()
    assert len(basins) >= 4

    mandakini = get_basin_by_id("basin_mandakini")
    assert mandakini["name"] == "Mandakini River Basin"
    assert "Kedarnath" in mandakini["key_settlements"]
    assert mandakini["mean_slope_deg"] > 35.0

    with pytest.raises(KeyError):
        get_basin_by_id("non_existent_basin")


def test_terrain_endpoints_via_api():
    """Verify FastAPI terrain risk endpoints."""
    # 1. POST /api/v1/terrain/flood-risk
    resp = client.post(
        "/api/v1/terrain/flood-risk",
        json={
            "cell_id": "3073_7906",
            "cloudburst_probability": 0.75,
            "thunderstorm_probability": 0.85,
            "slope_deg": 46.2,
            "twi": 14.8,
            "elevation_m": 3583.0,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["cell_id"] == "3073_7906"
    assert "flash_flood_risk_score" in data
    assert 0.0 <= data["flash_flood_risk_score"] <= 1.0
    assert "dual_factor_attribution" in data
    assert data["deterministic_hydrology"] is False
    assert "disclaimer" in data

    # 2. GET /api/v1/terrain/basins
    resp_basins = client.get("/api/v1/terrain/basins")
    assert resp_basins.status_code == 200
    b_data = resp_basins.json()
    assert b_data["count"] >= 4
    assert len(b_data["basins"]) >= 4

    # 3. GET /api/v1/terrain/basin/mandakini
    resp_single = client.get("/api/v1/terrain/basin/mandakini")
    assert resp_single.status_code == 200
    assert resp_single.json()["name"] == "Mandakini River Basin"
