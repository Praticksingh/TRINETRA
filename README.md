# TRINETRA: Hyper-Local Severe Convective Weather Nowcasting Platform

> **AI-Powered 2–6 Hour Decision-Support Platform for Severe Thunderstorms, Cloudbursts & Flash Floods**

---

## 1. Project North Star

**TRINETRA** continuously ingests satellite imagery, numerical atmospheric analysis, and high-resolution Digital Elevation Models (DEM) to generate hyper-local nowcasts with an actionable 2–6 hour window. Built for disaster management authorities and meteorological operations, TRINETRA provides an interactive GIS dashboard, explainable AI (XAI) risk attribution, and auditable alert workflows.

---

## 2. Monorepo Structure

```
TRINETRA/
├── apps/
│   └── web/                   # Next.js 14+ (App Router) + TypeScript + Tailwind CSS
├── services/
│   └── inference/             # Python 3.11 + FastAPI ML inference microservice
├── supabase/
│   ├── migrations/            # PostgreSQL + PostGIS spatial schema migrations
│   ├── functions/             # Supabase Edge Functions for orchestration
│   └── seed/                  # Baseline seed data for development
├── packages/
│   ├── types/                 # Canonical TypeScript contracts & schemas
│   └── config/                # Operational thresholds, severity matrix & configs
├── data/
│   ├── schemas/               # JSON Schema data contracts (forecast, alert, grid)
│   └── samples/               # Labeled synthetic replay datasets for development
├── ml/
│   ├── training/              # Spatiotemporal deep model training pipelines
│   ├── evaluation/            # Evaluation scripts & verification metrics
│   └── configs/               # Hyperparameter & feature configs (YAML)
├── docs/
│   ├── architecture/          # System architecture and data flow diagrams
│   ├── api/                   # REST & Realtime API contracts
│   ├── data-dictionary/       # Meteorological & terrain feature definitions
│   └── decisions/             # Architecture Decision Records (ADRs)
├── .env.example               # Safe environment variable configuration template
├── .gitignore                 # Monorepo gitignore (secrets, checkpoints, tensors)
├── PROJECT_CONSTITUTION.md    # Mandatory project constitution & engineering rules
└── README.md                  # Project overview & operational documentation
```

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, MapLibre GL JS, Recharts, Lucide Icons.
- **Backend**: Supabase (PostgreSQL 16 + PostGIS, Auth, Storage, Realtime).
- **ML Inference**: Python 3.11, FastAPI, Pydantic, NumPy, PyTorch, Xarray, Rasterio.
- **Standards**: EPSG:4326 (WGS84), GeoJSON, ISO 8601 UTC.

---

## 4. Getting Started

### 4.1 Prerequisites
- Node.js $\ge 18.x$ and npm $\ge 9.x$
- Python $\ge 3.10$

### 4.2 Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env.local
```

### 4.3 Web Frontend (`apps/web`)
Install dependencies and launch the development console:
```bash
npm --prefix apps/web install
npm --prefix apps/web run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4.4 ML Inference Microservice (`services/inference`)
Install Python dependencies and run the FastAPI server:
```bash
cd services/inference
pip install -r requirements.txt
python main.py
```
Health probe available at: [http://localhost:8000/health](http://localhost:8000/health)

---

## 5. Development Phases & Status

| Phase | Description | Status | Gate Check |
| :---: | :--- | :---: | :---: |
| **0** | **Project Constitution & Guardrails** | **COMPLETED** | **PASS** |
| **1** | **UX Foundation & Storytelling Shell** | **COMPLETED** | **PASS** |
| 2 | Supabase Backend Foundation | UPCOMING | Pending User Approval |
| 3 | Data Ingestion & Normalization Layer | PENDING | - |
| 4 | Baseline Forecast Engine | PENDING | - |
| 5 | Spatiotemporal Multi-Task AI Model | PENDING | - |
| 6 | Terrain-Aware Flash-Flood Risk Layer | PENDING | - |
| 7 | Real-Time Inference & Forecast Orchestration | PENDING | - |
| 8 | GIS Dashboard & Explainable AI | PENDING | - |
| 9 | Alerting & Authority Workflow | PENDING | - |
| 10 | Security, Reliability & Production Hardening | PENDING | - |
| 11 | Deployment, Observability & Demo Readiness | PENDING | - |
| 12 | Senior Full-Stack Review Loop & Final Release | PENDING | - |

---

## 6. Non-Negotiable Operational Guardrails

- **Zero Secret Leakage**: No credentials or private keys committed to Git or exposed in browser bundles.
- **Authenticity of Data**: Synthetic or replay datasets are explicitly marked with `is_synthetic_replay: true`.
- **Advisory vs. Warning**: Algorithmic model outputs are labeled as *Model-Generated Advisories* and must not be presented as official government disaster warnings without authorized human confirmation.
