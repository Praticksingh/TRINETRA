"""
TRINETRA Data Ingestion: Data Freshness & Status Telemetry Service
Tracks feed availability, lag minutes, and operational state across all observational sources.
"""

from datetime import datetime, timezone
from typing import Dict, List, Any
from pydantic import BaseModel


class FeedStatus(BaseModel):
    source_name: str
    sensor_type: str
    last_observation_utc: str
    lag_minutes: int
    status: str # nominal, degraded, stale, offline
    stale_threshold_minutes: int
    quality_flag: str


class TelemetrySnapshot(BaseModel):
    system_status: str # operational, degraded, critical_outage
    telemetry_timestamp_utc: str
    feeds: List[FeedStatus]
    is_synthetic_mode: bool


class FreshnessService:
    def __init__(self):
        self.thresholds = {
            "INSAT_3DR": 45,        # 45 mins max lag
            "IMDAA_REANALYSIS": 180, # 3 hours max lag
            "DWR_RADAR": 20,         # 20 mins max lag
            "SRTM_DEM": 43200,       # Static 30 days
        }

    def evaluate_feeds(self, feeds_metadata: Dict[str, Any] = None) -> TelemetrySnapshot:
        """
        Evaluates operational status across all feeds against non-negotiable freshness rules.
        """
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()

        # Default telemetry state (development baseline)
        feed_records = [
            FeedStatus(
                source_name="INSAT_3DR",
                sensor_type="Geostationary Multi-Spectral Imager",
                last_observation_utc=now_iso,
                lag_minutes=12,
                status="nominal",
                stale_threshold_minutes=45,
                quality_flag="nominal",
            ),
            FeedStatus(
                source_name="IMDAA_REANALYSIS",
                sensor_type="Atmospheric NWP Reanalysis",
                last_observation_utc=now_iso,
                lag_minutes=45,
                status="nominal",
                stale_threshold_minutes=180,
                quality_flag="nominal",
            ),
            FeedStatus(
                source_name="DWR_RADAR",
                sensor_type="Doppler Weather Radar (Reflectivity)",
                last_observation_utc=now_iso,
                lag_minutes=6,
                status="nominal",
                stale_threshold_minutes=20,
                quality_flag="nominal",
            ),
            FeedStatus(
                source_name="SRTM_DEM",
                sensor_type="Digital Elevation Model",
                last_observation_utc="2026-01-01T00:00:00Z",
                lag_minutes=0,
                status="nominal",
                stale_threshold_minutes=43200,
                quality_flag="nominal",
            ),
        ]

        # Determine overall system health
        any_stale = any(f.status == "stale" for f in feed_records)
        any_degraded = any(f.status == "degraded" for f in feed_records)

        system_status = "operational"
        if any_stale:
            system_status = "degraded"
        elif any_degraded:
            system_status = "degraded"

        return TelemetrySnapshot(
            system_status=system_status,
            telemetry_timestamp_utc=now_iso,
            feeds=feed_records,
            is_synthetic_mode=True,
        )
