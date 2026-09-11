"""
TRINETRA Python ML Inference Microservice
Authoritative service for scientific data processing, spatiotemporal inference, and explainable risk attribution.
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="TRINETRA ML Inference Service",
    description="Microservice for hyper-local severe convective weather nowcasting (2-6h horizons)",
    version="0.1.0",
)

# Enable CORS for local development and console access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Data Models (Pydantic schemas mirroring data/schemas/forecast_event.json) ---

class BoundingBox(BaseModel):
    min_lon: float
    min_lat: float
    max_lon: float
    max_lat: float


class PredictRequest(BaseModel):
    region_id: str = Field(default="IN-UT", description="Region identifier (e.g., IN-UT for Uttarakhand)")
    bounding_box: Optional[BoundingBox] = None
    observation_timestamp: Optional[str] = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC observation timestamp",
    )
    horizons_minutes: List[int] = Field(
        default=[60, 120, 180, 240, 300, 360],
        description="List of forecast lead times in minutes",
    )
    include_xai: bool = Field(default=True, description="Whether to include feature attribution factors")


class HazardProbabilities(BaseModel):
    thunderstorm: float = Field(ge=0.0, le=1.0)
    cloudburst: float = Field(ge=0.0, le=1.0)
    flash_flood: float = Field(ge=0.0, le=1.0)


class TerrainFactors(BaseModel):
    slope_deg: float
    twi: float
    catchment_vuln: float = Field(ge=0.0, le=1.0)


class XAIAttribution(BaseModel):
    feature: str
    contribution: float
    observed_value: Optional[float] = None
    unit: Optional[str] = None


class GridCellPrediction(BaseModel):
    grid_cell_id: str
    centroid: List[float] = Field(min_length=2, max_length=2, description="[longitude, latitude]")
    horizon_minutes: int
    valid_time: str
    probabilities: HazardProbabilities
    severity: str
    terrain_factors: Optional[TerrainFactors] = None
    xai_attribution: Optional[List[XAIAttribution]] = None


class PredictResponse(BaseModel):
    forecast_id: str
    model_version: str
    generated_at: str
    data_timestamp: str
    is_synthetic_replay: bool
    region_code: str
    grid_resolution_deg: float
    predictions: List[GridCellPrediction]


# --- Endpoints ---

@app.get("/health", tags=["Monitoring"])
def health_check():
    """Service readiness and health probe."""
    return {
        "status": "healthy",
        "service": "trinetra-ml-inference",
        "version": "0.1.0",
        "model_version": "v0.1.0-baseline-synthetic",
        "gpu_available": False,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/api/v1/nowcast/predict", response_model=PredictResponse, tags=["Inference"])
def predict_nowcast(payload: PredictRequest):
    """
    Generate spatiotemporal severe weather risk forecasts.
    Returns deterministic calibrated probabilities and XAI feature attributions.
    """
    now_utc = datetime.now(timezone.utc).isoformat()
    data_ts = payload.observation_timestamp or now_utc

    # Development baseline: reproducible synthetic replay cells over the pilot region
    sample_cells: List[GridCellPrediction] = [
        GridCellPrediction(
            grid_cell_id="cell_3012_7824",
            centroid=[78.24, 30.12],
            horizon_minutes=120,
            valid_time=now_utc,
            probabilities=HazardProbabilities(
                thunderstorm=0.76,
                cloudburst=0.54,
                flash_flood=0.81,
            ),
            severity="warning",
            terrain_factors=TerrainFactors(
                slope_deg=38.4,
                twi=12.1,
                catchment_vuln=0.85,
            ),
            xai_attribution=[
                XAIAttribution(feature="cape", contribution=0.38, observed_value=3100.0, unit="J/kg"),
                XAIAttribution(feature="bt_tir1_cooling_rate", contribution=0.29, observed_value=-16.5, unit="K/hr"),
                XAIAttribution(feature="slope_deg", contribution=0.21, observed_value=38.4, unit="deg"),
                XAIAttribution(feature="tpw", contribution=0.12, observed_value=58.2, unit="mm"),
            ],
        ),
        GridCellPrediction(
            grid_cell_id="cell_3016_7828",
            centroid=[78.28, 30.16],
            horizon_minutes=180,
            valid_time=now_utc,
            probabilities=HazardProbabilities(
                thunderstorm=0.62,
                cloudburst=0.31,
                flash_flood=0.48,
            ),
            severity="watch",
            terrain_factors=TerrainFactors(
                slope_deg=24.1,
                twi=9.3,
                catchment_vuln=0.52,
            ),
            xai_attribution=[
                XAIAttribution(feature="cape", contribution=0.44, observed_value=2600.0, unit="J/kg"),
                XAIAttribution(feature="cin", contribution=-0.15, observed_value=-22.0, unit="J/kg"),
                XAIAttribution(feature="bt_tir1_cooling_rate", contribution=0.25, observed_value=-9.8, unit="K/hr"),
            ],
        ),
    ]

    return PredictResponse(
        forecast_id=f"fct_syn_{int(datetime.now(timezone.utc).timestamp())}",
        model_version="v0.1.0-baseline-synthetic",
        generated_at=now_utc,
        data_timestamp=data_ts,
        is_synthetic_replay=True,
        region_code=payload.region_id,
        grid_resolution_deg=0.04,
        predictions=sample_cells,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
