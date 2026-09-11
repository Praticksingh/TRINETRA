# ADR 0001: Technology Stack Selection & Boundaries

- **Status**: Approved
- **Date**: 2026-09-11
- **Deciders**: Architecture Team, Senior Full-Stack Lead
- **Technical Context**: Phased Development Plan Section 3 & Section 4

---

## Context and Problem Statement

Severe weather nowcasting requires high-frequency processing of multidimensional atmospheric arrays (e.g. satellite infrared bands, vertical temperature profiles) and real-time dissemination to disaster management teams. The solution requires:
1. Fast, accessible GIS visualization on modern desktop and mobile browsers.
2. Robust geospatial indexing and real-time streaming to hundreds of operational consoles.
3. High-throughput scientific computing and neural inference without blocking web requests.

## Decision Drivers

- **Security & Privacy**: Zero client-side secrets; zero unauthorized external network dependencies.
- **Maintainability**: Clear separation between UI presentation, relational spatial state, and ML computation.
- **Reproducibility**: Explicit data schemas, deterministic preprocessing, and traceable model versions.
- **Standards Compliance**: Open standards (OGC, GeoJSON, EPSG:4326, NetCDF/Zarr).

---

## Considered Options & Selected Choices

### 1. Web Frontend: Next.js (App Router) + TypeScript
- **Decision**: Adopt Next.js 14+ with strict TypeScript and Tailwind CSS.
- **Rationale**: Next.js App Router provides optimal server-side pre-rendering for initial console state while client components power real-time MapLibre rendering. Strict TypeScript guarantees contract integrity with backend schemas.

### 2. Map Engine: MapLibre GL JS
- **Decision**: Adopt MapLibre GL JS instead of proprietary SDKs (e.g. Mapbox GL v2/v3 closed license, Google Maps).
- **Rationale**: MapLibre GL JS is open source, vendor-neutral, and supports custom vector tile endpoints and dynamic raster heatmaps without vendor lock-in.

### 3. Application Backend: Supabase (Postgres + PostGIS)
- **Decision**: Use Supabase for database, authentication, storage, and real-time events.
- **Rationale**: PostGIS is the global standard for geospatial queries (`ST_Contains`, `ST_DWithin`, spatial joins). Native Row-Level Security (RLS) and WebSockets support provide a secure, scalable operations hub.

### 4. ML Inference: Python 3.11 + FastAPI in Container
- **Decision**: Isolate all heavy scientific computing in a Python FastAPI microservice; do NOT run PyTorch/Xarray inside Supabase Edge Functions or Node.js.
- **Rationale**: Python remains the gold standard for scientific data tools (Xarray, NumPy, Pandas, Rasterio, PyTorch). Running it as an independent service prevents memory pressure on the web tier and allows horizontal autoscaling on GPU/CPU nodes.

---

## Consequences

- **Positive**: High separation of concerns. The frontend can be iterated without redeploying ML models; ML models can be upgraded without touching the database schema.
- **Trade-off**: Requires running two runtimes locally during development (Node.js dev server on port 3000, Python FastAPI on port 8000). Handled via documented Docker/npm scripts.
