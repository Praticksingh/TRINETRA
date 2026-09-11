# TRINETRA Project Constitution & Guardrails

> **Authoritative Specification Version**: 1.0.0  
> **Source Plan**: `Hyper_Local_Weather_Nowcasting_Phase_Plan.pdf`  
> **Execution Model**: Phased Development with Mandatory Senior Review Gate

---

## 1. Project North Star

**TRINETRA** is an AI-powered hyper-local severe weather nowcasting web application that continuously converts authorized satellite, atmospheric, and terrain observations into hyper-local risk forecasts for:
- **Severe Thunderstorms**
- **Cloudbursts**
- **Flash Floods**

Key operating requirements:
- **Actionable Window**: 2–6 hours lead time.
- **GIS Dashboard**: Map-first, high-density, calm, and precise decision-support interface.
- **Explainable Outputs (XAI)**: Explicit contributing atmospheric and terrain factors without claiming causal certainty.
- **Categorized Alerts**: Configurable thresholds, auditable lifecycle states, deduplication, and suppression of false alarms.
- **Tone**: A serious meteorological and disaster-management operations console rather than a consumer weather app.

---

## 2. Non-Negotiable Engineering Rules

1. **One Phase at a Time**: The AI must stop after each phase and conduct a comprehensive senior repository review before beginning the next phase.
2. **Supabase System-of-Record**: Supabase is the authoritative application backend (PostgreSQL + PostGIS, Auth, Storage, Realtime, Edge Functions).
3. **Dedicated Python ML Inference**: Heavy scientific computation and neural network models reside strictly in a separately deployable Python inference service (FastAPI). Supabase acts as the orchestration and persistence layer.
4. **Zero Client Secrets**: No service-role keys, private API credentials, or internal secrets may ever be committed to Git or exposed in browser code.
5. **No Invented Access**: Never invent fake credentials, endpoints, or data access for INSAT/MOSDAC, IMDAA, DEM, SMS, email, or government APIs.
6. **No Fabricated Accuracy Claims**: All performance claims must cite the exact dataset, time split, forecast horizon, geography, and evaluation methodology.
7. **Explicit Replay Labeling**: Synthetic or historical replay data is permitted for development and demonstration, but must be explicitly visually and semantically labeled.
8. **Metadata Transparency**: Every forecast must expose data observation timestamp, forecast generation timestamp, model version, and freshness state.
9. **Resilient UI States**: Every data-driven component must gracefully handle loading, empty, stale, error, and degraded-service states.
10. **Definition of Done**: Every phase and major feature requires an explicit Definition of Done and verified automated/manual checks.

---

## 3. Technology Stack

| Layer | Selected Technology | Architectural Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router) + TypeScript | Strong routing, server/client separation, robust ecosystem for data-intensive web apps. |
| **UI & Styling** | Tailwind CSS + shadcn/ui | Restrained, high-contrast, accessible components adhering to meteorological console ergonomics. |
| **Mapping Engine** | MapLibre GL JS | Open-source, high-performance vector rendering, vendor-neutral map SDK. |
| **Charts** | Recharts / SVG | Lightweight time-series and probability distributions without bloated visualization bundles. |
| **Backend** | Supabase (PostgreSQL + PostGIS) | Spatial indexing, Row Level Security (RLS), Realtime subscriptions, and auditability. |
| **Server Logic** | Supabase Edge Functions / Next.js Server Actions | Secure API mediation, alert routing, lightweight orchestration. |
| **ML Inference** | Python 3.11 + FastAPI | Stateless API container suitable for PyTorch, Xarray, Pandas, and Rasterio pipelines. |
| **Data Processing** | Xarray + Pandas + NumPy + GeoPandas | Native representation of multi-dimensional atmospheric grids, NetCDF/GRIB, and shapefiles. |
| **Testing** | Vitest / Jest + Playwright + Pytest | Comprehensive coverage across frontend units, backend contracts, and ML inference pipelines. |

---

## 4. Architecture & Component Boundaries

```
[ Browser / Operations Console ]
            │
            ▼ (HTTPS / WSS)
   [ Next.js Web App ]
      │             │
      │ (Auth/Data) │ (Server Actions / Direct API)
      ▼             ▼
[ Supabase Backend ] ◄────────┐
  • PostgreSQL + PostGIS      │
  • Row Level Security (RLS)  │ (Persist Predictions & Metadata)
  • Auth & Audit Events       │
  • Realtime Alert Dispatch   │
      │                       │
      │ (Trigger Ingestion /  │
      │  Inference Job)       │
      ▼                       │
[ Python FastAPI Service ] ───┘
  • Feature Preprocessing (Xarray/NumPy)
  • Terrain Susceptibility Model (DEM/Rasterio)
  • Spatiotemporal Multi-Task Backbone (PyTorch)
  • Probability Calibration & XAI Attribution
```

---

## 5. Data & ML Safety Guardrails

- **No Overlapping Leakage**: Temporal split strictly enforced between training, validation, and testing (train on past, evaluate on future).
- **Probabilities vs. Accuracy**: Probabilities represent model-estimated likelihood; accuracy is a measured historical evaluation metric. Never conflate the two.
- **Terrain vs. Atmospheric Separation**: Flood risk is a composite of meteorological precipitation probability and static/dynamic terrain vulnerability. Both components must be individually inspectable in the UI.
- **Government Authority Demarcation**: System alerts generated by algorithmic thresholds must be labeled as **Model-Generated Advisory** and explicitly distinguished from **Official Government Warnings**.

---

## 6. Mandatory Senior Review Protocol

After the completion of each phase, the following verification sequence must be executed:
1. **Repository Inspection**: Inspect all repository files and dependencies for drift or unintended artifacts.
2. **Constitution Compliance**: Verify that no non-negotiable rules were breached.
3. **Build & Type Health**: Verify that the Next.js app builds with zero TypeScript errors and Python modules compile cleanly.
4. **Security Audit**: Verify that no secrets, credentials, or unprotected service-role calls exist.
5. **Data Provenance**: Ensure all mock/sample data is labeled as synthetic or replay.
6. **Review Report**: Issue a structured `PASS/FAIL` review report detailing findings, severity (`BLOCKER`, `HIGH`, `MEDIUM`, `LOW`), and recommended fixes.
7. **Stop Gate**: All `BLOCKER` and `HIGH` findings must be resolved before the user is invited to advance to the next phase.

---

## 7. Human Intervention Map

| Phase | Action Required by Human Operator |
| :--- | :--- |
| **Phase 0** | Create/confirm GitHub repository; approve final scope and project constitution. |
| **Phase 2** | Create Supabase project, configure project URL and keys in secrets manager, enable PostGIS extension. |
| **Phase 3** | Obtain/confirm authorized access to INSAT/MOSDAC and IMDAA reanalysis sources; define pilot geographic bounding box. |
| **Phase 9** | Provide verified alert delivery provider credentials (SMS gateway, Webhook keys, SMTP). |
| **Phase 11** | Connect production Vercel and container platform accounts, configure environment secrets, approve custom domain. |
| **Final** | Validate demo operational claims, ensuring all accuracy and coverage metrics match certified benchmarks. |
