# TRINETRA System Architecture Overview

## 1. Executive Summary

TRINETRA delivers hyper-local nowcasts for severe convective and hydrological hazards with a 2–6 hour actionable lead window. The system separates interactive decision-support visualization, authoritative data persistence, and heavy scientific computation into modular, decoupled layers.

```mermaid
flowchart TB
    subgraph DataSources["Authorized Data Feeds"]
        INSAT["Satellite Imagery (INSAT-3D/3DR TIR1/TIR2/WV)"]
        IMDAA["Numerical Reanalysis / NWP Grids"]
        DEM["High-Res Digital Elevation Models (SRTM/CartoDEM)"]
        RADAR["Doppler Weather Radar (Reflectivity/Velocity)"]
    end

    subgraph DataIngestion["Data Ingestion & Preprocessing"]
        IngestService["Ingestion Workers"]
        Norm["Spatiotemporal Normalization & Alignment Engine"]
    end

    subgraph MLService["Python Inference Microservice (FastAPI)"]
        PreProc["Xarray Grid Tensor Builder"]
        TerrainEngine["Terrain Vulnerability Engine (Slope/Flow Accumulation)"]
        Backbone["Spatiotemporal Multi-Task Deep Model (ConvLSTM / 3D-CNN)"]
        Calibrator["Isotonic Probability Calibrator"]
        XAIEngine["Feature Attribution / XAI Engine"]
    end

    subgraph SupabaseBackend["Authoritative Application Backend (Supabase)"]
        PostgreSQL["PostgreSQL 16 + PostGIS"]
        Storage["Object Storage (Model Artifacts & GeoTIFFs)"]
        Realtime["Realtime Alert Dispatch & WebSockets"]
        EdgeFunctions["Orchestration & Webhook Edge Functions"]
    end

    subgraph ClientLayer["Frontend Application (Next.js 14)"]
        Console["Meteorological Operations Console"]
        MapEngine["MapLibre GL JS Vector / Raster Canvas"]
        Timeline["2-6 Hour Predictive Horizon Slider"]
        XAIModal["Explainable AI & Risk Attribution Drawer"]
        AlertManager["Categorized Alert Workflow & Lifecycle"]
    end

    DataSources --> IngestService
    IngestService --> Norm
    Norm --> PreProc
    PreProc --> Backbone
    TerrainEngine --> Backbone
    Backbone --> Calibrator
    Calibrator --> XAIEngine
    XAIEngine --> PostgreSQL
    PostgreSQL --> Realtime
    Realtime --> Console
    PostgreSQL --> EdgeFunctions
    EdgeFunctions --> Console
    Console --> MapEngine
    Console --> Timeline
    Console --> XAIModal
    Console --> AlertManager
```

---

## 2. Component Responsibilities

### 2.1 Web Frontend (`apps/web`)
- **Role**: High-density GIS operations console designed for disaster management authorities and meteorologists.
- **Key Capabilities**:
  - WebGL/WebGPU-accelerated multi-layer map rendering via **MapLibre GL JS**.
  - Multi-hazard probability surface visualization (Thunderstorm, Cloudburst, Flash Flood).
  - Time-scrubbing controls with 15-minute resolution across the 2–6 hour forecast horizon.
  - Drill-down inspector for single-grid-cell atmospheric sounding profiles and terrain indices.
  - Strict UI state model: Loading, Fresh, Degraded, Stale (>45 min lag), and Offline.

### 2.2 Application Backend (`supabase/`)
- **Role**: System-of-record, spatial database, user identity, and real-time pub/sub.
- **Key Capabilities**:
  - Spatial indexes (`GIST`) on grid centroids and polygon hazard zones.
  - Row Level Security (RLS) enforcing access roles: `viewer`, `analyst`, `incident_commander`, `admin`.
  - Realtime publication on `alerts` and `forecast_snapshots` tables.
  - Audit logging of alert acknowledgments and operational escalations.

### 2.3 ML Inference Microservice (`services/inference`)
- **Role**: Stateless, containerized Python service executing scientific calculations and model inference.
- **Key Capabilities**:
  - Processing satellite and atmospheric multi-band rasters into aligned 4D tensors `(batch, time, channels, lat, lon)`.
  - Spatiotemporal multi-task neural network generating calibrated probabilities for each hazard.
  - DEM terrain analysis computing topographic wetness index (TWI), slope, and drainage basin flow accumulation.
  - Fast response times (<1.5s for regional inference tile) with documented latency budgets.
