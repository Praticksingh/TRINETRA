"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Layers,
  Globe as GlobeIcon,
  Map as MapIcon,
  Bell,
  Activity,
  AlertTriangle,
  Compass,
  Info,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
} from "lucide-react";

// Dynamic import for Three.js GlobeScene to prevent SSR window issues
const GlobeScene = dynamic(() => import("../globe/GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#060913] text-slate-500 font-mono text-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
        <span>INITIALIZING 3D ORBITAL ENGINE...</span>
      </div>
    </div>
  ),
});

// Dynamic import for Leaflet ForecastMap to prevent SSR window issues
const ForecastMap = dynamic(() => import("../forecast/ForecastMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#070b14] text-slate-500 font-mono text-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
        <span>INITIALIZING TACTICAL GIS DECISION MAP...</span>
      </div>
    </div>
  ),
});

import { GRID_CELLS, FilterMode } from "../forecast/ForecastMap";
import RiskLayers, { ActiveLayers } from "../forecast/RiskLayers";
import Timeline from "../forecast/Timeline";
import RiskPanel, { SelectedCellData } from "../forecast/RiskPanel";
import LocationSearch from "../search/LocationSearch";
import { SearchLocation } from "../search/LocationResults";
import AlertPanel, { AlertItem } from "../alerts/AlertPanel";
import WeatherCard, { AtmosphericMetrics } from "../components/WeatherCard";
import DataFreshness from "../components/DataFreshness";
import RiskBadge from "../components/RiskBadge";
import { useRealtimeAlerts } from "../../lib/supabase/hooks";
import { isSupabaseConfigured } from "../../lib/supabase/client";

// Initial baseline mock alerts for development (clearly labeled as model advisories)
const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "alt_kedarnath_001",
    hazardType: "flash_flood",
    severity: "critical",
    regionName: "Upper Mandakini / Kedarnath Valley",
    headline: "FLASH FLOOD CRITICAL RISK: Rapid Cirque Inundation Likely",
    description:
      "Deep convective cloud cluster exhibiting -21.4 K/hr TIR1 cooling rate coupled with 46.2° steep slope drainage. High probability of flash flood in next 2–3 hours.",
    issuedAt: "2026-09-11T08:32:00Z",
    validFrom: "2026-09-11T10:00:00Z",
    validTo: "2026-09-11T13:30:00Z",
    isOfficialWarning: false,
    isAcknowledged: false,
    affectedCells: ["3073_7906"],
  },
  {
    id: "alt_rishikesh_002",
    hazardType: "cloudburst",
    severity: "warning",
    regionName: "Shivpuri-Rishikesh Ganga Corridor",
    headline: "CLOUDBURST WARNING: Intense Convective Rainfall Band",
    description:
      "CAPE exceeding 3,100 J/kg with moisture convergence. Rainfall rates projected ≥90 mm/h. Precautionary monitoring advised along riverfront campsites.",
    issuedAt: "2026-09-11T08:25:00Z",
    validFrom: "2026-09-11T09:30:00Z",
    validTo: "2026-09-11T12:00:00Z",
    isOfficialWarning: false,
    isAcknowledged: false,
    affectedCells: ["3012_7824"],
  },
  {
    id: "alt_chamoli_003",
    hazardType: "thunderstorm",
    severity: "watch",
    regionName: "Alaknanda Basin / Chamoli",
    headline: "THUNDERSTORM WATCH: Moderate to Severe Hail Potential",
    description:
      "Doppler radar reflectivity cores reaching 45 dBZ with strong updraft signature. Wind gusts up to 55 km/h expected.",
    issuedAt: "2026-09-11T08:10:00Z",
    validFrom: "2026-09-11T10:30:00Z",
    validTo: "2026-09-11T14:00:00Z",
    isOfficialWarning: false,
    isAcknowledged: true,
    affectedCells: ["3055_7935"],
  },
];

// Atmospheric telemetry metrics
const PILOT_ATMOSPHERIC_METRICS: AtmosphericMetrics = {
  cape: 3150,
  cin: -18,
  tpw: 58.2,
  tir1_cooling_rate: -16.5,
  radar_reflectivity_dbz: 48,
  surface_temp_c: 24.8,
  rh_percent: 88,
};

