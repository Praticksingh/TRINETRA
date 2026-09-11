"""
Test suite for TRINETRA ML Inference Service
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "trinetra-ml-inference"
    assert "model_version" in data


def test_predict_nowcast():
    payload = {
        "region_id": "IN-UT",
        "include_xai": True
    }
    response = client.post("/api/v1/nowcast/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_synthetic_replay"] is True
    assert len(data["predictions"]) > 0
    cell = data["predictions"][0]
    assert "probabilities" in cell
    assert cell["probabilities"]["thunderstorm"] >= 0.0
    assert cell["probabilities"]["thunderstorm"] <= 1.0
    assert "terrain_factors" in cell
    assert "xai_attribution" in cell
