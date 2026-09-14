# TRINETRA SENTINEL — Phase A: UI/UX Refinement & Clarity Audit

**Audit Date:** September 2026  
**Document Version:** 1.0.0  
**Status:** Completed  
**Reference Specification:** `TRINETRA_SENTINEL_REFINEMENT_PHASE_PLAN`  

---

## 1. Executive Summary & Purpose

Following the initial architectural migration to **TRINETRA SENTINEL**, this Phase A audit evaluates the live frontend against real-world emergency operations center (SEOC) requirements. 

While the functional, hydrometeorological, and API architecture is fully intact, the current presentation suffers from **excessive technical density, harsh cyan/neon borders, competing floating overlays on the tactical map, and jargon-heavy primary microcopy**.

The objective of the **Sentinel Aurora** refinement is to transform this into a calm, premium, tempting, and immediately understandable weather intelligence platform.

---

## 2. Comprehensive UI/UX Evaluation

### 2.1 What Is Already Good & Strong
1. **Rock-Solid Architectural Foundation:** 
   - State synchronization via `SentinelContext` works cleanly across all views without layout thrashing.
   - Decoupled FastAPI trigger endpoints (`/api/v1/orchestration/trigger`) and Supabase PostGIS realtime alert subscriptions (`useRealtimeAlerts`) operate reliably with graceful offline fallbacks.
   - Zero-breaking-change adherence to OASIS CAP v1.2 XML and RFC 7946 GeoJSON schemas.
2. **Hydrometeorological Integrity:**
   - Separation of atmospheric forcing ($P_{\text{meteo}}$) and topographic vulnerability ($S_{\text{terrain}}$) is scientifically sound and complies with TRINETRA Constitution §5.
   - Non-causal XAI disclaimers prevent algorithmic overconfidence.
3. **Accessibility Baseline:**
   - Geometric shape cues (● Low, ◆ Watch, ▲ Warning, ▲ Critical pulse) ensure that risk communication survives color-blindness or grayscale display limitations.

---

### 2.2 What Is Confusing (Language & Terminology)
1. **Primary Navigation & Shell:**
   - Terms like *“Intelligence Map”*, *“Forecast Timeline”*, *“Alert Center”*, *“AI Insights”*, and *“Data & Provenance”* read like internal machine learning module names rather than intuitive operational tools.
2. **Telemetry & Header Microcopy:**
   - *“Telemetry Nominal”*, *“Lead Time: T + 2h 00m”*, *“Valid: 10:30 UTC”*, and *“Hurdle Cleared (+1560 bps)”* overwhelm general operators who need immediate answers to: *What is happening? Where? How serious?*
3. **Action Prompts:**
   - *“Launch Tactical 2D Map”*, *“Refresh Nowcast Cycle”*, and *“Trigger Automated Cycle”* sound like developer scripts rather than user-facing actions.

---

### 2.3 What Is Too Neon (Visual Identity)
1. **Overuse of Electric Cyan (`#36D9E8`):**
   - Cyan is applied indiscriminately to button borders, card borders, active tabs, header icons, spinner loaders, and glowing badges, causing eye fatigue and devaluing the meaning of accent color.
2. **Artificial Glows & Pinging Dots:**
   - Animated pinging circles and cyan box shadows (`shadow-[0_0_12px_rgba(54,217,232,0.25)]`) create a "cyberpunk gaming HUD" feel rather than a calm, authoritative disaster intelligence platform.
3. **Competing Severity Pills:**
   - Multiple bright pills in headers and cards compete for attention, weakening the visual hierarchy of actual critical emergencies.

---

### 2.4 What Is Overcrowded (Workspace Layouts)
1. **Weather Map Workspace:**
   - Floating elements collide: the `LAYERS` button (top-left), large `HazardFilterBar` pills (top-center), `TimelineDock` (bottom-center), `MapLegend` (bottom-right), and `RiskInspector` (right side) obscure more than 40% of the map viewport.
   - Hexagonal and polygon grid cells display large text labels and badges simultaneously, cluttering river valley details.
2. **3D Globe (`GlobeScene`):**
   - Currently renders a stylized procedural 2D canvas with crude ellipses for continents, failing to deliver the promised realistic planetary Earth visualization.
3. **Forecast Timeline:**
   - Combines playback controls, discrete stops, convective curve graphs, speed multipliers, and raw time strings in a single dense dock.

---

## 3. Component Reuse vs. Redesign Matrix

