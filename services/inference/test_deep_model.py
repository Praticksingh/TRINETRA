"""
Pytest Test Suite for Phase 5: Spatiotemporal Multi-Task AI Model.
Verifies:
1. Spatiotemporal Conv3D architecture forward pass and tensor dimensions
2. Multi-task loss (Binary Focal Loss) and class-imbalance weighting
3. Temperature calibration producing monotonic, bounded probabilities
4. Standalone inference latency (< 50ms requirement)
5. Strict data provenance flags (no silent synthetic substitution)
6. Baseline hurdle evaluation and promotion protocol
7. Deterministic reproducibility across seeds
8. FastAPI endpoints for deep nowcast and hurdle comparison
"""

import os
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
import torch
from fastapi.testclient import TestClient

from models.spatiotemporal_net import (
    SpatiotemporalMultiTaskNet,
    MODEL_VERSION,
    NUM_CHANNELS,
)
from models.focal_loss import (
    BinaryFocalLoss,
    MultiTaskHazardLoss,
    TemperatureCalibrator,
    compute_expected_calibration_error,
)
from models.deep_inference import TrinetraDeepInference
from models.hurdle_evaluator import HurdleEvaluator
from main import app

client = TestClient(app)


def test_spatiotemporal_net_shapes():
    """Verify Conv3D backbone and 3 multi-task heads produce expected dimensions."""
    model = SpatiotemporalMultiTaskNet()
    model.eval()

    # Input: [Batch=2, Timesteps=4, Channels=10, Height=15, Width=15]
    batch_size = 2
    dummy_input = torch.randn(batch_size, 4, NUM_CHANNELS, 15, 15)

    with torch.no_grad():
        out = model(dummy_input)

    # 3 multi-task logits for horizons (2h, 4h, 6h)
    assert out["thunderstorm_logits"].shape == (batch_size, 3)
    assert out["cloudburst_logits"].shape == (batch_size, 3)
    assert out["flash_flood_logits"].shape == (batch_size, 3)

    # Spatial heatmaps
    assert out["spatial_thunderstorm_logits"].shape == (batch_size, 3, 15, 15)
    assert out["spatial_cloudburst_logits"].shape == (batch_size, 3, 15, 15)
    assert out["spatial_flash_flood_logits"].shape == (batch_size, 3, 15, 15)


def test_binary_focal_loss():
    """Verify focal loss appropriately downweights well-classified easy samples."""
    focal = BinaryFocalLoss(alpha=0.75, gamma=2.0)

    # Easy positive: high logit (+10.0), target 1
    easy_pos_logit = torch.tensor([10.0])
    easy_pos_target = torch.tensor([1.0])
    loss_easy = focal(easy_pos_logit, easy_pos_target)

    # Hard positive: low logit (-5.0), target 1
    hard_pos_logit = torch.tensor([-5.0])
    hard_pos_target = torch.tensor([1.0])
    loss_hard = focal(hard_pos_logit, hard_pos_target)

    # Hard case must produce significantly higher loss than easy case
    assert loss_hard.item() > loss_easy.item() * 100
    assert not torch.isnan(loss_easy)
    assert not torch.isnan(loss_hard)


def test_temperature_calibration():
    """Verify temperature scaling bounds probabilities between 0.0 and 1.0 and preserves order."""
    calibrator = TemperatureCalibrator(num_heads=3)
    ts_logits = torch.tensor([[-2.0, 0.0, 3.0]])
    cb_logits = torch.tensor([[-4.0, -1.0, 1.0]])
    ff_logits = torch.tensor([[-1.0, 1.0, 4.0]])

    p_ts, p_cb, p_ff = calibrator(ts_logits, cb_logits, ff_logits)

    for p in [p_ts, p_cb, p_ff]:
        assert torch.all(p >= 0.0)
        assert torch.all(p <= 1.0)
        # Monotonicity check: higher logit must yield higher probability
        assert p[0, 0] < p[0, 1] < p[0, 2]


def test_expected_calibration_error_metric():
    """Verify ECE metric computation."""
    probs = np.array([0.9, 0.9, 0.1, 0.1])
    labels = np.array([1, 1, 0, 0])
    ece = compute_expected_calibration_error(probs, labels, num_bins=5)
    assert 0.0 <= ece <= 0.20


