"""
Pytest Test Suite for Phase 7: Real-Time Inference & Forecast Orchestration.
Verifies:
1. End-to-end nowcast prediction cycle execution
2. Job idempotency (identical input timestamps return cached snapshot)
3. Job state machine transitions and audit logging
4. Resilient failure handling and dead-letter queue tracking
5. RFC 7946 GeoJSON FeatureCollection format and coordinate bounds
6. System health telemetry and freshness monitoring
7. FastAPI endpoints for trigger, jobs, and latest GeoJSON
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

from orchestration.job_manager import JobManager, JobStatus, ForecastJob
from orchestration.pipeline import ForecastPipeline
from orchestration.scheduler import OrchestrationScheduler
from ingestion.synthetic_replay import generate_synthetic_nowcast_payload
from main import app

client = TestClient(app)


def test_end_to_end_orchestration_cycle():
    """Verify complete prediction cycle executes and returns valid snapshot."""
    pipeline = ForecastPipeline()
    raw_sample = generate_synthetic_nowcast_payload()

    snapshot = pipeline.execute_cycle(
        raw_observation_batch=raw_sample,
        is_synthetic_replay=True,
        trigger_source="test_runner",
    )

    assert "snapshot_id" in snapshot
    assert snapshot["cells_count"] >= 4
    assert snapshot["is_synthetic_replay"] is True
    assert "STATISTICAL RISK ESTIMATION" in snapshot["disclaimer"]
    assert "geojson" in snapshot
    assert snapshot["total_pipeline_latency_ms"] < 2000.0


def test_job_idempotency_guard():
    """Verify duplicate triggers with identical timestamps return existing snapshot."""
    pipeline = ForecastPipeline()
    raw_sample = generate_synthetic_nowcast_payload()
    raw_sample["observation_timestamp"] = "2026-09-11T12:00:00Z"

    # First execution
    snap1 = pipeline.execute_cycle(raw_observation_batch=raw_sample)
    # Second duplicate execution
    snap2 = pipeline.execute_cycle(raw_observation_batch=raw_sample)

    assert snap1["snapshot_id"] == snap2["snapshot_id"]
    assert snap1["job_id"] == snap2["job_id"]


def test_job_state_machine_transitions():
    """Verify state transitions and audit logging."""
    manager = JobManager()
    job, is_new = manager.create_or_get_job(
        data_timestamp="2026-09-11T12:30:00Z",
        raw_payload={"test": 123},
    )
    assert is_new is True
    assert job.status == JobStatus.PENDING

    job.transition_to(JobStatus.NORMALIZING)
    assert job.status == JobStatus.NORMALIZING

    job.transition_to(JobStatus.INFERRING)
    assert job.status == JobStatus.INFERRING

    job.transition_to(JobStatus.COMPLETED)
    assert job.status == JobStatus.COMPLETED
    assert len(job.logs) >= 3


def test_failure_handling_and_dead_letter_queue():
    """Verify corrupted inputs transition to FAILED and record dead-letter entry."""
    manager = JobManager()
    job, _ = manager.create_or_get_job("2026-09-11T13:00:00Z", {"corrupted": True})

    manager.mark_dead_letter(job, reason="Corrupted sensor stream: NaN in radar core")
    assert job.status == JobStatus.DEAD_LETTER
    assert job.error == "Corrupted sensor stream: NaN in radar core"

    dead_letters = manager.get_dead_letters()
    assert len(dead_letters) == 1
    assert dead_letters[0]["job_id"] == job.job_id


def test_rfc7946_geojson_format():
    """Verify latest GeoJSON feature collection matches RFC 7946 GIS specification."""
    pipeline = ForecastPipeline()
    geojson = pipeline.get_latest_geojson()

    assert geojson["type"] == "FeatureCollection"
    assert "features" in geojson
    assert len(geojson["features"]) >= 4

    for feature in geojson["features"]:
        assert feature["type"] == "Feature"
        assert "geometry" in feature
        assert feature["geometry"]["type"] == "Polygon"
        # Verify valid coordinates in Uttarakhand bounding box
        coords = feature["geometry"]["coordinates"][0]
        assert len(coords) == 5  # Closed polygon
        for pt in coords:
            assert 77.0 <= pt[0] <= 81.5  # Longitude
            assert 28.5 <= pt[1] <= 32.0  # Latitude

        props = feature["properties"]
        assert "cell_id" in props
        assert "flash_flood_risk" in props
        assert "p_meteo" in props
        assert "s_terrain" in props
        assert "disclaimer" in props


def test_system_health_monitoring():
    """Verify orchestration scheduler aggregates system health telemetry."""
    pipeline = ForecastPipeline()
    scheduler = OrchestrationScheduler(pipeline=pipeline)

    health = scheduler.evaluate_system_health()
    assert health["status"] in ["OPERATIONAL", "DEGRADED"]
    assert health["scheduler_active"] is True
    assert "telemetry" in health
    assert "job_metrics" in health


def test_orchestration_api_endpoints():
    """Verify FastAPI orchestration endpoints."""
    # 1. POST /api/v1/orchestration/trigger
    resp_trig = client.post(
        "/api/v1/orchestration/trigger",
        json={"is_synthetic_replay": True, "source": "api_test"},
    )
    assert resp_trig.status_code == 200
    snap = resp_trig.json()
    assert "snapshot_id" in snap
    assert "cells_count" in snap

    # 2. GET /api/v1/forecast/latest-geojson
    resp_geo = client.get("/api/v1/forecast/latest-geojson")
    assert resp_geo.status_code == 200
    geo_data = resp_geo.json()
    assert geo_data["type"] == "FeatureCollection"

    # 3. GET /api/v1/orchestration/jobs
    resp_jobs = client.get("/api/v1/orchestration/jobs")
    assert resp_jobs.status_code == 200
    jobs_data = resp_jobs.json()
    assert "jobs" in jobs_data
    assert len(jobs_data["jobs"]) >= 1

    # 4. GET /api/v1/orchestration/jobs/{job_id}
    job_id = snap["job_id"]
    resp_job = client.get(f"/api/v1/orchestration/jobs/{job_id}")
    assert resp_job.status_code == 200
    assert resp_job.json()["job_id"] == job_id

    # 5. GET /api/v1/orchestration/system-health
    resp_health = client.get("/api/v1/orchestration/system-health")
    assert resp_health.status_code == 200
    assert resp_health.json()["scheduler_active"] is True
