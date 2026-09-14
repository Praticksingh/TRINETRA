"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Layers,
  Activity,
  AlertTriangle,
  Compass,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  Map as MapIcon,
  Globe as GlobeIcon,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { SentinelProvider, useSentinel } from "@/context/SentinelContext";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, CardFooter, StatusDot, OverviewWorkspace, MapWorkspace, TimelineWorkspace, AlertCenterWorkspace, InsightsWorkspace, ProvenanceWorkspace, GlobeWorkspace, ToastProvider } from "@/components/sentinel";

import WeatherCard, { AtmosphericMetrics } from "./components/WeatherCard";
import DataFreshness from "./components/DataFreshness";

// Telemetry soundings metric data
const PILOT_ATMOSPHERIC_METRICS: AtmosphericMetrics = {
  cape: 3150,
  cin: -18,
  tpw: 58.2,
  tir1_cooling_rate: -16.5,
  radar_reflectivity_dbz: 48,
  surface_temp_c: 24.8,
  rh_percent: 88,
};

function SentinelWorkspaceContent() {
  const {
    currentView,
    setCurrentView,
    selectedCell,
    setSelectedCell,
    horizonMinutes,
    setHorizonMinutes,
    baseTimestampUtc,
    selectedModel,
    isBaselineActive,
    layers,
    toggleLayer,
    filterMode,
    setFilterMode,
    alerts,
    acknowledgeAlert,
    activeJobId,
    lastGenTime,
  } = useSentinel();

  // Collapsible layers dropdown
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);
  // Collapsible telemetry shelf
  const [isTelemetryShelfOpen, setIsTelemetryShelfOpen] = useState<boolean>(false);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#070D18]">
      {/* 0A. Historical / Test Baseline Banner */}
      {isBaselineActive && (
        <div className="z-30 flex items-center justify-between border-b border-amber-600/50 bg-amber-950/80 px-4 py-1 text-xs font-sans text-amber-200 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-700/60">
              BENCHMARK BASELINE
            </span>
            <span className="text-[11px] text-amber-100/90">
              Active Model: <strong className="font-mono">{selectedModel.replace("_", " ").toUpperCase()}</strong> • Evaluated on held-out test data. Benchmarking mode only.
            </span>
          </div>
          <button
            onClick={() => setCurrentView("insights")}
            className="rounded underline hover:text-white text-[11px] font-medium text-amber-300"
          >
            View model benchmarks →
          </button>
        </div>
      )}

      {/* 0B. Deep Learning Active Candidate Banner */}
      {!isBaselineActive && (
        <div className="z-30 flex items-center justify-between border-b border-[#1F3350] bg-[#0c1424]/95 px-4 py-1 text-xs font-sans text-slate-300 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-950/80 px-1.5 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-800/60">
              AI MODEL ACTIVE
            </span>
            <span className="hidden md:inline text-slate-300 text-[11px]">
              Multi-task model: Thunderstorm (94%), Flash Flood (94%), Cloudburst (72%)
            </span>
            <span className="rounded bg-emerald-950/80 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300 border border-emerald-700/50">
              Accuracy check passed
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400">Speed: <strong className="text-emerald-400 font-mono">3.7 ms</strong></span>
            <button
              onClick={() => setCurrentView("insights")}
              className="rounded underline hover:text-white text-[11px] text-sky-400 font-medium"
            >
              View model details →
            </button>
          </div>
        </div>
      )}

      {/* Compact Telemetry Status Bar */}
      <div className="z-20 border-b border-[#1F3350] px-4 py-1 bg-[#090E1A]">
        <DataFreshness
          satelliteAgeMinutes={12}
          nwpAgeMinutes={45}
          lastInferenceUtc={lastGenTime}
          inferenceLatencyMs={isBaselineActive ? 120 : 4}
          modelVersion={isBaselineActive ? `v0.1.0-${selectedModel}` : "v1.0.0-conv3d-multitask"}
          jobId={activeJobId}
        />
      </div>

      {/* View Switcher Routing */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* VIEW 1: 2D GIS INTELLIGENCE MAP */}
        {currentView === "map" && <MapWorkspace />}

        {/* VIEW 2: 3D GLOBE */}
        {currentView === "globe" && <GlobeWorkspace />}

        {/* VIEW 3: OVERVIEW */}
        {currentView === "overview" && <OverviewWorkspace />}

        {/* VIEW 4: ALERT CENTER */}
        {currentView === "alerts" && <AlertCenterWorkspace />}

        {/* VIEW 5: FORECAST TIMELINE */}
        {currentView === "timeline" && <TimelineWorkspace />}

        {/* VIEW 6: AI INSIGHTS */}
        {currentView === "insights" && <InsightsWorkspace />}

        {/* VIEW 7: DATA & PROVENANCE */}
        {currentView === "provenance" && <ProvenanceWorkspace />}
      </div>

      {/* 4. Bottom Collapsible Telemetry Shelf (Atmospheric Soundings) */}
      <footer className="z-20 border-t border-[#1F3350] bg-[#090E1A] px-4 py-1.5">
        <div className="flex items-center justify-between font-sans text-xs text-slate-300">
          <div className="flex items-center gap-4 text-[11px] overflow-x-auto py-0.5">
            <span className="text-sky-400 font-semibold flex items-center gap-1 whitespace-nowrap">
              <Activity className="h-3.5 w-3.5" />
              Atmospheric data:
            </span>
            <span className="whitespace-nowrap font-mono text-[10px]">
              CAPE: <strong className="text-emerald-400">{PILOT_ATMOSPHERIC_METRICS.cape} J/kg</strong>
            </span>
            <span className="hidden sm:inline whitespace-nowrap font-mono text-[10px]">
              CIN: <strong className="text-slate-200">{PILOT_ATMOSPHERIC_METRICS.cin} J/kg</strong>
            </span>
            <span className="hidden md:inline whitespace-nowrap font-mono text-[10px]">
              TPW: <strong className="text-sky-300">{PILOT_ATMOSPHERIC_METRICS.tpw} mm</strong>
            </span>
            <span className="hidden lg:inline whitespace-nowrap font-mono text-[10px]">
              RADAR: <strong className="text-purple-300">{PILOT_ATMOSPHERIC_METRICS.radar_reflectivity_dbz} dBZ</strong>
            </span>
            <span className="hidden xl:inline whitespace-nowrap font-mono text-[10px]">
              TIR1 COOLING: <strong className="text-rose-400">{PILOT_ATMOSPHERIC_METRICS.tir1_cooling_rate} K/hr</strong>
            </span>
          </div>

          <button
            onClick={() => setIsTelemetryShelfOpen(!isTelemetryShelfOpen)}
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium bg-[#16233B] px-2.5 py-1 rounded border border-sky-500/30 whitespace-nowrap ml-3 transition shadow-sm"
          >
            <span>{isTelemetryShelfOpen ? "Hide atmospheric details" : "View atmospheric details"}</span>
            {isTelemetryShelfOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>

        {/* Expanded Soundings Grid */}
        {isTelemetryShelfOpen && (
          <div className="mt-2 pt-2 border-t border-[#1F3350]/80 animate-in slide-in-from-bottom duration-200">
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

export default function SentinelConsole() {
  return (
    <SentinelProvider>
      <ToastProvider>
        <SentinelShell>
          <SentinelWorkspaceContent />
        </SentinelShell>
      </ToastProvider>
    </SentinelProvider>
  );
}
