"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  X,
  ChevronUp,
  ChevronDown,
  Wind,
  Droplets,
  Radio,
} from "lucide-react";
import { SentinelProvider, useSentinel } from "@/context/SentinelContext";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import {
  OverviewWorkspace,
  MapWorkspace,
  TimelineWorkspace,
  AlertCenterWorkspace,
  InsightsWorkspace,
  ProvenanceWorkspace,
  GlobeWorkspace,
  ToastProvider,
} from "@/components/sentinel";

import WeatherCard, { AtmosphericMetrics } from "./components/WeatherCard";

// Regional atmospheric telemetry sounding profile
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
    horizonMinutes,
    selectedModel,
    isBaselineActive,
  } = useSentinel();

  // Collapsible floating atmospheric sounding panel
  const [isSoundingsOpen, setIsSoundingsOpen] = useState<boolean>(false);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0B0C10]">
      {/* Benchmark Mode Notification (Subtle, non-intrusive) */}
      {isBaselineActive && (
        <div className="z-20 flex items-center justify-between border-b border-amber-500/30 bg-amber-950/60 px-4 py-1 text-xs text-amber-200 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-900/80 px-1.5 py-0.2 text-[10px] font-bold text-amber-300 border border-amber-700/60">
              BENCHMARK BASELINE ACTIVE
            </span>
            <span className="text-[11px] text-amber-100/90">
              Model: <strong className="font-mono">{selectedModel.replace("_", " ").toUpperCase()}</strong> (Evaluated on held-out test data for benchmarking).
            </span>
          </div>
          <button
            onClick={() => setCurrentView("insights")}
            className="rounded underline hover:text-white text-[11px] font-medium text-amber-300"
          >
            Compare Benchmarks →
          </button>
        </div>
      )}

      {/* Main Workspace Routing */}
      <main className="relative flex flex-1 overflow-hidden" role="main">
        {currentView === "map" && <MapWorkspace />}
        {currentView === "globe" && <GlobeWorkspace />}
        {currentView === "overview" && <OverviewWorkspace />}
        {currentView === "alerts" && <AlertCenterWorkspace />}
        {currentView === "timeline" && <TimelineWorkspace />}
        {currentView === "insights" && <InsightsWorkspace />}
        {currentView === "provenance" && <ProvenanceWorkspace />}
      </main>

      {/* Unobtrusive Floating Atmospheric Soundings Pill (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
        {!isSoundingsOpen ? (
          <button
            onClick={() => setIsSoundingsOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0F1624]/90 hover:bg-slate-800 px-3 py-1.5 text-xs text-slate-300 shadow-xl backdrop-blur-md transition hover:border-slate-700"
            title="View Regional Atmospheric Soundings (CAPE, CIN, Radar)"
            aria-label="Open Atmospheric Soundings"
          >
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-medium text-[11px] hidden sm:inline">Atmospheric Soundings</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400">
              CAPE {PILOT_ATMOSPHERIC_METRICS.cape}
            </span>
            <ChevronUp className="h-3 w-3 text-slate-400" />
          </button>
        ) : (
          <div className="w-80 sm:w-96 rounded-xl border border-slate-800 bg-[#0F1624]/98 p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Activity className="h-3.5 w-3.5 text-sky-400" />
                <span>Atmospheric Telemetry Profile</span>
              </div>
              <button
                onClick={() => setIsSoundingsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-md transition"
                aria-label="Close Soundings Panel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

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
      </div>
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
