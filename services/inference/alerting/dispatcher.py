"""TRINETRA Simulated Notification Dispatcher

Simulates secure multi-channel delivery (SMS gateway & Webhooks) with HMAC-SHA256
signatures and audit logging for emergency coordinators and field teams.

Guardrails:
  - Explicitly tagged is_synthetic_dispatch: True
  - Strictly labeled 'TRINETRA MODEL ADVISORY'
  - Zero invented third-party SMS provider credentials or live sirens
"""

from __future__ import annotations
import hmac
import hashlib
import json
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from .alert_engine import AlertEvent


class DispatchReceipt(BaseModel):
    receipt_id: str
    alert_id: str
    channel: str  # "SMS_GATEWAY" | "SDMA_WEBHOOK" | "SEOC_TERMINAL"
    recipient: str
    status: str  # "DELIVERED" | "SIMULATED_SUCCESS"
    status_code: int
    latency_ms: float
    dispatched_at: str
    payload_hash: str
    signature: str
    is_synthetic_dispatch: bool = True
    disclaimer: str = "Simulated delivery run. Model-generated advisory only."


class MockNotificationDispatcher:
    """Dispatches alerts to simulated downstream channels with HMAC signing"""

    SECRET_KEY = b"trinetra_authority_dispatch_signing_key_pilot_2026"

    def __init__(self):
        self._dispatch_log: List[DispatchReceipt] = []

    def _sign_payload(self, payload_bytes: bytes) -> str:
        """Computes HMAC-SHA256 signature for payload verification"""
        return hmac.new(self.SECRET_KEY, payload_bytes, hashlib.sha256).hexdigest()

    def dispatch(
        self,
        alert: AlertEvent,
        channel: str = "SDMA_WEBHOOK",
        recipient: str = "https://seoc.uk.gov.in/api/v1/inbound-alerts",
    ) -> DispatchReceipt:
        """Simulates dispatch of an alert and returns an audit receipt"""
        start_time = time.perf_counter()
        now_iso = datetime.now(timezone.utc).isoformat()

        payload = {
            "alert_id": alert.id,
            "headline": alert.headline,
            "severity": alert.severity.value,
            "hazard_type": alert.hazard_type.value,
            "region": alert.region_name,
            "peak_probability": alert.peak_probability,
            "lead_time_minutes": alert.lead_time_minutes,
            "valid_to": alert.valid_to,
            "instruction": alert.instruction,
            "is_official_warning": alert.is_official_warning,
            "is_synthetic_dispatch": True,
            "dispatched_at": now_iso,
        }

        payload_json = json.dumps(payload, sort_keys=True).encode("utf-8")
        payload_hash = hashlib.sha256(payload_json).hexdigest()
        signature = self._sign_payload(payload_json)
        latency_ms = round((time.perf_counter() - start_time) * 1000.0 + 15.0, 2)  # Simulated latency

        receipt = DispatchReceipt(
            receipt_id=f"rcpt_{hashlib.md5(f'{alert.id}_{now_iso}'.encode()).hexdigest()[:10]}",
            alert_id=alert.id,
            channel=channel,
            recipient=recipient,
            status="SIMULATED_SUCCESS",
            status_code=200,
            latency_ms=latency_ms,
            dispatched_at=now_iso,
            payload_hash=payload_hash,
            signature=signature,
            is_synthetic_dispatch=True,
        )

        self._dispatch_log.append(receipt)
        return receipt

    def get_dispatch_history(self, alert_id: Optional[str] = None) -> List[DispatchReceipt]:
        if alert_id:
            return [r for r in self._dispatch_log if r.alert_id == alert_id]
        return list(self._dispatch_log)
