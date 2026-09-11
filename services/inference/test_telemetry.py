"""Test suite for Phase 11: Deployment, Packaging & Operational Telemetry

Tests:
  - Prometheus exposition text formatting and HELP/TYPE headers
  - Metric recording (predictions, latencies, alerts, rate limit blocks)
  - Endpoint GET /metrics via FastAPI TestClient
  - Containerization files and Docker Compose syntax verification
"""

import os
import pytest
from fastapi.testclient import TestClient
from main import app
from core.telemetry import PrometheusMetricCollector, telemetry

client = TestClient(app)


def test_prometheus_collector_formatting():
    """Verifies that PrometheusMetricCollector exports valid Prometheus text format"""
    collector = PrometheusMetricCollector()
    collector.record_request("/api/v1/forecast/nowcast", 200)
    collector.record_prediction(cell_count=12, latency_ms=4.2)
    collector.record_alert_generated(2)
    collector.set_active_alerts(3)
    collector.record_rate_limit_block()
    collector.record_circuit_breaker_trip()

    output = collector.export_text()

    # Verify standard Prometheus structure
    assert "# HELP trinetra_predictions_total" in output
    assert "# TYPE trinetra_predictions_total counter" in output
    assert "trinetra_predictions_total 12" in output

    assert "# HELP trinetra_inference_latency_ms" in output
    assert "# TYPE trinetra_inference_latency_ms gauge" in output
    assert "trinetra_inference_latency_ms 4.2" in output

    assert "trinetra_alerts_generated_total 2" in output
    assert "trinetra_active_alerts 3" in output
    assert "trinetra_rate_limit_blocks_total 1" in output
    assert "trinetra_circuit_breaker_trips_total 1" in output
    assert 'trinetra_model_info{version="v1.0.0-conv3d-multitask",engine="conv3d"} 1' in output


def test_metrics_api_endpoint():
    """Verifies that GET /metrics returns standard Prometheus exposition payload"""
    res = client.get("/metrics")
    assert res.status_code == 200
    assert "text/plain" in res.headers["content-type"]
    assert "version=0.0.4" in res.headers["content-type"]

    body = res.text
    assert "# HELP trinetra_http_requests_total" in body
    assert "trinetra_predictions_total" in body
    assert "trinetra_active_alerts" in body


def test_container_configuration_files_exist():
    """Verifies presence and security directives in Dockerfiles and docker-compose.yml"""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

    # 1. Inference Dockerfile
    inf_dockerfile = os.path.join(base_dir, "services", "inference", "Dockerfile")
    assert os.path.exists(inf_dockerfile)
    with open(inf_dockerfile, "r", encoding="utf-8") as f:
        inf_content = f.read()
    assert "FROM python:3.11-slim" in inf_content
    assert "USER trinetra" in inf_content  # Non-root user
    assert "HEALTHCHECK" in inf_content

    # 2. Web Dockerfile
    web_dockerfile = os.path.join(base_dir, "apps", "web", "Dockerfile")
    assert os.path.exists(web_dockerfile)
    with open(web_dockerfile, "r", encoding="utf-8") as f:
        web_content = f.read()
    assert "FROM node:20-alpine" in web_content
    assert "USER nextjs" in web_content  # Non-root user
    assert "HEALTHCHECK" in web_content

    # 3. Docker Compose
    compose_path = os.path.join(base_dir, "docker-compose.yml")
    assert os.path.exists(compose_path)
    with open(compose_path, "r", encoding="utf-8") as f:
        compose_content = f.read()
    assert "services:" in compose_content
    assert "inference:" in compose_content
    assert "web:" in compose_content
    assert "trinetra-net:" in compose_content
