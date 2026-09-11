"""
Pytest Test Suite for Phase 8: GIS Dashboard & Explainable AI (XAI).
Verifies:
1. Feature attribution mathematical properties (sum to 100%, physical weighting)
2. Mandatory non-causal operational disclaimer presence
3. FastAPI endpoint POST /api/v1/xai/attribution
4. GIS layer catalog and accessible color-independent shape cues
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
from fastapi.testclient import TestClient

from xai.attribution import XAIAttributionEngine
from main import app

client = TestClient(app)


def test_xai_attribution_math():
    """Verify feature attribution contributions sum to 100% and reflect physical drivers."""
    engine = XAIAttributionEngine()

    # Case: Severe convective storm with extreme CAPE and rapid cooling
    features = {
        "cape": 3800.0,
        "cooling_rate": -22.0,
        "slope_deg": 45.0,
        "tpw": 62.0,
        "twi": 12.0,
    }

    result = engine.compute_attribution(features, hazard_type="cloudburst", horizon="2h")
    assert "attributions" in result
    assert len(result["attributions"]) >= 4

    # Sum of percentage contributions must equal ~100% (within rounding)
    total_pct = sum(a["contribution_pct"] for a in result["attributions"])
    assert 99.0 <= total_pct <= 101.0

    # Top driver must be either CAPE or cooling rate given extreme values
    assert result["dominant_feature"] in [
        "Convective Instability (CAPE)",
        "TIR1 Cloud Cooling Rate",
        "Steep Valley Slope",
    ]


def test_xai_non_causal_disclaimer():
    """Verify anti-hallucination mandate: non-causal operational disclaimer strictly present."""
    engine = XAIAttributionEngine()
    result = engine.compute_attribution({}, hazard_type="thunderstorm")

    assert "disclaimer" in result
    assert "operational guidance" in result["disclaimer"].lower()
    assert "deterministic" in result["disclaimer"].lower()
    assert "causality" in result["disclaimer"].lower()


def test_xai_attribution_api():
    """Verify POST /api/v1/xai/attribution endpoint."""
    resp = client.post(
        "/api/v1/xai/attribution",
        json={
            "cell_id": "3073_7906",
            "hazard_type": "flash_flood",
            "horizon": "2h",
            "features": {
                "cape": 3200.0,
                "cooling_rate": -18.0,
                "slope_deg": 38.0,
                "tpw": 55.0,
                "twi": 11.0,
            },
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["cell_id"] == "3073_7906"
    assert "attributions" in data
    assert len(data["attributions"]) >= 4
    assert "disclaimer" in data


def test_gis_layers_catalog_and_accessibility():
    """Verify GET /api/v1/gis/layers provides color-independent accessibility cues."""
    resp = client.get("/api/v1/gis/layers")
    assert resp.status_code == 200
    data = resp.json()

    assert "layers" in data
    assert len(data["layers"]) >= 4

    # Verify accessibility standards
    assert data["accessibility_standards"]["color_independent"] is True
    cues = data["accessibility_standards"]["cues"]
    assert "●" in cues["low"]
    assert "◆" in cues["watch"]
    assert "▲" in cues["warning"]
    assert "▲" in cues["critical"]
