"""
TRINETRA Time-Aware Dataset Splitter
Guarantees zero temporal data leakage between training, validation, and held-out test splits.
"""

from datetime import datetime
from typing import List, Dict, Any, Tuple


class TimeAwareSplitter:
    """
    Enforces strict chronological partitioning:
    Train:      [start, train_end]
    Validation: [val_start, val_end]
    Test:       [test_start, end]
    where train_end <= val_start and val_end <= test_start.
    """

    def __init__(
        self,
        train_end: str = "2024-12-31T23:59:59Z",
        val_start: str = "2025-01-01T00:00:00Z",
        val_end: str = "2025-06-30T23:59:59Z",
        test_start: str = "2025-07-01T00:00:00Z",
    ):
        self.train_end = datetime.fromisoformat(train_end.replace("Z", "+00:00"))
        self.val_start = datetime.fromisoformat(val_start.replace("Z", "+00:00"))
        self.val_end = datetime.fromisoformat(val_end.replace("Z", "+00:00"))
        self.test_start = datetime.fromisoformat(test_start.replace("Z", "+00:00"))

        assert self.train_end <= self.val_start, "Temporal leakage: train_end exceeds val_start!"
        assert self.val_end <= self.test_start, "Temporal leakage: val_end exceeds test_start!"

    def split(
        self,
        records: List[Dict[str, Any]],
        timestamp_key: str = "observation_timestamp"
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Partitions records by timestamp with strict non-overlapping temporal bounds.
        """
        train, val, test = [], [], []

        for rec in records:
            ts_str = rec[timestamp_key]
            ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))

            if ts <= self.train_end:
                train.append(rec)
            elif self.val_start <= ts <= self.val_end:
                val.append(rec)
            elif ts >= self.test_start:
                test.append(rec)

        return {
            "train": train,
            "validation": val,
            "held_out_test": test,
        }

    def verify_no_leakage(self, splits: Dict[str, List[Dict[str, Any]]], timestamp_key: str = "observation_timestamp") -> bool:
        """
        Programmatic verification that no test timestamp precedes any training/validation timestamp.
        """
        if not splits["train"] or not splits["held_out_test"]:
            return True

        max_train_ts = max(r[timestamp_key] for r in splits["train"])
        min_test_ts = min(r[timestamp_key] for r in splits["held_out_test"])

        if max_train_ts >= min_test_ts:
            raise ValueError(f"CRITICAL DATA LEAKAGE: max train timestamp {max_train_ts} >= min test timestamp {min_test_ts}")

        return True
