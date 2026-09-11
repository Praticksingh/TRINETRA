"""Test suite for Phase 9: Alerting, Notification & Authority Workflow

Tests:
  - Calibrated multi-hazard thresholds & severity mapping
  - Authority lifecycle state machine & transition rules
  - ITU-T X.1303 / OASIS CAP v1.2 XML serialization & schema tags
  - RFC 7946 GeoJSON Alert Feed generation
  - HMAC-SHA256 signature verification on mock dispatch
  - FastAPI endpoints for alerts, CAP export, and dispatch simulation
"""

import xml.etree.ElementTree as ET
import hmac
import hashlib
import json
import pytest
from fastapi.testclient import TestClient
from main import app
from alerting import (
    CalibratedAlertEngine,
    CAPSerializer,
    GeoJSONAlertFeedSerializer,
    MockNotificationDispatcher,
    AlertStatus,
    AlertSeverity,
    HazardType,
)

client = TestClient(app)


def test_calibrated_thresholds_severity():
    """Verifies that probability values correctly map to calibrated severity tiers"""
    engine = CalibratedAlertEngine()

    # Sub-threshold: P = 0.25 -> None
    sub = engine.evaluate_cell(
        cell_id="c0",
        name="Plains Area",
        coords=(78.0, 30.0),
        prob_thunderstorm=0.25,
        prob_cloudburst=0.10,
        prob_flash_flood=0.15,
        horizon_minutes=120,
    )
    assert sub is None

    # Advisory: P = 0.40 -> Advisory
    adv = engine.evaluate_cell(
        cell_id="c1",
        name="Foothills",
        coords=(78.1, 30.1),
        prob_thunderstorm=0.40,
        prob_cloudburst=0.20,
        prob_flash_flood=0.30,
        horizon_minutes=120,
    )
    assert adv is not None
    assert adv.severity == AlertSeverity.ADVISORY

    # Watch: P = 0.60 -> Watch
    wtc = engine.evaluate_cell(
        cell_id="c2",
        name="Ridge Station",
        coords=(78.2, 30.2),
        prob_thunderstorm=0.60,
        prob_cloudburst=0.45,
        prob_flash_flood=0.50,
        horizon_minutes=120,
    )
    assert wtc is not None
    assert wtc.severity == AlertSeverity.WATCH

    # Warning: P = 0.78 -> Warning
    wrn = engine.evaluate_cell(
        cell_id="c3",
        name="Gorge Valley",
        coords=(78.3, 30.3),
        prob_thunderstorm=0.78,
        prob_cloudburst=0.72,
        prob_flash_flood=0.76,
        horizon_minutes=120,
    )
    assert wrn is not None
    assert wrn.severity == AlertSeverity.WARNING

    # Critical Flash-Flood: Flash-Flood P = 0.88 -> Critical
    crit = engine.evaluate_cell(
        cell_id="c4",
        name="Steep Catchment",
        coords=(78.4, 30.4),
        prob_thunderstorm=0.70,
        prob_cloudburst=0.60,
        prob_flash_flood=0.88,
        horizon_minutes=120,
    )
    assert crit is not None
    assert crit.severity == AlertSeverity.CRITICAL
    assert crit.hazard_type == HazardType.FLASH_FLOOD

    # Anti-hallucination check: strictly Model Advisory
    assert crit.is_official_warning is False
    assert crit.is_synthetic_replay is True


