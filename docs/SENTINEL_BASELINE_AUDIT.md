# TRINETRA SENTINEL — Phase 0: Baseline Audit & Safe Setup

**Document Version:** 1.0.0  
**Date:** September 2026  
**Auditor:** Antigravity UI/UX & Full-Stack Engineering  
**Reference Document:** `TRINETRA_SENTINEL_UI_UX_REDESIGN_PHASE_PLAN`

---

## 1. Executive Summary & Objective

This audit establishes the operational and technical baseline of the TRINETRA frontend prior to the **Sentinel** redesign. It catalogs all existing routes, components, state machines, backend contracts, data flows, and safety guardrails to guarantee zero regression in analytical integrity, backend interoperability, or regulatory compliance.

A safe fallback route (`/legacy`) has been deployed, allowing operators to run and compare the pre-redesign interface side-by-side with the new Sentinel system.

---

## 2. Route & Information Architecture Audit

### 2.1 Current Route Structure (Baseline)
| Route | Type | Description | State Managed |
| :--- | :--- | :--- | :--- |
| `/` | Client (`"use client"`) | Monolithic single-page console combining 2D Leaflet map, 3D Globe toggle, floating filters, collapsible layers, bottom soundings shelf, and slide-out alert drawer. | `viewMode`, `selectedCell`, `horizonMinutes`, `selectedModel`, `layers`, `alerts`, `filterMode` |
| `/legacy` | Client (`"use client"`) | **Safe fallback route** created in Phase 0. Exact clone of the baseline console with independent imports. | Unchanged from baseline |

### 2.2 Target Sentinel Information Architecture Mapping
| Sentinel View | Target Route / State | Primary Purpose | Legacy Source Components |
| :--- | :--- | :--- | :--- |
| **Overview** | `/` or Tab `overview` | Rapid situation awareness: "Is anything dangerous happening?", priority active risks, district overview. | New synthesized layout + `WeatherCard`, `RiskBadge` |
| **Intelligence Map** | `/map` or Tab `map` | Dedicated, full-screen 2D GIS workspace with clean collapsible layer drawer, right inspector, and bottom timeline dock. | `ForecastMap`, `RiskLayers`, `LocationSearch` |
| **Forecast Timeline** | Bottom Dock / Scrubber | Lead-time evolution (T+0h to T+6h) with play/pause, speed controls, and synchronized map/inspector updates. | `Timeline.tsx` |
| **Risk Inspector** | Right Drawer / Dock | Dual-factor decomposition ($P_{\text{meteo}}$ vs $S_{\text{terrain}}$) and non-causal XAI feature attributions. | `RiskPanel.tsx` |
| **Alert Center** | `/alerts` or Tab `alerts` | Operational inbox with formal lifecycle state machine (`GENERATED` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `DISPATCHED` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `RESOLVED`), CAP XML & GeoJSON exports. | `AlertPanel.tsx` |
| **AI Insights** | `/insights` or Tab `insights` | Model cards, hurdle evaluation metrics (PR-AUC, Brier score, ECE), latency benchmarks, and limitations. | Hurdle drawer in `page.tsx` |
| **Data & Provenance**| `/provenance` or Drawer | INSAT satellite, NWP reanalysis, Radar, DEM freshness, pipeline latency, and synthetic replay indicators. | `DataFreshness.tsx` |
| **3D Globe** | `/globe` or View toggle | Immersive exploratory planetary mode (Three.js), accessible via navigation without blocking 2D operations. | `GlobeScene.tsx` |

---

## 3. Frontend Component Inventory & Classification

Each component has been audited and classified as **Data-Critical** (handles data transformation, telemetry, or safety labeling) or **Presentation-Only** (styling and layout container).

