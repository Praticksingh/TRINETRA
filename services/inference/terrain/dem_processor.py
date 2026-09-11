"""
Digital Elevation Model (DEM) Feature Processor for TRINETRA.
Processes high-resolution elevation rasters to derive:
- Topographic Slope Gradient (degrees)
- Aspect and Curvature
- Topographic Wetness Index (TWI = ln(a / tan(beta)))
- Catchment Infiltration and Confinement Susceptibility
"""

from typing import Dict, Tuple, Optional, Any
import numpy as np


class DEMProcessor:
    """
    Computes hydrological and topographic indices from Digital Elevation Model grids.
    """

    def __init__(self, cell_size_meters: float = 30.0):
        self.cell_size_m = cell_size_meters

    def compute_slope_and_aspect(
        self, elevation_grid: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calculates slope gradient (in degrees) and aspect using 2nd-order finite differences.
        Args:
            elevation_grid: 2D numpy array of elevations in meters [H, W]
        Returns:
            Tuple of (slope_degrees, aspect_degrees)
        """
        assert elevation_grid.ndim == 2, "Elevation grid must be 2-dimensional"
        h, w = elevation_grid.shape

        # Compute spatial gradients with central difference
        dz_dx = np.zeros_like(elevation_grid, dtype=np.float32)
        dz_dy = np.zeros_like(elevation_grid, dtype=np.float32)

        dz_dx[:, 1:-1] = (elevation_grid[:, 2:] - elevation_grid[:, :-2]) / (2.0 * self.cell_size_m)
        dz_dy[1:-1, :] = (elevation_grid[2:, :] - elevation_grid[:-2, :]) / (2.0 * self.cell_size_m)

        # Boundary forward/backward differences
        dz_dx[:, 0] = (elevation_grid[:, 1] - elevation_grid[:, 0]) / self.cell_size_m
        dz_dx[:, -1] = (elevation_grid[:, -1] - elevation_grid[:, -2]) / self.cell_size_m
        dz_dy[0, :] = (elevation_grid[1, :] - elevation_grid[0, :]) / self.cell_size_m
        dz_dy[-1, :] = (elevation_grid[-1, :] - elevation_grid[-2, :]) / self.cell_size_m

        # Rise over run
        gradient_magnitude = np.sqrt(dz_dx**2 + dz_dy**2)
        slope_rad = np.arctan(gradient_magnitude)
        slope_deg = np.rad2deg(slope_rad)

        # Aspect (direction of slope in degrees from North)
        aspect_rad = np.arctan2(-dz_dy, dz_dx)
        aspect_deg = np.rad2deg(aspect_rad)
        aspect_deg = (aspect_deg + 360.0) % 360.0

        return slope_deg.astype(np.float32), aspect_deg.astype(np.float32)

    def compute_twi(
        self,
        slope_deg: np.ndarray,
        flow_accumulation: Optional[np.ndarray] = None,
    ) -> np.ndarray:
        """
        Computes Topographic Wetness Index (TWI):
        TWI = ln(a / tan(beta + epsilon))
        where 'a' is specific upslope catchment area and 'beta' is slope angle.
        High TWI corresponds to convergent valley floors, stream channels, and floodplains.
        """
        eps = 1e-4
        slope_rad = np.deg2rad(np.maximum(slope_deg, 0.5))  # Minimum 0.5 deg to avoid div by zero

        if flow_accumulation is None:
            # Synthetic proxy catchment area: inverted local relief proxy
            # Valley floors receive drainage from surrounding slopes
            h, w = slope_deg.shape
            y, x = np.ogrid[:h, :w]
            # Proxy specific contributing area: base 100m + slope inverse
            flow_accumulation = 100.0 + (500.0 / (np.sin(slope_rad) + 0.1))

        twi = np.log(flow_accumulation / (np.tan(slope_rad) + eps))
        # Clip TWI to physically realistic range [2.0, 18.0]
        return np.clip(twi, 2.0, 18.0).astype(np.float32)

    def calculate_terrain_susceptibility(
        self,
        elevation_grid: np.ndarray,
        slope_deg: Optional[np.ndarray] = None,
        twi: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        """
        Computes composite static terrain vulnerability index S_terrain in [0.0, 1.0].
        Weights:
        - 45% Slope Steepness (rapid runoff generation, high kinetic energy)
        - 35% Topographic Wetness Index (channel confinement & drainage convergence)
        - 20% Local Relief Gradient (hydraulic head)
        """
        if slope_deg is None:
            slope_deg, _ = self.compute_slope_and_aspect(elevation_grid)
        if twi is None:
            twi = self.compute_twi(slope_deg)

        # Normalize components into [0, 1]
        norm_slope = np.clip(slope_deg / 45.0, 0.0, 1.0)
        norm_twi = np.clip((twi - 3.0) / 12.0, 0.0, 1.0)

        # Local relief (max - min in 3x3 neighborhood proxy)
        relief = float(np.max(elevation_grid) - np.min(elevation_grid))
        norm_relief = np.clip(relief / 2500.0, 0.0, 1.0)

        # Composite susceptibility
        s_terrain = (0.45 * norm_slope) + (0.35 * norm_twi) + (0.20 * norm_relief)
        s_terrain = np.clip(s_terrain, 0.0, 1.0)

        return {
            "mean_elevation_m": round(float(np.mean(elevation_grid)), 1),
            "max_elevation_m": round(float(np.max(elevation_grid)), 1),
            "min_elevation_m": round(float(np.min(elevation_grid)), 1),
            "relief_m": round(relief, 1),
            "mean_slope_deg": round(float(np.mean(slope_deg)), 2),
            "max_slope_deg": round(float(np.max(slope_deg)), 2),
            "mean_twi": round(float(np.mean(twi)), 2),
            "max_twi": round(float(np.max(twi)), 2),
            "terrain_susceptibility_score": round(float(np.mean(s_terrain)), 3),
            "susceptibility_grid": s_terrain,
            "slope_grid": slope_deg,
            "twi_grid": twi,
        }
