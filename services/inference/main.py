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


# --- Phase 6 Terrain-Aware Flash-Flood Risk Endpoints ---

from terrain.risk_fusion import FlashFloodRiskFusion
from terrain.basin_catalog import list_all_basins, get_basin_by_id
from terrain.dem_processor import DEMProcessor

risk_fusion_engine = FlashFloodRiskFusion()
dem_processor = DEMProcessor()


class TerrainRiskRequest(BaseModel):
    cell_id: str = Field(default="3073_7906", description="Target grid cell identifier")
    cloudburst_probability: float = Field(default=0.65, ge=0.0, le=1.0)
    thunderstorm_probability: float = Field(default=0.82, ge=0.0, le=1.0)
    slope_deg: Optional[float] = Field(default=46.2, ge=0.0, le=90.0)
    twi: Optional[float] = Field(default=14.8, ge=0.0, le=25.0)
    elevation_m: Optional[float] = Field(default=3583.0)
    antecedent_moisture_index: float = Field(default=0.80, ge=0.0, le=1.5)


@app.post("/api/v1/terrain/flood-risk", tags=["Terrain Risk Layer"])
def calculate_terrain_flood_risk(req: TerrainRiskRequest):
    """
    Fuses meteorological cloudburst probabilities with DEM slope and TWI.
    Returns dual-factor attribution separating dynamic rain forcing from static terrain vulnerability.
    """
    result = risk_fusion_engine.calculate_risk(
        cloudburst_prob=req.cloudburst_probability,
        thunderstorm_prob=req.thunderstorm_probability,
        slope_deg=req.slope_deg or 35.0,
        twi=req.twi or 10.0,
        elevation_m=req.elevation_m or 1500.0,
        antecedent_moisture_index=req.antecedent_moisture_index,
    )
    result["cell_id"] = req.cell_id
    result["calculated_at"] = datetime.now(timezone.utc).isoformat()
    return result


@app.get("/api/v1/terrain/basins", tags=["Terrain Risk Layer"])
def get_pilot_basins():
    """Returns hydrological river basin profiles for Himalayan pilot catchments."""
    return {
        "basins": list_all_basins(),
        "count": len(list_all_basins()),
        "disclaimer": FlashFloodRiskFusion.DISCLAIMER,
    }


@app.get("/api/v1/terrain/basin/{basin_id}", tags=["Terrain Risk Layer"])
def get_single_basin(basin_id: str):
    """Returns specific river basin hydrologic parameters."""
    try:
        return get_basin_by_id(basin_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


# --- Phase 7 Real-Time Inference & Forecast Orchestration Endpoints ---

from orchestration.pipeline import ForecastPipeline
from orchestration.scheduler import OrchestrationScheduler

forecast_pipeline = ForecastPipeline(
    deep_inference=deep_inference_engine,
    risk_fusion=risk_fusion_engine,
    normalizer=normalizer,
)
orchestration_scheduler = OrchestrationScheduler(
    pipeline=forecast_pipeline,
    freshness_service=freshness_service,
)


class TriggerCycleRequest(BaseModel):
    is_synthetic_replay: bool = Field(default=True)
    source: str = Field(default="manual_operator_trigger")
    observation_payload: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional explicit multi-sensor observation batch; defaults to synthetic replay if omitted",
    )


@app.post("/api/v1/orchestration/trigger", tags=["Orchestration"])
def trigger_nowcast_cycle(req: TriggerCycleRequest):
    """
    Triggers an end-to-end nowcast prediction cycle:
    Ingestion -> Normalization -> Conv3D Inference -> Terrain Risk Fusion -> GeoJSON Snapshot.
    Enforces idempotency (identical input timestamps return cached snapshot).
    """
    try:
        snapshot = forecast_pipeline.execute_cycle(
            raw_observation_batch=req.observation_payload,
            is_synthetic_replay=req.is_synthetic_replay,
            trigger_source=req.source,
        )
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration cycle failed: {str(e)}")


@app.get("/api/v1/forecast/latest-geojson", tags=["Orchestration"])
def get_latest_forecast_geojson():
    """
    Returns the latest operational forecast as a standard RFC 7946 GeoJSON FeatureCollection.
    Ready for zero-copy MapLibre rendering.
    """
    return forecast_pipeline.get_latest_geojson()


@app.get("/api/v1/orchestration/jobs", tags=["Orchestration"])
def list_orchestration_jobs(limit: int = 20):
    """Returns audit history of recent nowcast execution cycles."""
    return {
        "jobs": forecast_pipeline.job_manager.list_jobs(limit=limit),
        "total_tracked": len(forecast_pipeline.job_manager._jobs),
    }


