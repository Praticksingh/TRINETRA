"""
TRINETRA Phase 4 Test Suite: Baseline Forecast Engine
Validates persistence decay, climatological priors, tree baseline, zero temporal leakage,
and automated rare-event verification metrics.
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from models.persistence import PersistenceBaseline
from models.climatology import ClimatologyBaseline
from models.tree_baseline import TreeBaseline
from models.data_split import TimeAwareSplitter
from models.evaluator import Evaluator

client = TestClient(app)


def test_persistence_decay():
    """Verify persistence probability decays with forecast horizon."""
    model = PersistenceBaseline(decorrelation_half_life_min=75.0)
    features = {"radar_dbz": 52.0, "cooling_rate": -18.0, "slope_deg": 35.0}

    pred_t1h = model.predict_cell(features, horizon_minutes=60)
    pred_t4h = model.predict_cell(features, horizon_minutes=240)
    pred_t6h = model.predict_cell(features, horizon_minutes=360)

    # Shorter horizon should have higher persistence than longer horizon
    assert pred_t1h.thunderstorm_prob > pred_t4h.thunderstorm_prob
    assert pred_t4h.thunderstorm_prob >= pred_t6h.thunderstorm_prob
    assert pred_t6h.thunderstorm_prob >= 0.08 # Climatology floor
    assert pred_t1h.is_test_baseline is True


def test_climatology_diurnal_priors():
    """Verify climatology modulates with diurnal solar cycle."""
    model = ClimatologyBaseline()
    features = {"elevation": 1600.0, "slope_deg": 30.0}

    # Peak afternoon heating in Himalayas ~ 11:00 UTC (16:30 IST)
    pred_afternoon = model.predict_cell(features, horizon_minutes=0, utc_hour=11)
    # Nighttime minimum ~ 23:00 UTC (04:30 IST)
    pred_night = model.predict_cell(features, horizon_minutes=0, utc_hour=23)

    assert pred_afternoon.thunderstorm_prob > pred_night.thunderstorm_prob


def test_tree_baseline_predictions():
    """Verify tree baseline computes non-linear probabilities from atmospheric + terrain inputs."""
    model = TreeBaseline()

    severe_features = {
        "cape": 3600.0,
        "cin": -10.0,
        "tpw": 62.0,
        "cooling_rate": -22.0,
        "slope_deg": 42.0,
        "twi": 13.5,
    }
    pred_severe = model.predict_cell(severe_features, horizon_minutes=120)
    assert pred_severe.thunderstorm_prob >= 0.70
    assert pred_severe.flash_flood_prob >= 0.70
    assert pred_severe.severity in ["warning", "critical"]

    mild_features = {
        "cape": 600.0,
        "cin": -85.0,
        "tpw": 22.0,
        "cooling_rate": 0.0,
        "slope_deg": 5.0,
        "twi": 5.0,
    }
    pred_mild = model.predict_cell(mild_features, horizon_minutes=120)
    assert pred_mild.thunderstorm_prob < 0.20
    assert pred_mild.severity == "none"


def test_time_aware_split_no_leakage():
    """Non-negotiable rule: train < val < test in chronological time with zero leakage."""
    splitter = TimeAwareSplitter(
        train_end="2024-12-31T23:59:59Z",
        val_start="2025-01-01T00:00:00Z",
        val_end="2025-06-30T23:59:59Z",
        test_start="2025-07-01T00:00:00Z",
    )

    records = [
        {"id": "r1", "observation_timestamp": "2024-06-15T10:00:00Z"},
        {"id": "r2", "observation_timestamp": "2024-11-20T14:30:00Z"},
        {"id": "r3", "observation_timestamp": "2025-03-10T08:00:00Z"},
        {"id": "r4", "observation_timestamp": "2025-08-12T12:00:00Z"},
    ]

    splits = splitter.split(records)
    assert len(splits["train"]) == 2
    assert len(splits["validation"]) == 1
    assert len(splits["held_out_test"]) == 1
    assert splits["held_out_test"][0]["id"] == "r4"

    # Automated check ensuring no leakage
    assert splitter.verify_no_leakage(splits) is True


def test_evaluator_metrics_calculation():
    """Verify rare-event precision, recall, F1, PR-AUC, and Brier calibration scores."""
    y_true = [1, 1, 0, 1, 0, 0, 0, 1, 0, 0] # 4 positives (rare event: 40%)
    y_prob = [0.85, 0.72, 0.15, 0.65, 0.25, 0.10, 0.35, 0.40, 0.12, 0.18]

    metrics = Evaluator.compute_metrics(y_true, y_prob, threshold=0.45)
    assert metrics["precision"] >= 0.75
    assert metrics["recall"] >= 0.75
    assert metrics["f1_score"] >= 0.75
    assert metrics["pr_auc"] > 0.0
    assert metrics["brier_calibration_score"] < 0.20 # Good calibration


def test_baseline_api_endpoints():
    """Verify FastAPI baseline prediction and evaluation endpoints."""
    # 1. Baseline prediction endpoint
    res = client.post("/api/v1/forecast/baseline", json={"baseline_type": "tree", "horizon_minutes": 120})
    assert res.status_code == 200
    data = res.json()
    assert data["is_test_baseline"] is True
    assert len(data["predictions"]) > 0
    assert "probabilities" in data["predictions"][0]

    # 2. Benchmark evaluation metrics endpoint
    res_metrics = client.get("/api/v1/forecast/evaluation-metrics")
    assert res_metrics.status_code == 200
    metrics_data = res_metrics.json()
    assert "baselines" in metrics_data
    assert "persistence" in metrics_data["baselines"]
    assert "gradient_boosted_tree" in metrics_data["baselines"]