| Component / Subsystem | Current State | Refinement Strategy |
| :--- | :--- | :--- |
| `tokens.ts` | Over-indexed on `#36D9E8` cyan | **Redesign into Sentinel Aurora:** Deep midnight navy `#0B1220`, slate-blue panels `#111A2C`, soft steel/sky blue `#38BDF8` accents, restrained warm severity. |
| `SentinelHeader.tsx` | Jargon-heavy, crowded with pills | **Refine:** Simplify language (*Run forecast*, *Map / Globe*, *Systems Normal*), cleaner layout. |
| `SentinelSidebar.tsx` | Technical labels (*Intelligence Map*, etc.) | **Refine:** Adopt plain language (*Weather Map*, *Forecast*, *Alerts*, *AI Analysis*, *Data Sources*, *Earth View*). |
| `MapWorkspace.tsx` | 5 competing floating layers | **Redesign:** Compact header, grouped map controls stack, collapsible layer/filter drawer, map as the clear visual hero. |
| `TimelineDock.tsx` | Dense technical labels | **Refine:** Plain labels (*Now, +1h, +2h...*), prominent single Play action, clean selected-time indicator. |
| `PriorityRiskCard.tsx` | Heavy borders, dense text | **Refine:** Clear headline, plain-language risk statement, prominent *View on map* action. |
| `RiskInspector.tsx` | Complex technical layout | **Refine:** Progressive disclosure: primary summary first (*Why this area is flagged*), technical XAI/terrain in collapsible drawer. |
| `GlobeScene.tsx` | Procedural stylized canvas | **Redesign:** Realistic Earth texture, accurate continents/oceans, subtle blue atmospheric rim shading, realistic lighting. |
| `AlertCenterWorkspace.tsx`| Table-heavy layout | **Refine:** Streamlined inbox view, plain-language filter pills, crisp lifecycle badges. |

---

## 4. Plain-Language Dictionary Mapping

| Current Technical Term | New Plain-Language Label | Target Component / Area |
| :--- | :--- | :--- |
| `Intelligence Map` | **Weather Map** | Sidebar, Navigation, Shell |
| `Forecast Timeline` | **Forecast** | Sidebar, Navigation, Timeline |
| `Alert Center` | **Alerts** | Sidebar, Header, Drawer |
| `AI Insights` | **AI Analysis** | Sidebar, Model Cards |
| `Data & Provenance` | **Data Sources** | Sidebar, Telemetry Drawer |
| `3D Globe` | **Earth View** | Sidebar, Header Mode Switch |
| `Telemetry Nominal` | **Systems Normal** | Telemetry Strip, Header |
| `Satellite (INSAT): 12m ago` | **Satellite data · 12 min ago** | Telemetry Bar, Data Sources |
| `NWP Analysis: 45m ago` | **Weather model · 45 min ago** | Telemetry Bar, Data Sources |
| `Lead Time: T + 2h 00m` | **Forecast in 2 hours** | Timeline Dock, Inspector |
| `Valid: 10:30 UTC` | **Forecast time · 10:30 UTC** | Timeline Dock, Inspector |
| `Peak Surge & Flash Flood` | **Highest risk: Flash Flood** | Timeline, Priority Risk Card |
| `Decision Horizon` | **Action window** | Inspector, Risk Cards |
| `Backbone` | **Model performance** | AI Analysis, Banners |
| `Hurdle Cleared` | **Model check passed** | AI Analysis, Banners |
| `Inspect Model Card` | **View model details** | Top Banners, AI Analysis |
| `Expand Soundings` | **View atmospheric data** | Bottom Telemetry Shelf |
| `Trigger` / `Refresh Nowcast` | **Run forecast** | Header, Overview, Provenance |
| `2D / 3D` | **Map / Globe** | Header Switcher, Globe Bar |

---

## 5. Inviolable Operational & Safety Invariants

During all subsequent refinement phases, the following rules remain non-negotiable:
1. **MODEL ADVISORY Demarcation:** Mandatory visible badge on all algorithmic alerts (`is_official_warning: false`).
2. **Dual-Factor Separation:** Meteorological precipitation forcing ($P_{\text{meteo}}$) and topographic susceptibility ($S_{\text{terrain}}$) must remain separately inspectable.
3. **Non-Causal XAI:** Disclaimers asserting that feature importance represents statistical sensitivity, not physical causality, must remain visible.
4. **Color-Blind Geometric Shape Cues:** (● Low, ◆ Watch, ▲ Warning, ▲ Critical pulse) must remain attached to all risk levels.
5. **Data Provenance & Integrity:** No backend APIs may be broken or mocked with fake live feeds.
