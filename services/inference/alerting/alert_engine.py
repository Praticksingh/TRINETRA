"""TRINETRA Alert Engine & Authority Lifecycle Manager

Calibrated multi-hazard threshold evaluation, spatial clustering, and
authority review state machine for Himalayan convective events.

State Machine:
  GENERATED -> UNDER_REVIEW -> DISPATCHED -> ACKNOWLEDGED -> RESOLVED
                                         -> REVOKED

Scientific Guardrail:
  All algorithmic alerts are strictly branded and serialized as
  'MODEL-GENERATED ADVISORY' (is_official_warning: False).
"""

from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
from pydantic import BaseModel, Field


class AlertSeverity(str, Enum):
    ADVISORY = "advisory"
    WATCH = "watch"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    GENERATED = "GENERATED"
    UNDER_REVIEW = "UNDER_REVIEW"
    DISPATCHED = "DISPATCHED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"
    REVOKED = "REVOKED"


class HazardType(str, Enum):
    THUNDERSTORM = "thunderstorm"
    CLOUDBURST = "cloudburst"
    FLASH_FLOOD = "flash_flood"
    MULTI_HAZARD = "multi_hazard"


# State machine allowed transitions
ALLOWED_TRANSITIONS: Dict[AlertStatus, List[AlertStatus]] = {
    AlertStatus.GENERATED: [AlertStatus.UNDER_REVIEW, AlertStatus.REVOKED],
    AlertStatus.UNDER_REVIEW: [AlertStatus.DISPATCHED, AlertStatus.REVOKED, AlertStatus.GENERATED],
    AlertStatus.DISPATCHED: [AlertStatus.ACKNOWLEDGED, AlertStatus.REVOKED],
    AlertStatus.ACKNOWLEDGED: [AlertStatus.RESOLVED, AlertStatus.REVOKED],
    AlertStatus.RESOLVED: [],
    AlertStatus.REVOKED: [],
}


class AuditEntry(BaseModel):
    timestamp: str
    from_status: AlertStatus
    to_status: AlertStatus
    operator_id: str
    operator_role: str = "SDMA_WATCH_OFFICER"
    remarks: str


class AlertEvent(BaseModel):
    id: str = Field(default_factory=lambda: f"alt_{uuid.uuid4().hex[:12]}")
    hazard_type: HazardType
    severity: AlertSeverity
    status: AlertStatus = AlertStatus.GENERATED
    region_name: str
    headline: str
    description: str
    instruction: str
    issued_at: str
    valid_from: str
    valid_to: str
    lead_time_minutes: int
    is_official_warning: bool = False  # Strictly Model Advisory
    is_synthetic_replay: bool = True
    affected_cells: List[str] = Field(default_factory=list)
    boundary_polygon: List[List[float]] = Field(default_factory=list)  # [[lon, lat], ...]
    peak_probability: float
    trigger_metrics: Dict[str, float] = Field(default_factory=dict)
    audit_trail: List[AuditEntry] = Field(default_factory=list)


