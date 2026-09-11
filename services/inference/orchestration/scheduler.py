"""
Automated Orchestration Scheduler and Health Monitor for TRINETRA.
Monitors:
- Feed arrival intervals & freshness
- Continuous nowcast execution cycles
- Dead-letter error counts and system diagnostics
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional

from ingestion.freshness import FreshnessService
from .job_manager import JobManager
from .pipeline import ForecastPipeline


class OrchestrationScheduler:
    """
    Simulates / manages background forecast intervals and evaluates end-to-end health.
    """

    def __init__(
        self,
        pipeline: Optional[ForecastPipeline] = None,
        freshness_service: Optional[FreshnessService] = None,
    ):
        self.pipeline = pipeline or ForecastPipeline()
        self.freshness_service = freshness_service or FreshnessService()
        self.is_running = True
        self.interval_seconds = 900  # 15 minutes operational satellite cycle

    def evaluate_system_health(self) -> Dict[str, Any]:
        """
        Gathers comprehensive telemetry across ingestion, inference, terrain, and jobs.
        """
        telemetry = self.freshness_service.evaluate_feeds()
        jobs = self.pipeline.job_manager.list_jobs(limit=10)
        dead_letters = self.pipeline.job_manager.get_dead_letters()
        latest = self.pipeline.get_latest_snapshot()

        total_jobs = len(jobs)
        failed_jobs = sum(1 for j in jobs if j["status"] in ["FAILED", "DEAD_LETTER"])
        completed_jobs = sum(1 for j in jobs if j["status"] == "COMPLETED")

        # System operational status
        is_healthy = telemetry.system_status in ["operational", "degraded"] and failed_jobs == 0
        status_label = "OPERATIONAL" if is_healthy else "DEGRADED"

        return {
            "status": status_label,
            "scheduler_active": self.is_running,
            "interval_minutes": self.interval_seconds // 60,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "telemetry": telemetry.model_dump(),
            "job_metrics": {
                "total_recent_jobs": total_jobs,
                "completed_jobs": completed_jobs,
                "failed_jobs": failed_jobs,
                "dead_letter_count": len(dead_letters),
            },
            "latest_cycle": {
                "snapshot_id": latest.get("snapshot_id") if latest else None,
                "data_timestamp": latest.get("data_timestamp") if latest else None,
                "generated_at": latest.get("generated_at") if latest else None,
                "latency_ms": latest.get("total_pipeline_latency_ms") if latest else None,
                "is_synthetic_replay": latest.get("is_synthetic_replay") if latest else True,
            },
            "dead_letter_queue": dead_letters[:5],
        }