def test_authority_state_machine_valid_transitions():
    """Tests the standard authority lifecycle transition path"""
    engine = CalibratedAlertEngine()
    alert = engine.evaluate_cell(
        cell_id="c_kedarnath",
        name="Kedarnath",
        coords=(79.066, 30.735),
        prob_thunderstorm=0.85,
        prob_cloudburst=0.82,
        prob_flash_flood=0.92,
        horizon_minutes=120,
    )
    assert alert.status == AlertStatus.GENERATED
    assert len(alert.audit_trail) == 1

    # 1. GENERATED -> UNDER_REVIEW
    alert = engine.transition_alert(
        alert_id=alert.id,
        to_status=AlertStatus.UNDER_REVIEW,
        operator_id="DUTY_OFFICER_1",
        remarks="Initiating radar validation review.",
    )
    assert alert.status == AlertStatus.UNDER_REVIEW
    assert len(alert.audit_trail) == 2

    # 2. UNDER_REVIEW -> DISPATCHED
    alert = engine.transition_alert(
        alert_id=alert.id,
        to_status=AlertStatus.DISPATCHED,
        operator_id="SENIOR_METEOROLOGIST",
        remarks="Confirmed severe convective signature. Dispatching advisory.",
    )
    assert alert.status == AlertStatus.DISPATCHED
    assert len(alert.audit_trail) == 3

    # 3. DISPATCHED -> ACKNOWLEDGED
    alert = engine.transition_alert(
        alert_id=alert.id,
        to_status=AlertStatus.ACKNOWLEDGED,
        operator_id="SEOC_DEHRADUN",
        remarks="SEOC watch team acknowledged advisory.",
    )
    assert alert.status == AlertStatus.ACKNOWLEDGED

    # 4. ACKNOWLEDGED -> RESOLVED
    alert = engine.transition_alert(
        alert_id=alert.id,
        to_status=AlertStatus.RESOLVED,
        operator_id="INCIDENT_COMMANDER",
        remarks="Convective cluster passed without incident.",
    )
    assert alert.status == AlertStatus.RESOLVED


def test_authority_state_machine_invalid_transitions():
    """Verifies that invalid state transitions raise ValueError and unknown alerts raise KeyError"""
    engine = CalibratedAlertEngine()
    alert = engine.evaluate_cell(
        cell_id="c_invalid",
        name="Test Area",
        coords=(78.5, 30.5),
        prob_thunderstorm=0.90,
        prob_cloudburst=0.80,
        prob_flash_flood=0.80,
        horizon_minutes=120,
    )
    # Direct jump from GENERATED to RESOLVED is forbidden
    with pytest.raises(ValueError, match="Invalid transition"):
        engine.transition_alert(
            alert_id=alert.id,
            to_status=AlertStatus.RESOLVED,
            operator_id="OP1",
            remarks="Skip review",
        )

    # Unknown alert ID
    with pytest.raises(KeyError):
        engine.transition_alert(
            alert_id="alt_nonexistent_999",
            to_status=AlertStatus.UNDER_REVIEW,
            operator_id="OP1",
            remarks="None",
        )


def test_cap_v12_xml_serialization():
    """Verifies that generated CAP XML conforms to OASIS CAP v1.2 structure"""
    engine = CalibratedAlertEngine()
    alert = engine.evaluate_cell(
        cell_id="c_cap",
        name="Shivpuri River Corridor",
        coords=(78.35, 30.12),
        prob_thunderstorm=0.80,
        prob_cloudburst=0.85,
        prob_flash_flood=0.75,
        horizon_minutes=120,
    )
    xml_str = CAPSerializer.to_cap_xml(alert)
    assert "xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\"" in xml_str

    # Parse with standard XML parser to verify well-formedness
    root = ET.fromstring(xml_str)
    ns = {"cap": "urn:oasis:names:tc:emergency:cap:1.2"}

    assert root.find("cap:identifier", ns).text == alert.id
    assert root.find("cap:status", ns).text == "Test"  # Synthetic replay marked as Test
    assert root.find("cap:msgType", ns).text == "Alert"

    info = root.find("cap:info", ns)
    assert info is not None
    assert info.find("cap:category", ns).text == "Met"
    assert info.find("cap:severity", ns).text == "Extreme"
    assert info.find("cap:headline", ns).text == alert.headline

    area = info.find("cap:area", ns)
    assert area is not None
    polygon = area.find("cap:polygon", ns)
    assert polygon is not None
    assert len(polygon.text.split(" ")) >= 4