def test_deep_inference_latency_benchmark():
    """Verify standalone inference latency meets real-time threshold (< 50ms)."""
    inference_engine = TrinetraDeepInference()
    dummy_tensor = np.random.randn(4, NUM_CHANNELS, 15, 15).astype(np.float32)

    # Warmup
    _ = inference_engine.predict(dummy_tensor, is_synthetic_replay=True)

    # Benchmark 5 runs
    latencies = []
    for _ in range(5):
        res = inference_engine.predict(dummy_tensor, is_synthetic_replay=True)
        latencies.append(res["inference_latency_ms"])

    avg_latency = np.mean(latencies)
    assert avg_latency < 50.0, f"Inference latency exceeded 50ms: {avg_latency}ms"
    assert res["quality_flags"]["feature_channels_validated"] is True
    assert res["quality_flags"]["temporal_sequence_complete"] is True


def test_data_provenance_enforcement():
    """Verify no silent synthetic substitution: flags and tensor hashes are required."""
    inference_engine = TrinetraDeepInference()
    dummy_tensor = np.random.randn(4, NUM_CHANNELS, 15, 15).astype(np.float32)

    res_synthetic = inference_engine.predict(dummy_tensor, is_synthetic_replay=True)
    assert res_synthetic["is_synthetic_replay"] is True
    assert len(res_synthetic["tensor_sha256"]) == 16

    res_live = inference_engine.predict(dummy_tensor, is_synthetic_replay=False)
    assert res_live["is_synthetic_replay"] is False


def test_hurdle_evaluation_and_promotion():
    """Verify candidate model clears the Phase 4 baseline hurdle on held-out test split."""
    checkpoint_path = root_dir / "ml" / "checkpoints" / "v1.0.0-conv3d-multitask.pt"
    assert checkpoint_path.exists(), "Trained model checkpoint must exist"

    model = SpatiotemporalMultiTaskNet()
    checkpoint = torch.load(str(checkpoint_path))
    model.load_state_dict(checkpoint["state_dict"])

    evaluator = HurdleEvaluator(
        baseline_metrics_path=str(root_dir / "ml" / "evaluation" / "baseline_metrics.json"),
        output_dir=str(root_dir / "ml" / "evaluation"),
    )
    results = evaluator.evaluate_model(model, test_samples=100, seed=2025)

    hurdle = results["hurdle_comparison"]
    assert hurdle["candidate_deep_f1"] > hurdle["tree_baseline_f1"]
    assert hurdle["candidate_deep_pr_auc"] > hurdle["tree_baseline_pr_auc"]
    assert hurdle["hurdle_cleared"] is True
    assert hurdle["decision"] == "PROMOTE_TO_ACTIVE_PRODUCTION_CANDIDATE"


def test_reproducibility_deterministic_seed():
    """Verify model initialization and inference is deterministic under identical seed."""
    torch.manual_seed(1337)
    m1 = SpatiotemporalMultiTaskNet()

    torch.manual_seed(1337)
    m2 = SpatiotemporalMultiTaskNet()

    x = torch.randn(1, 4, NUM_CHANNELS, 15, 15)
    m1.eval()
    m2.eval()

    with torch.no_grad():
        out1 = m1(x)
        out2 = m2(x)

    for k in ["thunderstorm_logits", "cloudburst_logits", "flash_flood_logits"]:
        assert torch.allclose(out1[k], out2[k], atol=1e-6)


def test_deep_nowcast_api_endpoint():
    """Verify POST /api/v1/forecast/deep-nowcast endpoint."""
    response = client.post(
        "/api/v1/forecast/deep-nowcast",
        json={
            "region_id": "IN-UT",
            "horizons": ["2h", "4h", "6h"],
            "is_synthetic_replay": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["model_version"] == "v1.0.0-conv3d-multitask"
    assert "inference_latency_ms" in data
    assert data["inference_latency_ms"] < 100.0
    assert data["is_synthetic_replay"] is True
    assert "horizons" in data
    assert "2h" in data["horizons"]
    assert "thunderstorm_probability" in data["horizons"]["2h"]
    assert "cloudburst_probability" in data["horizons"]["2h"]
    assert "flash_flood_risk" in data["horizons"]["2h"]


def test_hurdle_comparison_api_endpoint():
    """Verify GET /api/v1/forecast/hurdle-comparison endpoint."""
    response = client.get("/api/v1/forecast/hurdle-comparison")
    assert response.status_code == 200
    data = response.json()
    assert "tree_baseline" in data
    assert "deep_candidate" in data
    assert "hurdle_status" in data
    assert data["hurdle_status"]["hurdle_cleared"] is True
