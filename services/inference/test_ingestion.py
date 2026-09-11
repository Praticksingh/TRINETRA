"""
TRINETRA Phase 3 Test Suite: Data Ingestion, Normalization & Provenance
Validates that atmospheric, satellite, and DEM feeds are converted into a standardized
spatiotemporal representation with explicit provenance, determinism, and error resilience.
"""

import pytest
from ingestion.insat_adapter import InsatAdapter
from ingestion.imdaa_adapter import ImdaaAdapter
from ingestion.dem_adapter import DemAdapter
from ingestion.normalizer import SpatiotemporalNormalizer, FEATURE_ORDER
from ingestion.freshness import FreshnessService
from ingestion.synthetic_replay import generate_synthetic_nowcast_payload


def test_insat_adapter():
    """Verify INSAT-3DR adapter extracts TIR1, BTD, and cooling rate with provenance."""
    adapter = InsatAdapter()
    sample = generate_synthetic_nowcast_payload()["insat"]
    grid = adapter.ingest(sample)

    assert grid.provenance.source_name == "INSAT_3DR"
    assert grid.provenance.crs == "EPSG:4326"
    assert "bt_tir1" in grid.channels
    assert "btd_split" in grid.channels
    assert "cooling_rate" in grid.channels

    # Values within physical atmospheric bounds
    assert grid.channels["bt_tir1"].unit == "Kelvin"
    assert grid.channels["bt_tir1"].values[2][2] == 205.0 # Convective cloud top


def test_imdaa_adapter():
    """Verify IMDAA adapter normalizes CAPE, CIN, TPW, and Omega."""
    adapter = ImdaaAdapter()
    sample = generate_synthetic_nowcast_payload()["imdaa"]
    grid = adapter.ingest(sample)

    assert grid.provenance.source_name == "IMDAA_REANALYSIS"
    assert "cape" in grid.channels
    assert "cin" in grid.channels
    assert "tpw" in grid.channels
    assert "omega_500" in grid.channels

    assert grid.channels["cape"].unit == "J/kg"
    assert grid.channels["cape"].values[2][2] == 3850.0 # Extreme instability


def test_dem_adapter():
    """Verify DEM adapter extracts static topography matrices."""
    adapter = DemAdapter()
    grid = adapter.ingest({})

    assert grid.provenance.source_name == "SRTM_DEM"
    assert "elevation" in grid.channels
    assert "slope_deg" in grid.channels
    assert "twi" in grid.channels

    assert grid.channels["elevation"].values[2][3] == 3583.0 # Kedarnath elevation


def test_spatiotemporal_normalizer_end_to_end():
    """Verify full end-to-end ingestion pipeline produces standard 3D tensor."""
    normalizer = SpatiotemporalNormalizer()
    raw_payload = generate_synthetic_nowcast_payload()
    result = normalizer.process_raw_batch(raw_payload)

    assert result["crs"] == "EPSG:4326"
    assert result["grid_resolution_deg"] == 0.04
    assert result["shape"] == [10, 4, 4] # [num_channels, lats, lons]
    assert result["feature_names"] == FEATURE_ORDER
    assert result["quality_flag"] == "nominal"
    assert len(result["provenance_trail"]) == 3
    assert result["tensor_hash"] is not None


def test_deterministic_reproducibility():
    """Non-negotiable rule: identical raw input must yield identical tensor hash."""
    normalizer = SpatiotemporalNormalizer()
    raw_payload_1 = generate_synthetic_nowcast_payload()
    raw_payload_2 = generate_synthetic_nowcast_payload()

    res1 = normalizer.process_raw_batch(raw_payload_1)
    res2 = normalizer.process_raw_batch(raw_payload_2)

    assert res1["tensor_hash"] == res2["tensor_hash"]


def test_missing_data_handled_safely():
    """Guardrail rule: missing optional channel must mark batch degraded without crashing."""
    normalizer = SpatiotemporalNormalizer()
    raw_payload = generate_synthetic_nowcast_payload()

    # Intentionally remove optional water vapor channel
    raw_payload["insat"]["wv_bt_k"] = None

    result = normalizer.process_raw_batch(raw_payload)
    assert result["quality_flag"] == "degraded"
    assert result["shape"] == [10, 4, 4]


def test_freshness_telemetry_service():
    """Verify Freshness service reports active feed lag and statuses."""
    service = FreshnessService()
    telemetry = service.evaluate_feeds()

    assert telemetry.system_status == "operational"
    assert len(telemetry.feeds) == 4
    sources = [f.source_name for f in telemetry.feeds]
    assert "INSAT_3DR" in sources
    assert "IMDAA_REANALYSIS" in sources
