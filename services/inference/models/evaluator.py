"""
TRINETRA Rare-Event Verification & Evaluation Metrics Engine
Computes Precision, Recall, F1, PR-AUC, Brier Calibration Score, and Critical Success Index (CSI).
"""

import math
from typing import List, Dict, Any, Tuple


class Evaluator:
    @staticmethod
    def compute_metrics(
        y_true: List[int],
        y_prob: List[float],
        threshold: float = 0.45
    ) -> Dict[str, float]:
        """
        Calculates verification metrics tailored for severe convective rare events.
        """
        assert len(y_true) == len(y_prob), "Length mismatch between ground truth and predicted probabilities."
        n = len(y_true)
        if n == 0:
            return {}

        tp, fp, fn, tn = 0, 0, 0, 0
        brier_sum = 0.0

        for yt, yp in zip(y_true, y_prob):
            brier_sum += (yp - yt) ** 2
            y_pred = 1 if yp >= threshold else 0

            if yt == 1 and y_pred == 1:
                tp += 1
            elif yt == 0 and y_pred == 1:
                fp += 1
            elif yt == 1 and y_pred == 0:
                fn += 1
            else:
                tn += 1

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        # Critical Success Index (CSI / Threat Score)
        csi = tp / (tp + fp + fn) if (tp + fp + fn) > 0 else 0.0

        # Brier Score (lower is better, 0.0 is perfect calibration)
        brier_score = round(brier_sum / n, 4)

        # Trapezoidal PR-AUC approximation over probability thresholds
        pr_curve = []
        for t in [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]:
            t_tp = sum(1 for yt, yp in zip(y_true, y_prob) if yt == 1 and yp >= t)
            t_fp = sum(1 for yt, yp in zip(y_true, y_prob) if yt == 0 and yp >= t)
            t_fn = sum(1 for yt, yp in zip(y_true, y_prob) if yt == 1 and yp < t)

            p = t_tp / (t_tp + t_fp) if (t_tp + t_fp) > 0 else 1.0
            r = t_tp / (t_tp + t_fn) if (t_tp + t_fn) > 0 else 0.0
            pr_curve.append((r, p))

        # Sort by recall ascending
        pr_curve.sort(key=lambda x: x[0])
        pr_auc = 0.0
        for i in range(len(pr_curve) - 1):
            r1, p1 = pr_curve[i]
            r2, p2 = pr_curve[i + 1]
            pr_auc += (r2 - r1) * ((p1 + p2) / 2.0)

        pr_auc = min(1.0, max(0.0, round(pr_auc + (pr_curve[0][0] * pr_curve[0][1]), 3)))

        return {
            "samples_count": n,
            "decision_threshold": threshold,
            "precision": round(precision, 3),
            "recall": round(recall, 3),
            "f1_score": round(f1, 3),
            "pr_auc": pr_auc,
            "csi_threat_score": round(csi, 3),
            "brier_calibration_score": brier_score,
        }
