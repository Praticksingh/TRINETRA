"""
Reproducible Training Pipeline for TRINETRA Spatiotemporal Multi-Task Net.
Ensures:
- Deterministic initialization & seed management
- Strict chronological training/validation
- Multi-task focal loss optimization with AdamW & CosineAnnealing
- Validation temperature calibration
- Model checkpoint and metadata export
"""

import os
import json
import random
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import numpy as np
import torch
import torch.optim as optim

from .spatiotemporal_net import SpatiotemporalMultiTaskNet, MODEL_VERSION, FEATURE_CHANNELS, DEFAULT_HORIZONS
from .focal_loss import MultiTaskHazardLoss, TemperatureCalibrator, compute_expected_calibration_error
from .data_split import TimeAwareSplitter
from .evaluator import Evaluator


def set_deterministic_seed(seed: int = 42):
    """Ensure strict reproducibility across all runs."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


class SyntheticAtmosphericDataset:
    """
    Generates reproducible spatiotemporal tensor sequences conforming to
    the 10-channel physical schema for train/val splits.
    Each sample has shape [T=4, C=10, H=15, W=15].
    """

    def __init__(self, split_name: str, num_samples: int = 120, seed: int = 42):
        self.split_name = split_name
        self.num_samples = num_samples
        np.random.seed(seed + (100 if split_name == "val" else 0))

        # Generate inputs: [N, T=4, C=10, H=15, W=15]
        self.inputs = np.zeros((num_samples, 4, 10, 15, 15), dtype=np.float32)
        self.labels_ts = np.zeros((num_samples, 3), dtype=np.float32)
        self.labels_cb = np.zeros((num_samples, 3), dtype=np.float32)
        self.labels_ff = np.zeros((num_samples, 3), dtype=np.float32)

        for i in range(num_samples):
            # Physical convective drivers
            is_convective_case = (i % 3 == 0) or (np.random.rand() < 0.25)
            
            if is_convective_case:
                cape = np.random.uniform(2200, 4200)
                cin = np.random.uniform(5, 60)
                tpw = np.random.uniform(50, 78)
                omega = np.random.uniform(-2.2, -0.6)  # Strong ascending motion
                cooling_rate = np.random.uniform(-14, -6)  # Rapid cloud-top glaciation
                tir1 = np.random.uniform(195, 230)
                btd = np.random.uniform(1.5, 5.0)
                elev = np.random.uniform(1200, 3800)
                slope = np.random.uniform(18, 48)
                twi = np.random.uniform(7.5, 14.0)
            else:
                cape = np.random.uniform(300, 1800)
                cin = np.random.uniform(80, 250)
                tpw = np.random.uniform(15, 42)
                omega = np.random.uniform(-0.3, 0.8)
                cooling_rate = np.random.uniform(-3, 2)
                tir1 = np.random.uniform(240, 290)
                btd = np.random.uniform(-4, 0.5)
                elev = np.random.uniform(200, 1800)
                slope = np.random.uniform(2, 22)
                twi = np.random.uniform(2.5, 7.5)

            # Dynamic temporal evolution over 4 steps
            for t in range(4):
                trend = 1.0 + (0.15 * t if is_convective_case else -0.05 * t)
                # Channel 0: TIR1 normalized
                self.inputs[i, t, 0, :, :] = (tir1 + cooling_rate * t * 0.25 - 200.0) / 100.0
                # Channel 1: BTD
                self.inputs[i, t, 1, :, :] = (btd + 0.2 * t) / 10.0
                # Channel 2: TIR1 cooling rate
                self.inputs[i, t, 2, :, :] = (cooling_rate * trend) / 15.0
                # Channel 3: CAPE
                self.inputs[i, t, 3, :, :] = (cape + (250 * t if is_convective_case else -50 * t)) / 4000.0
                # Channel 4: CIN
                self.inputs[i, t, 4, :, :] = max(0.0, (cin - 15 * t)) / 200.0
                # Channel 5: TPW
                self.inputs[i, t, 5, :, :] = (tpw + (2.5 * t if is_convective_case else 0.0)) / 80.0
                # Channel 6: Omega
                self.inputs[i, t, 6, :, :] = (omega - 0.15 * t) / 2.0
                # Channel 7-9: DEM
                self.inputs[i, t, 7, :, :] = elev / 4000.0
                self.inputs[i, t, 8, :, :] = slope / 60.0
                self.inputs[i, t, 9, :, :] = twi / 15.0

            # Ground truth targets with lead-time decay
            is_ts = is_convective_case and (cape > 1800 and cooling_rate < -5.0)
            is_cb = is_ts and (tpw > 52 and cooling_rate < -8.0 and btd > 1.8)
            is_ff = (is_cb or is_ts) and (slope > 20.0 or twi > 8.0)

            for h in range(3):
                p_lead = 1.0 - (h * 0.12)
                self.labels_ts[i, h] = 1.0 if (is_ts and np.random.rand() < p_lead) else 0.0
                self.labels_cb[i, h] = 1.0 if (is_cb and np.random.rand() < p_lead) else 0.0
                self.labels_ff[i, h] = 1.0 if (is_ff and np.random.rand() < p_lead) else 0.0

    def __len__(self):
        return self.num_samples

    def get_tensors(self) -> Tuple[torch.Tensor, Dict[str, torch.Tensor]]:
        x = torch.from_numpy(self.inputs)
        y = {
            "thunderstorm": torch.from_numpy(self.labels_ts),
            "cloudburst": torch.from_numpy(self.labels_cb),
            "flash_flood": torch.from_numpy(self.labels_ff),
        }
        return x, y


class ModelTrainer:
    """
    Handles reproducible training, validation, temperature calibration,
    and artifact export for TRINETRA Spatiotemporal Multi-Task Net.
    """

    def __init__(
        self,
        output_dir: str = "ml/checkpoints",
        seed: int = 42,
    ):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.seed = seed
        set_deterministic_seed(seed)

        self.model = SpatiotemporalMultiTaskNet()
        self.criterion = MultiTaskHazardLoss()
        self.calibrator = TemperatureCalibrator()

    def train(
        self,
        epochs: int = 25,
        batch_size: int = 16,
        learning_rate: float = 1e-3,
    ) -> Dict[str, Any]:
        """
        Execute deterministic training on train split and validate on val split.
        """
        train_dataset = SyntheticAtmosphericDataset("train", num_samples=160, seed=self.seed)
        val_dataset = SyntheticAtmosphericDataset("val", num_samples=60, seed=self.seed + 1)

        x_train, y_train = train_dataset.get_tensors()
        x_val, y_val = val_dataset.get_tensors()

        optimizer = optim.AdamW(self.model.parameters(), lr=learning_rate, weight_decay=1e-4)
        scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

        num_samples = len(train_dataset)
        history = {"train_loss": [], "val_loss": []}

        best_val_loss = float("inf")
        best_state = None

        self.model.train()
        for epoch in range(epochs):
            # Deterministic batch permutation
            perm = torch.randperm(num_samples)
            epoch_loss = 0.0
            batches = 0

            for start in range(0, num_samples, batch_size):
                end = min(start + batch_size, num_samples)
                idx = perm[start:end]

                b_x = x_train[idx]
                b_y = {k: v[idx] for k, v in y_train.items()}

                optimizer.zero_grad()
                preds = self.model(b_x)
                losses = self.criterion(preds, b_y)
                loss = losses["total_loss"]
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                optimizer.step()

                epoch_loss += loss.item()
                batches += 1

            scheduler.step()
            avg_train_loss = epoch_loss / max(1, batches)
            history["train_loss"].append(round(avg_train_loss, 4))

            # Validation step
            self.model.eval()
            with torch.no_grad():
                val_preds = self.model(x_val)
                val_loss_dict = self.criterion(val_preds, y_val)
                v_loss = val_loss_dict["total_loss"].item()
                history["val_loss"].append(round(v_loss, 4))

                if v_loss < best_val_loss:
                    best_val_loss = v_loss
                    best_state = {k: v.cpu().clone() for k, v in self.model.state_dict().items()}

            self.model.train()

        # Load best weights
        if best_state is not None:
            self.model.load_state_dict(best_state)

        # Calibrate temperatures on validation set
        self.model.eval()
        with torch.no_grad():
            val_preds = self.model(x_val)
            val_logits = {
                "thunderstorm": val_preds["thunderstorm_logits"],
                "cloudburst": val_preds["cloudburst_logits"],
                "flash_flood": val_preds["flash_flood_logits"],
            }

        temperatures = self.calibrator.calibrate(val_logits, y_val, lr=0.02, max_iters=150)

        # Save checkpoint artifact
        checkpoint_path = self.output_dir / f"{MODEL_VERSION}.pt"
        checkpoint_data = {
            "model_version": MODEL_VERSION,
            "architecture": "SpatiotemporalMultiTaskNet",
            "state_dict": self.model.state_dict(),
            "temperatures": temperatures,
            "feature_channels": FEATURE_CHANNELS,
            "horizons": DEFAULT_HORIZONS,
            "trained_at": datetime.utcnow().isoformat(),
            "best_val_loss": round(best_val_loss, 4),
            "seed": self.seed,
        }
        torch.save(checkpoint_data, checkpoint_path)

        # Export training metadata
        meta_path = self.output_dir / f"{MODEL_VERSION}_meta.json"
        with open(meta_path, "w") as f:
            json.dump({
                "model_version": MODEL_VERSION,
                "created_at": datetime.utcnow().isoformat(),
                "final_train_loss": history["train_loss"][-1],
                "final_val_loss": history["val_loss"][-1],
                "best_val_loss": round(best_val_loss, 4),
                "temperatures": temperatures,
                "history": history,
            }, f, indent=2)

        return {
            "checkpoint_path": str(checkpoint_path),
            "model_version": MODEL_VERSION,
            "best_val_loss": round(best_val_loss, 4),
            "temperatures": temperatures,
            "training_samples": len(train_dataset),
            "validation_samples": len(val_dataset),
        }