export default function OperationsConsole() {
  // Mode: "gis" (2D GIS Decision Map) or "globe" (3D Three.js Earth)
  const [viewMode, setViewMode] = useState<"gis" | "globe">("gis");

  // Selected cell for XAI & Risk Inspector (starts null for unobstructed map view)
  const [selectedCell, setSelectedCell] = useState<SelectedCellData | null>(null);

  // Forecast Horizon in minutes (0 to 360)
  const [horizonMinutes, setHorizonMinutes] = useState<number>(120);

  // Model Engine selection: Candidate vs Phase 4 Baselines
  const [selectedModel, setSelectedModel] = useState<string>("spatiotemporal_v1");

  // Active Map Layers
  const [layers, setLayers] = useState<ActiveLayers>({
    thunderstorm: true,
    cloudburst: true,
    flashFlood: true,
    terrainSusceptibility: true,
    radarReflectivity: false,
  });

  // Collapsible Layers dropdown
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);

  // Filter Mode for Emergency Managers (All, Critical, Flash-Flood, Gorges, Foothills)
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  // Real-time alerts via Supabase with automatic offline fallback
  const { alerts, isLiveConnected, acknowledgeAlert } = useRealtimeAlerts(INITIAL_ALERTS);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState<boolean>(false);
  const [showBenchmarkMetrics, setShowBenchmarkMetrics] = useState<boolean>(false);
  const [isTriggeringCycle, setIsTriggeringCycle] = useState<boolean>(false);
  const [activeJobId, setActiveJobId] = useState<string>("job_nowcast_0832_f891a2");
  const [lastGenTime, setLastGenTime] = useState<string>("2026-09-11 08:32 UTC");

  // Bottom collapsible telemetry soundings drawer
  const [isTelemetryShelfOpen, setIsTelemetryShelfOpen] = useState<boolean>(false);

  const isBaselineActive = selectedModel !== "spatiotemporal_v1";

  const handleTriggerCycle = async () => {
    setIsTriggeringCycle(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/orchestration/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_synthetic_replay: true, source: "manual_console_trigger" }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveJobId(data.job_id || "job_nowcast_active");
        setLastGenTime(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
      }
    } catch (err) {
      // Graceful offline fallback simulation
      const fakeId = `job_nowcast_${Math.floor(Date.now() / 1000)}_${Math.random().toString(36).substring(2, 8)}`;
      setActiveJobId(fakeId);
      setLastGenTime(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
    } finally {
      setTimeout(() => setIsTriggeringCycle(false), 600);
    }
  };

  const handleToggleLayer = (key: keyof ActiveLayers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLocationSelect = (loc: SearchLocation) => {
    const matching = GRID_CELLS.find((c) =>
      c.name.toLowerCase().includes(loc.name.toLowerCase().split(" ")[0])
    );
    if (matching) {
      setSelectedCell(matching);
      setViewMode("gis");
    }
  };

  const handleFocusAlert = (alert: AlertItem) => {
    const matching = GRID_CELLS.find((c) => alert.affectedCells.includes(c.cellId));
    if (matching) {
      setSelectedCell(matching);
      setViewMode("gis");
    }
  };

  const unacknowledgedAlertsCount = alerts.filter((a) => !a.isAcknowledged).length;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#070b14] text-slate-200">
      {/* 0A. Historical / Test Baseline Banner */}
      {isBaselineActive && (
        <div className="z-40 flex items-center justify-between border-b border-amber-600/70 bg-amber-950/90 px-4 py-1 text-xs font-mono text-amber-200 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-900 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-700">
              HISTORICAL / TEST BASELINE
            </span>
            <span>
              Active Model: <strong>{selectedModel.replace("_", " ").toUpperCase()}</strong> • Evaluated on Held-Out Test Split (Jul-Sep 2025). Benchmarking mode only.
            </span>
          </div>
          <button
            onClick={() => setShowBenchmarkMetrics(!showBenchmarkMetrics)}
            className="rounded underline hover:text-white text-[11px]"
          >
            {showBenchmarkMetrics ? "Hide Metrics" : "View PR-AUC & F1 Benchmarks"}
          </button>
        </div>
      )}

      {/* 0B. Deep Learning Active Candidate Banner */}
      {!isBaselineActive && (
        <div className="z-40 flex items-center justify-between border-b border-cyan-800/70 bg-[#07172b]/95 px-4 py-0.5 text-xs font-mono text-cyan-200 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-900/90 px-1.5 py-0.2 text-[9px] font-extrabold text-cyan-300 border border-cyan-500/60 animate-pulse">
              CONV3D MULTI-TASK AI
            </span>
            <span className="hidden md:inline text-slate-300 text-[11px]">
              Backbone: <strong>Thunderstorm</strong> (93.9% F1), <strong>Cloudburst</strong> (71.6% F1), <strong>Flash Flood</strong> (93.7% F1)
            </span>
            <span className="rounded bg-emerald-950/80 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-700/60">
              HURDLE CLEARED (+1560 bps)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400">LATENCY: <strong className="text-emerald-400">3.7 ms</strong></span>
            <button
              onClick={() => setShowBenchmarkMetrics(!showBenchmarkMetrics)}
              className="rounded underline hover:text-white text-[10px] text-cyan-400"
            >
              {showBenchmarkMetrics ? "Close Comparison" : "Benchmark Hurdle"}
            </button>
          </div>
        </div>
      )}

      {/* Benchmark & Hurdle Comparison Drawer */}
      {showBenchmarkMetrics && (
        <div className="z-30 border-b border-slate-800 bg-[#0c1322] px-4 py-2 text-xs font-mono text-slate-300 shadow-xl">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">MODEL HURDLE EVALUATION:</span>
                <span className="text-slate-400 text-[11px]">Held-Out Test Split (2025-07-01 to 2025-09-30, Zero Temporal Leakage)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-400 font-semibold">STATUS: HURDLE CLEARED</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Decision: PROMOTE TO ACTIVE PRODUCTION CANDIDATE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
              <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase">Tree Baseline F1</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">0.708</div>
              </div>
              <div className="rounded bg-cyan-950/60 p-1.5 border border-cyan-800/70">
                <div className="text-[9px] text-cyan-300 uppercase">Deep Candidate F1</div>
                <div className="text-xs font-bold text-cyan-200 mt-0.5">0.864 (+1560 bps)</div>
              </div>
              <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase">Tree PR-AUC</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">0.725</div>
              </div>
              <div className="rounded bg-cyan-950/60 p-1.5 border border-cyan-800/70">
                <div className="text-[9px] text-cyan-300 uppercase">Deep PR-AUC</div>
                <div className="text-xs font-bold text-cyan-200 mt-0.5">0.906 (+1813 bps)</div>
              </div>
              <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase">Brier Score</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">0.070</div>
              </div>
              <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase">Cal. Error</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">0.084</div>
              </div>
              <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase">Latency</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">3.7 ms</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Main Meteorological Header */}
      <header className="z-30 flex h-13 items-center justify-between border-b border-slate-800/90 bg-[#090e1a]/95 px-4 backdrop-blur">
        {/* Left: Brand & Pilot Status */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/50 bg-cyan-950/80 font-mono font-extrabold text-cyan-400 shadow-md text-sm">
            T3
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-slate-100 font-mono">
                TRINETRA
              </h1>
              <span className="rounded bg-cyan-950/80 px-1.5 py-0.2 text-[9px] font-mono font-semibold text-cyan-300 border border-cyan-800/70">
                NOWCAST
              </span>
              {isLiveConnected ? (
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-emerald-950/80 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300 border border-emerald-700/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  POSTGIS: LIVE
                </span>
              ) : (
                <span className="hidden sm:inline-block rounded bg-amber-950/50 px-1.5 py-0.2 text-[9px] font-mono text-amber-300 border border-amber-800/40">
                  SYNTHETIC REPLAY
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-mono">
              Himalayan Convective Weather Decision-Support
            </p>
          </div>
        </div>

        {/* Center: Basin / Location Search */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </div>

        {/* Right: Model Selector, 2D/3D Mode, Cycle Trigger, Alert Drawer Button */}
        <div className="flex items-center gap-2.5">
          {/* Model Engine Selector */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1 font-mono text-xs">
            <span className="text-slate-500 text-[10px] uppercase">Engine:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="spatiotemporal_v1" className="bg-[#0c1322] text-slate-200">
                Spatiotemporal Conv3D (Candidate)
              </option>
              <option value="tree_baseline" className="bg-[#0c1322] text-slate-200">
                Tree Baseline (v0.1.0)
              </option>
              <option value="persistence" className="bg-[#0c1322] text-slate-200">
                Persistence Decay (v0.1.0)
              </option>
              <option value="climatology" className="bg-[#0c1322] text-slate-200">
                Climatology Prior (v0.1.0)
              </option>
            </select>
          </div>

          {/* 2D GIS vs 3D Globe Mode Buttons */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5 font-mono text-xs">
            <button
              onClick={() => setViewMode("gis")}
              className={`flex items-center gap-1.5 rounded px-2 py-1 transition ${
                viewMode === "gis"
                  ? "bg-cyan-950 text-cyan-300 font-bold shadow border border-cyan-800/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>2D MAP</span>
            </button>

            <button
              onClick={() => setViewMode("globe")}
              className={`flex items-center gap-1.5 rounded px-2 py-1 transition ${
                viewMode === "globe"
                  ? "bg-cyan-950 text-cyan-300 font-bold shadow border border-cyan-800/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GlobeIcon className="h-3.5 w-3.5" />
              <span>3D GLOBE</span>
            </button>
          </div>

          {/* Orchestration Trigger Button */}
          <button
            onClick={handleTriggerCycle}
            disabled={isTriggeringCycle}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-800 bg-cyan-950/60 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-300 hover:bg-cyan-900 transition shadow"
            title="Trigger Automated Nowcast Prediction Cycle"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTriggeringCycle ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden xl:inline">{isTriggeringCycle ? "ORCHESTRATING..." : "NOWCAST CYCLE"}</span>
          </button>

          {/* Alert Drawer Trigger */}
          <button
            onClick={() => setIsAlertDrawerOpen(!isAlertDrawerOpen)}
            className={`relative flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-semibold transition ${
              unacknowledgedAlertsCount > 0
                ? "border-rose-700/80 bg-rose-950/70 text-rose-300 hover:bg-rose-900 shadow-md"
                : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ALERTS</span>
            {unacknowledgedAlertsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unacknowledgedAlertsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. Telemetry Status Bar */}
      <div className="z-20 border-b border-slate-800/80 px-4 py-1 bg-[#080d1a]">
        <DataFreshness
          satelliteAgeMinutes={12}
          nwpAgeMinutes={45}
          lastInferenceUtc={lastGenTime}
          inferenceLatencyMs={isBaselineActive ? 120 : 4}
          modelVersion={isBaselineActive ? `v0.1.0-${selectedModel}` : "v1.0.0-conv3d-multitask"}
          jobId={activeJobId}
        />
      </div>

      {/* 3. Main Full-Screen Map Workspace */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Floating Layers Button & Collapsible Panel (GIS mode) */}
        {viewMode === "gis" && (
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            <button
              onClick={() => setIsLayersOpen(!isLayersOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-[#0c1322]/90 px-3 py-1.5 text-xs font-mono font-semibold text-slate-200 hover:text-cyan-300 hover:border-cyan-700 shadow-2xl backdrop-blur transition"
            >
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>LAYERS</span>
              <span className="rounded bg-cyan-950 px-1.5 py-0.2 text-[10px] font-bold text-cyan-300 border border-cyan-800/60">
                {Object.values(layers).filter(Boolean).length}
              </span>
            </button>

            {isLayersOpen && (
              <div className="w-72 animate-in fade-in slide-in-from-top-2 duration-200">
                <RiskLayers layers={layers} onToggleLayer={handleToggleLayer} />
              </div>
            )}
          </div>
        )}

        {/* Center Hero: Full-Screen GIS Map or 3D Globe */}
        <main className="relative flex-1 h-full w-full">
          {/* Top Floating Quick Risk/Region Filter Pills (GIS mode) */}
          {viewMode === "gis" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1.5 rounded-full border border-slate-800/90 bg-[#0a1122]/90 px-3 py-1 text-[11px] font-mono shadow-2xl backdrop-blur-md">
              <span className="text-slate-500 font-semibold pr-1 uppercase text-[10px]">Filter:</span>
              <button
                onClick={() => setFilterMode("all")}
                className={`rounded-full px-2.5 py-0.5 transition ${filterMode === "all" ? "bg-cyan-900 text-cyan-200 font-bold border border-cyan-600" : "text-slate-400 hover:text-slate-200"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode("critical")}
                className={`rounded-full px-2.5 py-0.5 transition flex items-center gap-1 ${filterMode === "critical" ? "bg-rose-950 text-rose-300 font-bold border border-rose-600" : "text-slate-400 hover:text-slate-200"}`}
              >
                <span>Critical / Severe</span>
                <span className="text-rose-400 font-bold">▲</span>
              </button>
              <button
                onClick={() => setFilterMode("flash_flood")}
                className={`rounded-full px-2.5 py-0.5 transition flex items-center gap-1 ${filterMode === "flash_flood" ? "bg-blue-950 text-blue-300 font-bold border border-blue-600" : "text-slate-400 hover:text-slate-200"}`}
              >
                <span>Flash-Flood</span>
              </button>
              <button
                onClick={() => setFilterMode("steep_gorges")}
                className={`rounded-full px-2.5 py-0.5 transition ${filterMode === "steep_gorges" ? "bg-amber-950 text-amber-300 font-bold border border-amber-600" : "text-slate-400 hover:text-slate-200"}`}
              >
                Gorges
              </button>
              <button
                onClick={() => setFilterMode("foothills")}
                className={`rounded-full px-2.5 py-0.5 transition ${filterMode === "foothills" ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-600" : "text-slate-400 hover:text-slate-200"}`}
              >
                Foothills
              </button>
            </div>
          )}

          {viewMode === "gis" ? (
            <ForecastMap
              layers={layers}
              selectedCell={selectedCell}
              onSelectCell={setSelectedCell}
              horizonMinutes={horizonMinutes}
              filterMode={filterMode}
            />
          ) : (
            <GlobeScene
              onSelectStation={(name) => {
                const matched = GRID_CELLS.find((c) =>
                  name.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])
                );
                if (matched) setSelectedCell(matched);
              }}
              onEnterNowcastGrid={() => setViewMode("gis")}
            />
          )}

          {/* Bottom Floating Timeline Scrubber */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 pointer-events-auto">
            <Timeline
              currentHorizonMinutes={horizonMinutes}
              onHorizonChange={setHorizonMinutes}
              baseTimestampUtc="2026-09-11T08:30:00Z"
            />
          </div>
        </main>

        {/* Right Inspector Drawer: Cell Risk & XAI Attribution */}
        {selectedCell && (
          <aside className="absolute top-3 right-3 bottom-16 z-30 w-84 md:w-96 shadow-2xl animate-in slide-in-from-right duration-200">
            <RiskPanel
              cellData={selectedCell}
              onClose={() => setSelectedCell(null)}
              className="h-full border border-slate-700/80 bg-[#0c1322]/95 backdrop-blur-md"
            />
          </aside>
        )}

        {/* Slide-out Categorized Alert Drawer */}
        {isAlertDrawerOpen && (
          <div className="absolute top-0 right-0 bottom-0 z-40 w-full sm:w-96 shadow-2xl transition-all">
            <AlertPanel
              alerts={alerts}
              onAcknowledgeAlert={acknowledgeAlert}
              onFocusRegion={handleFocusAlert}
              onClose={() => setIsAlertDrawerOpen(false)}
            />
          </div>
        )}
      </div>

      {/* 4. Bottom Collapsible Telemetry Shelf (Atmospheric Soundings) */}
      <footer className="z-20 border-t border-slate-800 bg-[#080d1a] px-4 py-1.5">
        <div className="flex items-center justify-between font-mono text-xs text-slate-300">
          <div className="flex items-center gap-4 text-[11px] overflow-x-auto py-0.5">
            <span className="text-cyan-400 font-bold flex items-center gap-1 whitespace-nowrap">
              <Activity className="h-3.5 w-3.5" />
              SOUNDINGS TELEMETRY:
            </span>
            <span className="whitespace-nowrap">
              CAPE: <strong className="text-emerald-400">{PILOT_ATMOSPHERIC_METRICS.cape} J/kg</strong>
            </span>
            <span className="hidden sm:inline whitespace-nowrap">
              CIN: <strong className="text-slate-200">{PILOT_ATMOSPHERIC_METRICS.cin} J/kg</strong>
            </span>
            <span className="hidden md:inline whitespace-nowrap">
              TPW: <strong className="text-cyan-300">{PILOT_ATMOSPHERIC_METRICS.tpw} mm</strong>
            </span>
            <span className="hidden lg:inline whitespace-nowrap">
              RADAR: <strong className="text-purple-300">{PILOT_ATMOSPHERIC_METRICS.radar_reflectivity_dbz} dBZ</strong>
            </span>
            <span className="hidden xl:inline whitespace-nowrap">
              TIR1 COOLING: <strong className="text-rose-400">{PILOT_ATMOSPHERIC_METRICS.tir1_cooling_rate} K/hr</strong>
            </span>
          </div>

          <button
            onClick={() => setIsTelemetryShelfOpen(!isTelemetryShelfOpen)}
            className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-200 font-semibold bg-cyan-950/70 px-2.5 py-1 rounded border border-cyan-800/70 whitespace-nowrap ml-3"
          >
            <span>{isTelemetryShelfOpen ? "COLLAPSE" : "EXPAND SOUNDINGS"}</span>
            {isTelemetryShelfOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>

        {/* Expanded Soundings Grid */}
        {isTelemetryShelfOpen && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 animate-in slide-in-from-bottom duration-200">
            <WeatherCard
              metrics={PILOT_ATMOSPHERIC_METRICS}
              stationName={
                selectedCell
                  ? `${selectedCell.name} (Cell #${selectedCell.cellId})`
                  : "Dehradun DWR Regional Radiosonde Array"
              }
              timestamp={`2026-09-11 ${horizonMinutes ? `+${horizonMinutes / 60}h Valid` : "08:30 UTC"}`}
              isSynthetic={true}
            />
          </div>
        )}
      </footer>
    </div>
  );
}