class CalibratedAlertEngine:
    """Evaluates nowcast probability grids against operational thresholds

    Calibrated Thresholds:
      - Advisory: P >= 0.35
      - Watch:    P >= 0.55
      - Warning:  P >= 0.75
      - Critical: Flash-Flood P >= 0.85 OR Cloudburst P >= 0.80
    """

    THRESHOLDS = {
        "advisory": 0.35,
        "watch": 0.55,
        "warning": 0.75,
        "critical_flash_flood": 0.85,
        "critical_cloudburst": 0.80,
    }

    def __init__(self):
        self._active_alerts: Dict[str, AlertEvent] = {}

    def evaluate_cell(
        self,
        cell_id: str,
        name: str,
        coords: Tuple[float, float],
        prob_thunderstorm: float,
        prob_cloudburst: float,
        prob_flash_flood: float,
        horizon_minutes: int,
        slope_deg: float = 30.0,
        twi: float = 8.0,
        base_time_iso: Optional[str] = None,
    ) -> Optional[AlertEvent]:
        """Evaluates a single grid cell and returns an AlertEvent if any threshold is exceeded"""
        now_iso = base_time_iso or datetime.now(timezone.utc).isoformat()

        # Determine highest severity and primary hazard
        peak_prob = max(prob_thunderstorm, prob_cloudburst, prob_flash_flood)
        if peak_prob < self.THRESHOLDS["advisory"]:
            return None

        # Severity determination
        if prob_flash_flood >= self.THRESHOLDS["critical_flash_flood"] or prob_cloudburst >= self.THRESHOLDS["critical_cloudburst"]:
            severity = AlertSeverity.CRITICAL
            hazard = HazardType.FLASH_FLOOD if prob_flash_flood >= prob_cloudburst else HazardType.CLOUDBURST
        elif peak_prob >= self.THRESHOLDS["warning"]:
            severity = AlertSeverity.WARNING
            if prob_cloudburst >= 0.65 and prob_flash_flood >= 0.65:
                hazard = HazardType.MULTI_HAZARD
            elif prob_flash_flood >= max(prob_thunderstorm, prob_cloudburst):
                hazard = HazardType.FLASH_FLOOD
            elif prob_cloudburst >= prob_thunderstorm:
                hazard = HazardType.CLOUDBURST
            else:
                hazard = HazardType.THUNDERSTORM
        elif peak_prob >= self.THRESHOLDS["watch"]:
            severity = AlertSeverity.WATCH
            hazard = HazardType.THUNDERSTORM if prob_thunderstorm >= max(prob_cloudburst, prob_flash_flood) else HazardType.FLASH_FLOOD
        else:
            severity = AlertSeverity.ADVISORY
            hazard = HazardType.THUNDERSTORM

        lon, lat = coords
        d = 0.04 / 2.0
        polygon = [
            [round(lon - d, 4), round(lat - d, 4)],
            [round(lon + d, 4), round(lat - d, 4)],
            [round(lon + d, 4), round(lat + d, 4)],
            [round(lon - d, 4), round(lat + d, 4)],
            [round(lon - d, 4), round(lat - d, 4)],
        ]

        # Valid time window
        valid_from = now_iso
        valid_to = now_iso

        # Human-readable advisory copy
        hazard_label = hazard.value.replace("_", " ").upper()
        severity_label = severity.value.upper()
        headline = f"{severity_label} ADVISORY: Potential {hazard_label} in {name}"
        
        description = (
            f"Automated AI nowcast indicates elevated {hazard_label} risk (Peak probability {peak_prob*100:.1f}%) "
            f"for catchment {name} at lead time T+{horizon_minutes}m. "
            f"Terrain slope: {slope_deg:.1f}°, Topographic Wetness Index: {twi:.1f}."
        )

        instruction = (
            "Precautionary operational alert for emergency coordinators. "
            "Monitor local stream gauges and await official IMD / State Disaster Management Authority bulletins."
        )

        alert = AlertEvent(
            hazard_type=hazard,
            severity=severity,
            status=AlertStatus.GENERATED,
            region_name=name,
            headline=headline,
            description=description,
            instruction=instruction,
            issued_at=now_iso,
            valid_from=valid_from,
            valid_to=valid_to,
            lead_time_minutes=horizon_minutes,
            is_official_warning=False,
            is_synthetic_replay=True,
            affected_cells=[cell_id],
            boundary_polygon=polygon,
            peak_probability=round(peak_prob, 4),
            trigger_metrics={
                "thunderstorm_prob": round(prob_thunderstorm, 4),
                "cloudburst_prob": round(prob_cloudburst, 4),
                "flash_flood_prob": round(prob_flash_flood, 4),
                "slope_deg": slope_deg,
                "twi": twi,
            },
            audit_trail=[
                AuditEntry(
                    timestamp=now_iso,
                    from_status=AlertStatus.GENERATED,
                    to_status=AlertStatus.GENERATED,
                    operator_id="SYSTEM_ALGORITHM",
                    remarks="Algorithmic threshold exceeded during nowcast cycle.",
                )
            ],
        )

        self._active_alerts[alert.id] = alert
        return alert

    def transition_alert(
        self,
        alert_id: str,
        to_status: AlertStatus,
        operator_id: str,
        remarks: str,
        operator_role: str = "SDMA_OPERATOR",
    ) -> AlertEvent:
        """Executes a lifecycle transition with strict validation and audit logging"""
        if alert_id not in self._active_alerts:
            raise KeyError(f"Alert ID '{alert_id}' not found.")

        alert = self._active_alerts[alert_id]
        current_status = alert.status

        # Validate transition
        allowed = ALLOWED_TRANSITIONS.get(current_status, [])
        if to_status not in allowed:
            raise ValueError(
                f"Invalid transition from {current_status} to {to_status}. "
                f"Allowed transitions are: {[s.value for s in allowed]}"
            )

        now_iso = datetime.now(timezone.utc).isoformat()
        audit_entry = AuditEntry(
            timestamp=now_iso,
            from_status=current_status,
            to_status=to_status,
            operator_id=operator_id,
            operator_role=operator_role,
            remarks=remarks,
        )

        alert.status = to_status
        alert.audit_trail.append(audit_entry)
        return alert

    def get_alert(self, alert_id: str) -> Optional[AlertEvent]:
        return self._active_alerts.get(alert_id)

    def list_alerts(
        self,
        status: Optional[AlertStatus] = None,
        severity: Optional[AlertSeverity] = None,
    ) -> List[AlertEvent]:
        """Returns filtered list of active alerts"""
        results = list(self._active_alerts.values())
        if status:
            results = [a for a in results if a.status == status]
        if severity:
            results = [a for a in results if a.severity == severity]
        return results

    def register_alert(self, alert: AlertEvent) -> None:
        """Manually registers an alert (used for test setup or persistence sync)"""
        self._active_alerts[alert.id] = alert

    def clear(self) -> None:
        self._active_alerts.clear()
