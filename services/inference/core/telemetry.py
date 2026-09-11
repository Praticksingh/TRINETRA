"""TRINETRA Operational Telemetry & Prometheus Metric Exporter

Exposes Prometheus exposition text format (v0.0.4) for integration with
Prometheus, Grafana, and disaster operations center (SEOC) monitoring dashboards.
"""

from __future__ import annotations
import time
from typing import Dict, Any, List


class PrometheusMetricCollector:
    """In-memory thread-safe Prometheus metrics collector"""

    def __init__(self):
        # Counters
        self.http_requests_total: Dict[str, int] = {}
        self.predictions_total: int = 0
        self.alerts_generated_total: int = 0
        self.rate_limit_blocks_total: int = 0
        self.circuit_breaker_trips_total: int = 0

        # Gauges
        self.active_alerts_count: int = 0
        self.last_inference_latency_ms: float = 0.0
        self.model_version: str = "v1.0.0-conv3d-multitask"

    def record_request(self, endpoint: str, status_code: int) -> None:
        key = f'{endpoint}|{status_code}'
        self.http_requests_total[key] = self.http_requests_total.get(key, 0) + 1

    def record_prediction(self, cell_count: int, latency_ms: float) -> None:
        self.predictions_total += cell_count
        self.last_inference_latency_ms = round(latency_ms, 2)

    def record_alert_generated(self, count: int = 1) -> None:
        self.alerts_generated_total += count

    def set_active_alerts(self, count: int) -> None:
        self.active_alerts_count = count

    def record_rate_limit_block(self) -> None:
        self.rate_limit_blocks_total += 1

    def record_circuit_breaker_trip(self) -> None:
        self.circuit_breaker_trips_total += 1

    def export_text(self) -> str:
        """Formats all metrics into standard Prometheus exposition format v0.0.4"""
        lines = []

        # 1. Total HTTP Requests
        lines.append("# HELP trinetra_http_requests_total Total number of HTTP requests by route and status code.")
        lines.append("# TYPE trinetra_http_requests_total counter")
        if not self.http_requests_total:
            lines.append('trinetra_http_requests_total{route="/health",status="200"} 0')
        else:
            for key, count in sorted(self.http_requests_total.items()):
                endpoint, status = key.split("|")
                lines.append(f'trinetra_http_requests_total{{route="{endpoint}",status="{status}"}} {count}')

        # 2. Predictions Total
        lines.append("# HELP trinetra_predictions_total Total number of grid cell nowcasts predicted.")
        lines.append("# TYPE trinetra_predictions_total counter")
        lines.append(f"trinetra_predictions_total {self.predictions_total}")

        # 3. Alerts Generated Total
        lines.append("# HELP trinetra_alerts_generated_total Total number of authority alerts generated.")
        lines.append("# TYPE trinetra_alerts_generated_total counter")
        lines.append(f"trinetra_alerts_generated_total {self.alerts_generated_total}")

        # 4. Rate Limit Blocks Total
        lines.append("# HELP trinetra_rate_limit_blocks_total Total number of requests blocked by sliding window rate limiter.")
        lines.append("# TYPE trinetra_rate_limit_blocks_total counter")
        lines.append(f"trinetra_rate_limit_blocks_total {self.rate_limit_blocks_total}")

        # 5. Circuit Breaker Trips
        lines.append("# HELP trinetra_circuit_breaker_trips_total Total times upstream circuit breakers tripped to OPEN.")
        lines.append("# TYPE trinetra_circuit_breaker_trips_total counter")
        lines.append(f"trinetra_circuit_breaker_trips_total {self.circuit_breaker_trips_total}")

        # 6. Active Alerts Gauge
        lines.append("# HELP trinetra_active_alerts Current number of unresolved authority alerts.")
        lines.append("# TYPE trinetra_active_alerts gauge")
        lines.append(f"trinetra_active_alerts {self.active_alerts_count}")

        # 7. Inference Latency Gauge
        lines.append("# HELP trinetra_inference_latency_ms Latency of most recent nowcast cycle in milliseconds.")
        lines.append("# TYPE trinetra_inference_latency_ms gauge")
        lines.append(f"trinetra_inference_latency_ms {self.last_inference_latency_ms}")

        # 8. Model Info
        lines.append("# HELP trinetra_model_info Active AI nowcasting model version information.")
        lines.append("# TYPE trinetra_model_info gauge")
        lines.append(f'trinetra_model_info{{version="{self.model_version}",engine="conv3d"}} 1')

        return "\n".join(lines) + "\n"


# Global shared singleton
telemetry = PrometheusMetricCollector()