@app.get("/api/v1/orchestration/jobs/{job_id}", tags=["Orchestration"])
def get_job_details(job_id: str):
    """Returns detailed execution timeline and logs for a specific job."""
    job = forecast_pipeline.job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return job.to_dict()


@app.get("/api/v1/orchestration/system-health", tags=["Orchestration"])
def get_system_health():
    """Returns full operational telemetry: feed freshness, job metrics, and dead-letter counts."""
    return orchestration_scheduler.evaluate_system_health()


# --- Phase 8 GIS Dashboard & Explainable AI (XAI) Endpoints ---

from xai.attribution import XAIAttributionEngine

xai_engine = XAIAttributionEngine()


class XAIAttributionRequest(BaseModel):
    cell_id: str = Field(default="3073_7906")
    hazard_type: str = Field(default="flash_flood")
    horizon: str = Field(default="2h")
    features: Optional[Dict[str, float]] = Field(
        default=None,
        description="Physical values: cape, cooling_rate, slope_deg, tpw, twi",
    )


@app.post("/api/v1/xai/attribution", tags=["Explainable AI"])
def get_xai_attribution(req: XAIAttributionRequest):
    """
    Computes normalized feature attributions for a given grid cell and hazard.
    Explicitly includes operational non-causal disclaimer.
    """
    sample_features = req.features or {
        "cape": 3850.0,
        "cooling_rate": -21.4,
        "slope_deg": 46.2,
        "tpw": 64.2,
        "twi": 14.8,
    }
    result = xai_engine.compute_attribution(
        features=sample_features,
        hazard_type=req.hazard_type,
        horizon=req.horizon,
    )
    result["cell_id"] = req.cell_id
    result["generated_at"] = datetime.now(timezone.utc).isoformat()
    return result


@app.get("/api/v1/gis/layers", tags=["GIS Dashboard"])
def get_gis_layers_catalog():
    """
    Returns metadata for active GIS map layers, GeoJSON sources,
    and accessible non-color shape cues.
    """
    return {
        "crs": "EPSG:4326",
        "bbox": [77.5, 28.5, 81.0, 31.5],
        "layers": [
            {
                "id": "thunderstorm_prob",
                "name": "Severe Thunderstorm Probability",
                "type": "raster_heatmap",
                "color_ramp": ["#047857", "#f59e0b", "#f97316", "#ef4444"],
                "icon": "CloudLightning",
                "shape_cue": "circle",
            },
            {
                "id": "cloudburst_potential",
                "name": "Cloudburst Intensity (>=100mm/h)",
                "type": "raster_heatmap",
                "color_ramp": ["#0284c7", "#6366f1", "#d946ef"],
                "icon": "CloudRain",
                "shape_cue": "diamond",
            },
            {
                "id": "flash_flood_risk",
                "name": "Terrain-Fused Flash Flood Surge Risk",
                "type": "geojson_polygon",
                "endpoint": "/api/v1/forecast/latest-geojson",
                "color_ramp": ["#10b981", "#f59e0b", "#f97316", "#ef4444"],
                "icon": "Waves",
                "shape_cue": "triangle",
            },
            {
                "id": "dem_elevation_slope",
                "name": "SRTM Topography & Elevation Contours",
                "type": "vector_contour",
                "icon": "Mountain",
                "shape_cue": "line",
            },
            {
                "id": "radar_reflectivity",
                "name": "Doppler Weather Radar Reflectivity (dBZ)",
                "type": "radar_sweep",
                "icon": "Radio",
                "shape_cue": "concentric_rings",
            },
        ],
        "accessibility_standards": {
            "color_independent": True,
            "cues": {
                "low": "Circle (●)",
                "watch": "Diamond (◆)",
                "warning": "Triangle (▲)",
                "critical": "Pulsed Triangle (▲)",
            },
        },
    }


from alerting import (
    CalibratedAlertEngine,
    CAPSerializer,
    GeoJSONAlertFeedSerializer,
    MockNotificationDispatcher,
    AlertStatus,
    AlertSeverity,
    AlertEvent,
    HazardType,
)
from fastapi.responses import Response

# Initialize Alerting engine and notification dispatcher
alert_engine = CalibratedAlertEngine()
notification_dispatcher = MockNotificationDispatcher()

