"""
Spatiotemporal Multi-Task Deep Learning Model for TRINETRA
Shared Conv3D backbone with separate prediction heads for:
1. Severe Thunderstorm Probability
2. Cloudburst Probability (>= 100 mm/h)
3. Flash-Flood Risk
Across forecast horizons: T+2h, T+4h, T+6h.
"""

from typing import Dict, Tuple, List, Optional
import torch
import torch.nn as nn
import torch.nn.functional as F

MODEL_VERSION = "v1.0.0-conv3d-multitask"
FEATURE_CHANNELS = [
    "tir1_brightness_temp",
    "btd_tir1_tir2",
    "tir1_cooling_rate",
    "cape",
    "cin",
    "tpw",
    "omega_vertical_velocity",
    "dem_elevation",
    "dem_slope",
    "dem_twi",
]
NUM_CHANNELS = len(FEATURE_CHANNELS)
DEFAULT_HORIZONS = ["2h", "4h", "6h"]
NUM_HORIZONS = len(DEFAULT_HORIZONS)


class Conv3DBlock(nn.Module):
    """Spatiotemporal convolution block with batch norm and LeakyReLU."""

    def __init__(self, in_channels: int, out_channels: int, temporal_kernel: int = 2):
        super().__init__()
        self.conv = nn.Conv3d(
            in_channels=in_channels,
            out_channels=out_channels,
            kernel_size=(temporal_kernel, 3, 3),
            padding=(0, 1, 1),
        )
        self.bn = nn.BatchNorm3d(out_channels)
        self.act = nn.LeakyReLU(0.1, inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.act(self.bn(self.conv(x)))


class SpatiotemporalBackbone(nn.Module):
    """
    Spatiotemporal feature extraction backbone.
    Consumes sequence of grids: [Batch, Time=4, Channels=10, Height, Width]
    Permutes to [Batch, Channels=10, Time=4, Height, Width] for 3D convolutions.
    Contracts temporal dimension to extract dynamic growth rates and convergence.
    """

    def __init__(self, in_channels: int = NUM_CHANNELS, base_filters: int = 32):
        super().__init__()
        self.block1 = Conv3DBlock(in_channels, base_filters, temporal_kernel=2)
        self.block2 = Conv3DBlock(base_filters, base_filters * 2, temporal_kernel=2)
        self.block3 = Conv3DBlock(base_filters * 2, base_filters * 2, temporal_kernel=2)
        self.out_channels = base_filters * 2

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        # x shape: [B, T, C, H, W] -> permute to [B, C, T, H, W]
        if x.dim() == 5 and x.shape[1] == 4 and x.shape[2] == NUM_CHANNELS:
            x = x.permute(0, 2, 1, 3, 4)
        elif x.dim() == 5 and x.shape[1] == NUM_CHANNELS:
            # Already [B, C, T, H, W]
            pass
        else:
            raise ValueError(f"Expected 5D tensor with {NUM_CHANNELS} channels, got shape {x.shape}")

        h = self.block1(x)  # T: 4 -> 3
        h = self.block2(h)  # T: 3 -> 2
        h = self.block3(h)  # T: 2 -> 1, shape: [B, out_channels, 1, H, W]

        spatial_features = h.squeeze(2)  # [B, out_channels, H, W]
        pooled = F.adaptive_avg_pool2d(spatial_features, (1, 1)).flatten(1)  # [B, out_channels]
        return pooled, spatial_features


class HazardPredictionHead(nn.Module):
    """Specialized MLP prediction head for a hazard type across horizons."""

    def __init__(self, in_features: int, num_horizons: int = NUM_HORIZONS, dropout_p: float = 0.2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, 32),
            nn.LayerNorm(32),
            nn.LeakyReLU(0.1),
            nn.Dropout(dropout_p),
            nn.Linear(32, num_horizons),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)  # Raw logits [B, num_horizons]