def test_geojson_alert_feed_format():
    """Verifies that GeoJSON alert feed conforms to RFC 7946"""
    engine = CalibratedAlertEngine()
    alert = engine.evaluate_cell(
        cell_id="c_geo",
        name="Alaknanda Gorge",
        coords=(79.2, 30.4),
        prob_thunderstorm=0.70,
        prob_cloudburst=0.60,
        prob_flash_flood=0.86,
        horizon_minutes=120,
    )
    feed = GeoJSONAlertFeedSerializer.to_geojson_feed([alert])

    assert feed["type"] == "FeatureCollection"
    assert len(feed["features"]) == 1

    feature = feed["features"][0]
    assert feature["type"] == "Feature"
    assert feature["geometry"]["type"] == "Polygon"
    # Closed ring: first == last
    ring = feature["geometry"]["coordinates"][0]
    assert ring[0] == ring[-1]
    assert feature["properties"]["alert_id"] == alert.id
    assert feature["properties"]["is_official_warning"] is False


def test_notification_dispatcher_hmac():
    """Verifies that dispatcher generates valid HMAC-SHA256 signatures and receipts"""
    engine = CalibratedAlertEngine()
    alert = engine.evaluate_cell(
        cell_id="c_disp",
        name="Mandakini Cirque",
        coords=(79.066, 30.735),
        prob_thunderstorm=0.88,
        prob_cloudburst=0.82,
        prob_flash_flood=0.94,
        horizon_minutes=120,
    )
    dispatcher = MockNotificationDispatcher()
    receipt = dispatcher.dispatch(alert, channel="SDMA_WEBHOOK")

    assert receipt.status_code == 200
    assert receipt.is_synthetic_dispatch is True
    assert len(receipt.signature) == 64  # SHA256 hex length
    assert receipt.latency_ms > 0

    history = dispatcher.get_dispatch_history(alert.id)
    assert len(history) == 1
    assert history[0].receipt_id == receipt.receipt_id


def test_alert_api_endpoints():
    """Tests all Phase 9 alert REST API endpoints via TestClient"""
    # 1. GET /api/v1/alerts
    res = client.get("/api/v1/alerts")
    assert res.status_code == 200
    data = res.json()
    assert "alerts" in data
    assert data["count"] >= 3
    alert_id = data["alerts"][0]["id"]

    # 2. GET /api/v1/alerts/{alert_id}
    res = client.get(f"/api/v1/alerts/{alert_id}")
    assert res.status_code == 200
    assert res.json()["id"] == alert_id

    # 3. POST /api/v1/alerts/{alert_id}/transition
    res = client.post(
        f"/api/v1/alerts/{alert_id}/transition",
        json={
            "to_status": "UNDER_REVIEW",
            "operator_id": "TEST_OFFICER",
            "remarks": "Automated pytest review initiated.",
            "operator_role": "SDMA_TESTER",
        },
    )
    assert res.status_code == 200
    assert res.json()["new_status"] == "UNDER_REVIEW"

    # 4. GET /api/v1/alerts/{alert_id}/cap.xml
    res = client.get(f"/api/v1/alerts/{alert_id}/cap.xml")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/xml"
    assert "<alert" in res.text

    # 5. GET /api/v1/alerts/feed.geojson
    res = client.get("/api/v1/alerts/feed.geojson")
    assert res.status_code == 200
    geojson = res.json()
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) >= 1

    # 6. POST /api/v1/alerts/{alert_id}/dispatch-simulation
    res = client.post(
        f"/api/v1/alerts/{alert_id}/dispatch-simulation",
        json={
            "channel": "SDMA_WEBHOOK",
            "recipient": "https://seoc.uk.gov.in/test-feed",
        },
    )
    assert res.status_code == 200
    receipt = res.json()["receipt"]
    assert receipt["status_code"] == 200
    assert receipt["is_synthetic_dispatch"] is True