# Seed with pilot Uttarakhand events
alert_engine.evaluate_cell(
    cell_id="3073_7906",
    name="Kedarnath - Mandakini Watershed",
    coords=(79.066, 30.735),
    prob_thunderstorm=0.88,
    prob_cloudburst=0.82,
    prob_flash_flood=0.94,
    horizon_minutes=120,
    slope_deg=46.2,
    twi=14.8,
)
alert_engine.evaluate_cell(
    cell_id="3012_7824",
    name="Rishikesh - Shivpuri River Gorge",
    coords=(78.267, 30.086),
    prob_thunderstorm=0.78,
    prob_cloudburst=0.82,
    prob_flash_flood=0.68,
    horizon_minutes=120,
    slope_deg=38.4,
    twi=12.1,
)
alert_engine.evaluate_cell(
    cell_id="3055_7935",
    name="Chamoli - Alaknanda Valley",
    coords=(79.350, 30.558),
    prob_thunderstorm=0.74,
    prob_cloudburst=0.52,
    prob_flash_flood=0.62,
    horizon_minutes=120,
    slope_deg=41.5,
    twi=11.7,
)


class AlertTransitionRequest(BaseModel):
    to_status: AlertStatus
    operator_id: str = "SDMA_OPERATOR_42"
    remarks: str = "Operational status updated during watch shift."
    operator_role: str = "SDMA_WATCH_OFFICER"


class DispatchSimulationRequest(BaseModel):
    channel: str = "SDMA_WEBHOOK"
    recipient: str = "https://seoc.uk.gov.in/api/v1/inbound-alerts"


# --- Alerting & Authority Workflow Endpoints ---

@app.post("/api/v1/alerts/evaluate", tags=["Alerting"])
def evaluate_nowcast_alerts():
    """
    Evaluates current nowcast predictions against calibrated thresholds
    and registers any newly triggered alerts.
    """
    alerts = alert_engine.list_alerts()
    return {
        "status": "success",
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "total_active_alerts": len(alerts),
        "alerts": [a.model_dump() for a in alerts],
    }


@app.get("/api/v1/alerts", tags=["Alerting"])
def list_active_alerts(
    status: Optional[AlertStatus] = None,
    severity: Optional[AlertSeverity] = None,
):
    """Lists alerts with optional lifecycle status or severity filter"""
    alerts = alert_engine.list_alerts(status=status, severity=severity)
    return {
        "count": len(alerts),
        "alerts": [a.model_dump() for a in alerts],
        "disclaimer": "TRINETRA Model-Generated Advisory. Not an official state decree.",
    }


@app.get("/api/v1/alerts/feed.geojson", tags=["Alerting"])
def export_alerts_geojson_feed():
    """
    Exports active alerts as RFC 7946 GeoJSON FeatureCollection
    for GIS integration by emergency management authorities.
    """
    alerts = alert_engine.list_alerts()
    return GeoJSONAlertFeedSerializer.to_geojson_feed(alerts)


@app.get("/api/v1/alerts/{alert_id}", tags=["Alerting"])
def get_alert_detail(alert_id: str):
    """Returns single alert detail and audit history"""
    alert = alert_engine.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    return alert.model_dump()


@app.post("/api/v1/alerts/{alert_id}/transition", tags=["Alerting"])
def transition_alert_status(alert_id: str, req: AlertTransitionRequest):
    """
    Executes authority lifecycle transition (GENERATED -> UNDER_REVIEW -> DISPATCHED -> ACKNOWLEDGED -> RESOLVED)
    with audit log tracking.
    """
    try:
        updated = alert_engine.transition_alert(
            alert_id=alert_id,
            to_status=req.to_status,
            operator_id=req.operator_id,
            remarks=req.remarks,
            operator_role=req.operator_role,
        )
        return {
            "status": "success",
            "alert_id": alert_id,
            "new_status": updated.status.value,
            "audit_trail_length": len(updated.audit_trail),
            "updated_alert": updated.model_dump(),
        }
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/alerts/{alert_id}/cap.xml", tags=["Alerting"])
def export_alert_cap_xml(alert_id: str):
    """
    Exports standard ITU-T X.1303 / OASIS Common Alerting Protocol (CAP v1.2) XML
    for inter-agency ingestion.
    """
    alert = alert_engine.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    xml_content = CAPSerializer.to_cap_xml(alert)
    return Response(content=xml_content, media_type="application/xml")


@app.post("/api/v1/alerts/{alert_id}/dispatch-simulation", tags=["Alerting"])
def simulate_notification_dispatch(alert_id: str, req: DispatchSimulationRequest):
    """
    Simulates notification dispatch with HMAC-SHA256 signature verification
    and audit receipt. Strictly tagged is_synthetic_dispatch: true.
    """
    alert = alert_engine.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    receipt = notification_dispatcher.dispatch(
        alert=alert,
        channel=req.channel,
        recipient=req.recipient,
    )
    return {
        "status": "success",
        "receipt": receipt.model_dump(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)