| Component Path | Classification | Role & Data Dependencies | Safety Guardrails / Scientific Details |
| :--- | :--- | :--- | :--- |
| `apps/web/src/app/page.tsx` | **Data-Critical** | Master coordinator: holds state for `selectedCell`, `horizonMinutes`, `layers`, `alerts`, `selectedModel`. Calls trigger API. | Displays `MODEL ADVISORY`, `SYNTHETIC REPLAY`, and hurdle benchmark banners. |
| `apps/web/src/app/forecast/ForecastMap.tsx` | **Data-Critical** | Dynamic Leaflet GIS map. Renders hexagonal/polygon grid cells with risk colors, popup cards, basemap switching (Carto Dark, Satellite, Topo), and click-to-inspect bindings. Exports `GRID_CELLS`. | Must never display risk colors without geometric shape indicators. Renders `MODEL ADVISORY`. |
| `apps/web/src/app/forecast/RiskPanel.tsx` | **Data-Critical** | Right inspector for selected cell. Computes $P_{\text{meteo}}$, $S_{\text{terrain}}$, and fused $R_{\text{surge}}$. Displays SHAP feature weights. | **Mandatory:** Non-causal XAI disclaimer and model limitation details. |
| `apps/web/src/app/forecast/Timeline.tsx` | **Data-Critical** | Scrubber controlling lead time from $T+0$ to $T+6\text{h}$ in 30-min increments. Auto-play loop with speed toggles ($1\times, 2\times$). | Synchronizes time slices across map and soundings without desynchronization. |
| `apps/web/src/app/forecast/RiskLayers.tsx` | **Presentation** | Toggle checkboxes for 5 GIS layers: Thunderstorm, Cloudburst, Flash Flood, Terrain Susceptibility, Doppler Radar. | Preserves layer keys in `ActiveLayers` interface. |
| `apps/web/src/app/alerts/AlertPanel.tsx` | **Data-Critical** | Alert drawer with lifecycle state machine, CAP XML v1.2 generation & export, and simulated SEOC dispatch webhook. | Mandatory `is_official_warning: false` check. Persistent `MODEL ADVISORY` labeling. |
| `apps/web/src/app/components/RiskBadge.tsx` | **Data-Critical** | Renders severity pills with shape cues: ● Low, ◆ Watch, ▲ Warning, ▲ Critical. | Screen-reader text and shape symbol prevents reliance on color alone. |
| `apps/web/src/app/components/DataFreshness.tsx` | **Data-Critical** | Displays INSAT satellite age, NWP analysis age, inference latency, model version, and job ID. | Triggers `DATA STALE / RUNOFF DEGRADED` banner if age $> 45\text{m}$. |
| `apps/web/src/app/components/WeatherCard.tsx` | **Presentation** | Formats atmospheric soundings: CAPE, CIN, TPW, TIR1 cooling rate, Doppler dBZ, surface temp, RH%. | Displays `SYNTHETIC REPLAY` tag. |
| `apps/web/src/app/search/LocationSearch.tsx` | **Presentation** | Autocomplete search for river basins, monitoring stations, and districts across Uttarakhand. | Binds selection to `GRID_CELLS`. |
| `apps/web/src/app/search/LocationResults.tsx` | **Presentation** | Dropdown results list for location search. | Displays risk badge per station. |
| `apps/web/src/app/globe/GlobeScene.tsx` | **Presentation** | Three.js interactive 3D globe with atmospheric glow, orbit controls, and Uttarakhand convective corridor highlight. | Wrapped in Next.js `dynamic(..., { ssr: false })`. |
| `apps/web/src/lib/supabase/client.ts` | **Data-Critical** | Supabase client initialization using `@supabase/supabase-js`. Gracefully detects unconfigured environments. | Prevents app crash if Supabase credentials are missing. |
| `apps/web/src/lib/supabase/hooks.ts` | **Data-Critical** | `useRealtimeAlerts` React hook: subscribes to PostGIS `alerts` table changes with automatic fallback to local memory state. | Allows seamless offline and demo operations. |

---

## 4. API & Backend Contract Audit

| Endpoint / Protocol | Client Method | Request Payload | Response Schema | Frontend Handling |
| :--- | :--- | :--- | :--- | :--- |
| `POST http://localhost:8000/api/v1/orchestration/trigger` | `fetch` in `page.tsx` | `{ is_synthetic_replay: true, source: "manual_console_trigger" }` | `{ status: "triggered", job_id: string, execution_time_ms: number }` | Updates `activeJobId`, `lastGenTime`, and refreshes freshness strip. Graceful fallback on network failure. |
| Supabase Realtime Channel (`table: alerts`) | `supabase.channel` in `hooks.ts` | Postgres changes filter: `event: "*", schema: "public", table: "alerts"` | Supabase PostGIS record (`AlertItem`) | Merges incoming real-time alerts into state array with de-duplication. |
| Client-Side CAP XML v1.2 Export | Local Blob URL in `AlertPanel.tsx` | None (Client generated) | Valid XML OASIS CAP v1.2 conforming string | Triggers browser download with `<sender>trinetra-nowcast@sdma.uk.gov.in</sender>` and model disclaimer note. |

---

## 5. UI Pattern Inventory

1. **Header:** Height 52px, brand mark `T3`, pilot status badge, live PostGIS pill, center search bar, model selector dropdown, 2D/3D switcher, trigger cycle button, alert counter button.
2. **Filter Pills:** Floating horizontal bar (`All`, `Critical / Severe ▲`, `Flash-Flood`, `Gorges`, `Foothills`).
3. **Buttons:** Primary interactive buttons styled with cyan borders/glows; destructive/urgent buttons styled with rose/red.
4. **Cards & Panels:** Dark navy slate panels (`#0c1322` / `#090e1a`) with 1px border (`#1e293b`).
5. **Drawers:** Slide-in from right for Alert Center (`w-96`) and Cell Risk Inspector (`w-84` to `w-96`).
6. **Telemetry Bars:** Horizontal strip under header displaying pipeline latency, satellite freshness, job ID, and model version.
7. **Modals & Toasts:** Ephemeral notification banner on dispatching alert to SEOC webhook.

---

## 6. Safety Labeling & Scientific Integrity Checklist

- [x] **Model Advisory:** Every alert and cell detail explicitly labeled `MODEL ADVISORY` (`isOfficialWarning: false`).
- [x] **Dual-Factor Separation:** Meteorological forcing ($P_{\text{meteo}}$) and terrain vulnerability ($S_{\text{terrain}}$) are computed and visualized independently in `RiskPanel.tsx`.
- [x] **Non-Causal XAI:** Explicit notice that SHAP weights reflect model input sensitivity, not deterministic physical causality.
- [x] **Color-Blind Accessibility:** All risk severities combine color with geometric shape cues (● Low, ◆ Watch, ▲ Warning, ▲ Critical).
- [x] **Synthetic Replay Notice:** Explicit tag shown whenever synthetic or test replay data is active.

---

## 7. Baseline Safe Setup Artifacts Created in Phase 0

1. **Legacy Route:** `apps/web/src/app/legacy/page.tsx` — Full pre-redesign console preserved and testable.
2. **Design Tokens File:** `apps/web/src/styles/tokens.ts` and `apps/web/src/app/styles/tokens.ts` — Comprehensive design token definitions for background, panels, cyan accents, typography, spacing, and risk states.
3. **Tailwind Extended Theme:** `apps/web/tailwind.config.ts` — Configured with `sentinel` theme colors and typography.
4. **Verification:** `npm run typecheck` executed with 0 errors.
