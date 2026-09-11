"""
TRINETRA Python ML Inference Microservice
Authoritative service for scientific data processing, spatiotemporal inference, and explainable risk attribution.
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
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


# --- Phase 3 Ingestion & Normalization Endpoints ---

from ingestion.normalizer import SpatiotemporalNormalizer
from ingestion.freshness import FreshnessService, TelemetrySnapshot
from ingestion.synthetic_replay import generate_synthetic_nowcast_payload

normalizer = SpatiotemporalNormalizer()
freshness_service = FreshnessService()


@app.get("/api/v1/ingestion/status", response_model=TelemetrySnapshot, tags=["Ingestion"])
def get_ingestion_status():
    """Returns telemetry lag, quality flags, and operational status for all input feeds."""
    return freshness_service.evaluate_feeds()


@app.post("/api/v1/ingestion/normalize", tags=["Ingestion"])
def normalize_observation_batch(raw_batch: Dict[str, Any]):
    """Ingests multi-sensor observation batch, aligns to EPSG:4326 grid, and outputs normalized feature tensor."""
    try:
        return normalizer.process_raw_batch(raw_batch)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/ingestion/sample-batch", tags=["Ingestion"])
def get_sample_normalized_batch():
    """Produces a deterministic, end-to-end normalized Uttarakhand convective event batch."""
    raw_sample = generate_synthetic_nowcast_payload()
    return normalizer.process_raw_batch(raw_sample)


# --- Phase 4 Baseline Forecast Models & Benchmarks ---

import json
from pathlib import Path
from models.persistence import PersistenceBaseline
from models.climatology import ClimatologyBaseline
from models.tree_baseline import TreeBaseline

persistence_model = PersistenceBaseline()
climatology_model = ClimatologyBaseline()
tree_model = TreeBaseline()


class BaselinePredictRequest(BaseModel):
    baseline_type: str = Field(default="tree", description="One of: 'tree', 'persistence', 'climatology'")
    horizon_minutes: int = Field(default=120, ge=0, le=360)
    cells: Optional[List[Dict[str, Any]]] = None


@app.post("/api/v1/forecast/baseline", tags=["Baseline Forecast"])
def predict_baseline(req: BaselinePredictRequest):
    """Generates baseline forecast predictions for operational comparison."""
    if req.baseline_type == "persistence":
        model = persistence_model
    elif req.baseline_type == "climatology":
        model = climatology_model
    else:
        model = tree_model

    cells_input = req.cells or [
        {"cell_id": "3012_7824", "name": "Rishikesh", "cape": 3150.0, "cooling_rate": -16.5, "slope_deg": 38.4, "twi": 12.1, "tpw": 58.2, "elevation": 372.0},
        {"cell_id": "3073_7906", "name": "Kedarnath", "cape": 3850.0, "cooling_rate": -21.4, "slope_deg": 46.2, "twi": 14.8, "tpw": 64.2, "elevation": 3583.0},
        {"cell_id": "3031_7803", "name": "Dehradun", "cape": 2650.0, "cooling_rate": -8.5, "slope_deg": 22.5, "twi": 9.4, "tpw": 51.0, "elevation": 640.0},
    ]

    results = []
    for cell in cells_input:
        pred = model.predict_cell(cell, horizon_minutes=req.horizon_minutes)
        results.append({
            "cell_id": cell["cell_id"],
            "name": cell.get("name", ""),
            "horizon_minutes": req.horizon_minutes,
            "is_test_baseline": True,
            "probabilities": {
                "thunderstorm": pred.thunderstorm_prob,
                "cloudburst": pred.cloudburst_prob,
                "flash_flood": pred.flash_flood_prob,
            },
            "severity": pred.severity,
            "contributing_factors": pred.contributing_factors,
        })

    return {
        "model_name": model.model_name,
        "model_version": model.model_version,
        "model_type": model.model_type,
        "is_test_baseline": True,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "predictions": results,
    }


@app.get("/api/v1/forecast/evaluation-metrics", tags=["Baseline Forecast"])
def get_evaluation_metrics():
    """Returns verified held-out benchmark evaluation metrics."""
    metrics_path = Path(__file__).resolve().parent.parent.parent / "ml" / "evaluation" / "baseline_metrics.json"
    if metrics_path.exists():
        with open(metrics_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"error": "Baseline metrics file not found"}


# --- Phase 5 Spatiotemporal Deep Model Endpoints ---

from models.deep_inference import TrinetraDeepInference

deep_inference_engine = TrinetraDeepInference(
    checkpoint_path=str(Path(__file__).resolve().parent.parent.parent / "ml" / "checkpoints" / "v1.0.0-conv3d-multitask.pt")
)


class DeepNowcastRequest(BaseModel):
    region_id: str = Field(default="IN-UT", description="Region identifier")
    horizons: List[str] = Field(default=["2h", "4h", "6h"])
    is_synthetic_replay: bool = Field(default=True)
    tensor_input: Optional[List[List[List[List[float]]]]] = Field(
        default=None,
        description="Optional 4D spatiotemporal tensor: [Time=4, Channels=10, Height, Width]",
    )


@app.post("/api/v1/forecast/deep-nowcast", tags=["Deep Learning Nowcast"])
def predict_deep_nowcast(req: DeepNowcastRequest):
    """
    Executes Spatiotemporal Conv3D Multi-Task deep nowcast.
    Returns calibrated multi-head probabilities (Thunderstorm, Cloudburst, Flash Flood)
    with microsecond latency measurement and explicit data provenance.
    """
    if req.tensor_input is not None:
        import numpy as np
        tensor_np = np.array(req.tensor_input, dtype=np.float32)
    else:
        # Default representative Uttarakhand convective observation grid (10 channels, 15x15)
        import numpy as np
        # Produce realistic convective profile with rapid cooling and steep terrain
        tensor_np = np.zeros((4, 10, 15, 15), dtype=np.float32)
        for t in range(4):
            tensor_np[t, 0, :, :] = (210.0 - 4.5 * t - 200.0) / 100.0  # Cold cloud-top (210K -> 196K)
            tensor_np[t, 1, :, :] = (2.5 + 0.3 * t) / 10.0            # BTD
            tensor_np[t, 2, :, :] = (-14.0 * (1.0 + 0.1 * t)) / 15.0  # Severe cooling rate
            tensor_np[t, 3, :, :] = (3200.0 + 150.0 * t) / 4000.0     # High CAPE
            tensor_np[t, 4, :, :] = 25.0 / 200.0                      # Weak CIN
            tensor_np[t, 5, :, :] = (62.0 + 2.0 * t) / 80.0           # Very high precipitable water
            tensor_np[t, 6, :, :] = (-1.4 - 0.2 * t) / 2.0            # Strong ascent
            tensor_np[t, 7, :, :] = 2800.0 / 4000.0                   # High elevation
            tensor_np[t, 8, :, :] = 36.0 / 60.0                       # Steep slope
            tensor_np[t, 9, :, :] = 11.5 / 15.0                       # High TWI / convergent valley

    result = deep_inference_engine.predict(
        tensor_data=tensor_np,
        is_synthetic_replay=req.is_synthetic_replay,
        source_id=f"deep_conv3d_{req.region_id}",
    )
    result["region_id"] = req.region_id
    result["generated_at"] = datetime.now(timezone.utc).isoformat()
    return result


@app.get("/api/v1/forecast/hurdle-comparison", tags=["Deep Learning Nowcast"])
def get_hurdle_comparison():
    """
    Returns head-to-head benchmark comparison between the Deep Spatiotemporal Model
    and the Phase 4 Tree Baseline on the identical held-out test split.
    """
    comparison_path = Path(__file__).resolve().parent.parent.parent / "ml" / "evaluation" / "model_comparison.json"
    if comparison_path.exists():
        with open(comparison_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # Fallback to deep metrics
    deep_path = Path(__file__).resolve().parent.parent.parent / "ml" / "evaluation" / "deep_model_metrics.json"
    if deep_path.exists():
        with open(deep_path, "r", encoding="utf-8") as f:
            return json.load(f)

    return {"error": "Comparison metrics not yet generated"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

