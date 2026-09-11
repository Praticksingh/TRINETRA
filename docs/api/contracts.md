# TRINETRA API Contracts & Specification

## 1. Overview

TRINETRA follows an asynchronous, event-driven pattern for data ingestion and nowcasting updates, combined with synchronous REST endpoints for fast interactive GIS queries.

---

## 2. ML Inference Microservice Endpoints (FastAPI)

Base URL: `http://localhost:8000/api/v1`

### 2.1 Health & Service Readiness
- **Endpoint**: `GET /health`
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "trinetra-ml-inference",
  "version": "0.1.0",
  "model_version": "v0.1.0-baseline",
  "gpu_available": false,
  "timestamp": "2026-09-11T09:00:00Z"
}
```

### 2.2 Predict Regional Nowcast
- **Endpoint**: `POST /nowcast/predict`
- **Headers**: `Content-Type: application/json`, `X-API-Key: <internal_key>`
- **Request Body**:
```json
{
  "region_id": "IN-UT-01",
  "bounding_box": {
    "min_lon": 78.50,
    "min_lat": 30.10,
    "max_lon": 79.50,
    "max_lat": 31.00
  },
  "observation_timestamp": "2026-09-11T08:30:00Z",
  "horizons_minutes": [60, 120, 180, 240, 300, 360],
  "include_xai": true
}
```
- **Response `200 OK`**:
```json
{
  "forecast_id": "fct_20260911_0830_001",
  "model_version": "v0.1.0-baseline",
  "generated_at": "2026-09-11T08:32:15Z",
  "data_timestamp": "2026-09-11T08:30:00Z",
  "is_synthetic_replay": true,
  "grid_resolution_deg": 0.04,
  "predictions": [
    {
      "cell_id": "c_3045_7890",
      "centroid": [78.90, 30.45],
      "horizon_minutes": 120,
      "valid_time": "2026-09-11T10:30:00Z",
      "probabilities": {
        "thunderstorm": 0.68,
        "cloudburst": 0.42,
        "flash_flood": 0.55
      },
      "severity": "watch",
      "terrain_factors": {
        "slope_deg": 34.2,
        "twi": 11.4,
        "catchment_vuln": 0.72
      },
      "xai_attribution": [
        { "feature": "cape", "contribution": 0.35, "observed_value": 2850, "unit": "J/kg" },
        { "feature": "bt_tir1_cooling_rate", "contribution": 0.28, "observed_value": -14.2, "unit": "K/hr" },
        { "feature": "tpw", "contribution": 0.19, "observed_value": 54.0, "unit": "mm" },
        { "feature": "slope_deg", "contribution": 0.18, "observed_value": 34.2, "unit": "deg" }
      ]
    }
  ]
}
```

---

## 3. Supabase REST & Realtime Contracts

### 3.1 Fetch Current Risk Map
- **Endpoint**: `GET /rest/v1/forecast_snapshots?select=*&order=generated_at.desc&limit=1`
- **Response**: Snapshot of current active grid cells with GeoJSON polygon geometries.

### 3.2 Alerts Channel (Realtime WebSocket)
- **Topic**: `public:alerts`
- **Event**: `INSERT` / `UPDATE`
- **Payload**:
```json
{
  "id": "alt_8931a",
  "severity": "warning",
  "hazard_type": "flash_flood",
  "region_name": "Rishikesh-Dehradun Basin",
  "headline": "Flash Flood Warning: High Risk in 2-4 Hours",
  "description": "Rapid convective buildup combined with high slope vulnerability in the Chandrabhaga watershed.",
  "status": "generated",
  "valid_from": "2026-09-11T10:00:00Z",
  "valid_to": "2026-09-11T14:00:00Z",
  "model_version": "v0.1.0-baseline",
  "is_official_warning": false
}
```
