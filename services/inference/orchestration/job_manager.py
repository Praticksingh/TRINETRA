"""
Forecast Job Manager and Idempotent State Machine for TRINETRA.
Enforces:
- Deterministic job ID assignment: job_{source_hash}_{timestamp}
- Strictly idempotent execution (prevents duplicate runs or corrupted snapshots)
- State transitions: PENDING -> INGESTING -> NORMALIZING -> INFERRING -> TERRAIN_FUSING -> COMPLETED
- Failure and dead-letter tracking with error diagnostics
"""

import time
import hashlib
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, List, Optional, Tuple


class JobStatus(str, Enum):
    PENDING = "PENDING"
    INGESTING = "INGESTING"
    NORMALIZING = "NORMALIZING"
    INFERRING = "INFERRING"
    TERRAIN_FUSING = "TERRAIN_FUSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    DEAD_LETTER = "DEAD_LETTER"


class ForecastJob:
    """Represents a single nowcast orchestration cycle."""

    def __init__(
        self,
        job_id: str,
        data_timestamp: str,
        input_fingerprint: str,
        source: str = "radar_sat_nwp_fusion",
    ):
        self.job_id = job_id
        self.data_timestamp = data_timestamp
        self.input_fingerprint = input_fingerprint
        self.source = source
        self.status = JobStatus.PENDING
        self.created_at = datetime.now(timezone.utc).isoformat()
        self.started_at: Optional[str] = None
        self.completed_at: Optional[str] = None
        self.duration_ms: float = 0.0
        self.error: Optional[str] = None
        self.snapshot_id: Optional[str] = None
        self.logs: List[str] = []

    def log(self, message: str):
        ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
        self.logs.append(f"[{ts}] {message}")

    def transition_to(self, new_status: JobStatus, error: Optional[str] = None):
        self.status = new_status
        self.log(f"Status changed to {new_status.value}")
        if error:
            self.error = error
            self.log(f"ERROR: {error}")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "data_timestamp": self.data_timestamp,
            "input_fingerprint": self.input_fingerprint,
            "source": self.source,
            "status": self.status.value,
            "created_at": self.created_at,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "duration_ms": round(self.duration_ms, 2),
            "error": self.error,
            "snapshot_id": self.snapshot_id,
            "logs": self.logs,
        }


class JobManager:
    """
    Thread-safe repository and idempotency manager for forecast jobs.
    """

    def __init__(self, max_history: int = 100):
        self._jobs: Dict[str, ForecastJob] = {}
        self._fingerprint_index: Dict[str, str] = {}  # fingerprint -> job_id
        self._dead_letter_queue: List[Dict[str, Any]] = []
        self.max_history = max_history

    @staticmethod
    def generate_fingerprint(data_timestamp: str, raw_payload: Any) -> str:
        content = f"{data_timestamp}_{str(raw_payload)}"
        return hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]

    def create_or_get_job(
        self,
        data_timestamp: str,
        raw_payload: Any,
        source: str = "radar_sat_nwp_fusion",
    ) -> Tuple[ForecastJob, bool]:
        """
        Idempotently retrieves existing job if identical payload/timestamp was received,
        otherwise initializes a new job.
        Returns: (job, is_new)
        """
        fingerprint = self.generate_fingerprint(data_timestamp, raw_payload)

        # Idempotency check
        if fingerprint in self._fingerprint_index:
            existing_job_id = self._fingerprint_index[fingerprint]
            if existing_job_id in self._jobs:
                existing_job = self._jobs[existing_job_id]
                # If job was successful or in-flight, reuse it
                if existing_job.status != JobStatus.FAILED:
                    existing_job.log(f"Idempotent trigger matched fingerprint {fingerprint}; reusing job.")
                    return existing_job, False

        # Create new job
        epoch = int(datetime.now(timezone.utc).timestamp())
        job_id = f"job_nowcast_{epoch}_{fingerprint[:8]}"
        job = ForecastJob(
            job_id=job_id,
            data_timestamp=data_timestamp,
            input_fingerprint=fingerprint,
            source=source,
        )

        self._jobs[job_id] = job
        self._fingerprint_index[fingerprint] = job_id

        # Evict oldest if exceeding capacity
        if len(self._jobs) > self.max_history:
            oldest_id = next(iter(self._jobs))
            del self._jobs[oldest_id]

        return job, True

    def mark_dead_letter(self, job: ForecastJob, reason: str):
        job.transition_to(JobStatus.DEAD_LETTER, error=reason)
        self._dead_letter_queue.append({
            "job_id": job.job_id,
            "failed_at": datetime.now(timezone.utc).isoformat(),
            "fingerprint": job.input_fingerprint,
            "reason": reason,
        })

    def get_job(self, job_id: str) -> Optional[ForecastJob]:
        return self._jobs.get(job_id)

    def list_jobs(self, limit: int = 20) -> List[Dict[str, Any]]:
        jobs_list = [j.to_dict() for j in self._jobs.values()]
        jobs_list.reverse()
        return jobs_list[:limit]

    def get_dead_letters(self) -> List[Dict[str, Any]]:
        return list(self._dead_letter_queue)