class SpatialHeatmapHead(nn.Module):
    """1x1 Conv head generating per-cell spatial hazard intensity maps."""

    def __init__(self, in_channels: int, num_horizons: int = NUM_HORIZONS):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.LeakyReLU(0.1),
            nn.Conv2d(16, num_horizons, kernel_size=1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.conv(x)  # Raw logits [B, num_horizons, H, W]


class SpatiotemporalMultiTaskNet(nn.Module):
    """
    TRINETRA Conv3D Multi-Task Severe Weather Nowcasting Model.
    Outputs:
    - thunderstorm_logits: [B, num_horizons]
    - cloudburst_logits: [B, num_horizons]
    - flash_flood_logits: [B, num_horizons]
    - spatial_maps: dict with [B, num_horizons, H, W] per hazard
    """

    def __init__(
        self,
        in_channels: int = NUM_CHANNELS,
        base_filters: int = 32,
        num_horizons: int = NUM_HORIZONS,
    ):
        super().__init__()
        self.model_version = MODEL_VERSION
        self.feature_channels = FEATURE_CHANNELS
        self.horizons = DEFAULT_HORIZONS

        self.backbone = SpatiotemporalBackbone(in_channels, base_filters)
        backbone_dim = self.backbone.out_channels

        # Multi-task classification/risk heads
        self.thunderstorm_head = HazardPredictionHead(backbone_dim, num_horizons)
        self.cloudburst_head = HazardPredictionHead(backbone_dim, num_horizons)
        self.flash_flood_head = HazardPredictionHead(backbone_dim, num_horizons)

        # Spatial pixel heads
        self.spatial_thunderstorm = SpatialHeatmapHead(backbone_dim, num_horizons)
        self.spatial_cloudburst = SpatialHeatmapHead(backbone_dim, num_horizons)
        self.spatial_flash_flood = SpatialHeatmapHead(backbone_dim, num_horizons)

    def forward(self, x: torch.Tensor) -> Dict[str, torch.Tensor]:
        """
        Forward pass.
        Args:
            x: Tensor of shape [Batch, Timesteps=4, Channels=10, Height, Width]
        Returns:
            Dictionary containing logits and spatial heatmaps.
        """
        pooled, spatial_feats = self.backbone(x)

        ts_logits = self.thunderstorm_head(pooled)
        cb_logits = self.cloudburst_head(pooled)
        ff_logits = self.flash_flood_head(pooled)

        ts_spatial = self.spatial_thunderstorm(spatial_feats)
        cb_spatial = self.spatial_cloudburst(spatial_feats)
        ff_spatial = self.spatial_flash_flood(spatial_feats)

        return {
            "thunderstorm_logits": ts_logits,
            "cloudburst_logits": cb_logits,
            "flash_flood_logits": ff_logits,
            "spatial_thunderstorm_logits": ts_spatial,
            "spatial_cloudburst_logits": cb_spatial,
            "spatial_flash_flood_logits": ff_spatial,
        }

    def predict_probabilities(
        self, x: torch.Tensor, temperature: float = 1.0
    ) -> Dict[str, torch.Tensor]:
        """
        Compute sigmoid probabilities with temperature scaling.
        """
        logits_dict = self.forward(x)
        return {
            "thunderstorm_prob": torch.sigmoid(logits_dict["thunderstorm_logits"] / temperature),
            "cloudburst_prob": torch.sigmoid(logits_dict["cloudburst_logits"] / temperature),
            "flash_flood_prob": torch.sigmoid(logits_dict["flash_flood_logits"] / temperature),
            "spatial_thunderstorm": torch.sigmoid(logits_dict["spatial_thunderstorm_logits"] / temperature),
            "spatial_cloudburst": torch.sigmoid(logits_dict["spatial_cloudburst_logits"] / temperature),
            "spatial_flash_flood": torch.sigmoid(logits_dict["spatial_flash_flood_logits"] / temperature),
        }
