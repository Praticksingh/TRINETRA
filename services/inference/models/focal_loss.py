"""
Class-Imbalance Handling and Probability Calibration for TRINETRA.
Includes:
- Binary Focal Loss for rare convective extremes (cloudbursts, flash floods)
- Multi-Task Composite Loss
- Temperature / Platt Scaling Probability Calibration
- Expected Calibration Error (ECE) metric
"""

from typing import Dict, Tuple, Optional
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F


class BinaryFocalLoss(nn.Module):
    """
    Binary Focal Loss for severe convective events where positive cases are rare.
    FL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)
    """

    def __init__(self, alpha: float = 0.75, gamma: float = 2.0, reduction: str = "mean"):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            logits: Unnormalized network outputs [B, ...]
            targets: Binary labels (0 or 1) [B, ...]
        """
        targets = targets.float()
        probs = torch.sigmoid(logits)
        bce_loss = F.binary_cross_entropy_with_logits(logits, targets, reduction="none")

        # p_t: probability of true class
        p_t = probs * targets + (1 - probs) * (1 - targets)
        # alpha_t: weighting for rare positive class
        alpha_t = self.alpha * targets + (1 - self.alpha) * (1 - targets)

        focal_weight = alpha_t * torch.pow((1.0 - p_t).clamp(min=0.0, max=1.0), self.gamma)
        loss = focal_weight * bce_loss

        if self.reduction == "mean":
            return loss.mean()
        elif self.reduction == "sum":
            return loss.sum()
        return loss


class MultiTaskHazardLoss(nn.Module):
    """
    Composite Multi-Task loss for TRINETRA:
    Balances Thunderstorm, Cloudburst (higher focal weight), and Flash-Flood heads.
    """

    def __init__(
        self,
        weight_ts: float = 1.0,
        weight_cb: float = 2.0,  # Cloudburst is rarer, higher weighting
        weight_ff: float = 1.5,
        weight_spatial: float = 0.5,
        gamma: float = 2.0,
    ):
        super().__init__()
        self.weight_ts = weight_ts
        self.weight_cb = weight_cb
        self.weight_ff = weight_ff
        self.weight_spatial = weight_spatial

        self.focal_ts = BinaryFocalLoss(alpha=0.60, gamma=gamma)
        self.focal_cb = BinaryFocalLoss(alpha=0.85, gamma=gamma)  # Heavy imbalance
        self.focal_ff = BinaryFocalLoss(alpha=0.75, gamma=gamma)

    def forward(
        self,
        preds: Dict[str, torch.Tensor],
        targets: Dict[str, torch.Tensor],
    ) -> Dict[str, torch.Tensor]:
        loss_ts = self.focal_ts(preds["thunderstorm_logits"], targets["thunderstorm"])
        loss_cb = self.focal_cb(preds["cloudburst_logits"], targets["cloudburst"])
        loss_ff = self.focal_ff(preds["flash_flood_logits"], targets["flash_flood"])

        total_loss = (
            self.weight_ts * loss_ts
            + self.weight_cb * loss_cb
            + self.weight_ff * loss_ff
        )

        # Spatial pixel loss if targets provided
        if "spatial_thunderstorm" in targets:
            sp_ts = self.focal_ts(preds["spatial_thunderstorm_logits"], targets["spatial_thunderstorm"])
            sp_cb = self.focal_cb(preds["spatial_cloudburst_logits"], targets["spatial_cloudburst"])
            sp_ff = self.focal_ff(preds["spatial_flash_flood_logits"], targets["spatial_flash_flood"])
            total_loss += self.weight_spatial * (sp_ts + sp_cb + sp_ff)

        return {
            "total_loss": total_loss,
            "loss_thunderstorm": loss_ts,
            "loss_cloudburst": loss_cb,
            "loss_flash_flood": loss_ff,
        }


class TemperatureCalibrator(nn.Module):
    """
    Temperature Scaling / Platt Calibrator for multi-task hazard heads.
    Learns positive temperature parameters per hazard head to optimize Brier calibration.
    """

    def __init__(self, num_heads: int = 3):
        super().__init__()
        # Initialize temperature at 1.0 (log_temp = 0.0)
        self.log_temperatures = nn.Parameter(torch.zeros(num_heads))

    def forward(
        self,
        ts_logits: torch.Tensor,
        cb_logits: torch.Tensor,
        ff_logits: torch.Tensor,
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        temps = torch.exp(self.log_temperatures).clamp(min=0.1, max=10.0)
        cal_ts = torch.sigmoid(ts_logits / temps[0])
        cal_cb = torch.sigmoid(cb_logits / temps[1])
        cal_ff = torch.sigmoid(ff_logits / temps[2])
        return cal_ts, cal_cb, cal_ff

    def get_temperatures(self) -> Dict[str, float]:
        temps = torch.exp(self.log_temperatures).detach().cpu().numpy()
        return {
            "thunderstorm_temp": float(temps[0]),
            "cloudburst_temp": float(temps[1]),
            "flash_flood_temp": float(temps[2]),
        }

    def calibrate(
        self,
        val_logits: Dict[str, torch.Tensor],
        val_labels: Dict[str, torch.Tensor],
        lr: float = 0.01,
        max_iters: int = 100,
    ) -> Dict[str, float]:
        """
        Fit temperatures on validation set using L-BFGS or Adam.
        """
        optimizer = torch.optim.Adam(self.parameters(), lr=lr)
        criterion = nn.BCEWithLogitsLoss()

        for _ in range(max_iters):
            optimizer.zero_grad()
            temps = torch.exp(self.log_temperatures).clamp(min=0.1, max=10.0)
            l_ts = criterion(val_logits["thunderstorm"] / temps[0], val_labels["thunderstorm"].float())
            l_cb = criterion(val_logits["cloudburst"] / temps[1], val_labels["cloudburst"].float())
            l_ff = criterion(val_logits["flash_flood"] / temps[2], val_labels["flash_flood"].float())
            loss = l_ts + l_cb + l_ff
            loss.backward()
            optimizer.step()

        return self.get_temperatures()


def compute_expected_calibration_error(
    probs: np.ndarray,
    labels: np.ndarray,
    num_bins: int = 10,
) -> float:
    """
    Computes Expected Calibration Error (ECE):
    ECE = sum_{b} (|B_m| / N) * |acc(B_m) - conf(B_m)|
    """
    probs = np.clip(probs.flatten(), 0.0, 1.0)
    labels = labels.flatten().astype(int)

    bin_boundaries = np.linspace(0.0, 1.0, num_bins + 1)
    ece = 0.0
    total_samples = len(probs)

    for i in range(num_bins):
        bin_lower = bin_boundaries[i]
        bin_upper = bin_boundaries[i + 1]
        in_bin = (probs >= bin_lower) & (probs < bin_upper if i < num_bins - 1 else probs <= bin_upper)
        bin_size = np.sum(in_bin)

        if bin_size > 0:
            bin_acc = np.mean(labels[in_bin])
            bin_conf = np.mean(probs[in_bin])
            ece += (bin_size / total_samples) * np.abs(bin_acc - bin_conf)

    return float(ece)
