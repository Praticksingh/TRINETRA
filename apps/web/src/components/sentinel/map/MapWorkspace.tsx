"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useSentinel } from "@/context/SentinelContext";
import { MapLayerDrawer } from "./MapLayerDrawer";
import { HazardFilterBar } from "./HazardFilterBar";
import { MapLegend } from "./MapLegend";
import { TimelineDock } from "@/components/sentinel/timeline";
import { RiskInspector } from "@/components/sentinel/inspector";
import { Layers } from "lucide-react";

// Dynamic import for Leaflet ForecastMap to prevent SSR issues
const ForecastMap = dynamic(() => import("@/app/forecast/ForecastMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#070b14] text-slate-500 font-mono text-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#36D9E8] border-t-transparent"></div>
        <span>INITIALIZING TACTICAL GIS DECISION MAP...</span>
      </div>
    </div>
  ),
});

export const MapWorkspace: React.FC = () => {
  const {
    layers,
    selectedCell,
    setSelectedCell,
    horizonMinutes,
    setHorizonMinutes,
    baseTimestampUtc,
    filterMode,
  } = useSentinel();

  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState(false);

  const activeLayerCount = Object.values(layers).filter(Boolean).length;

  return (
    <div className="relative flex flex-1 h-full w-full overflow-hidden bg-[#070D18]">
      {/* 1. Full-Screen Interactive GIS Map */}
      <main className="relative h-full w-full z-0">
        <ForecastMap
          layers={layers}
          selectedCell={selectedCell}
          onSelectCell={setSelectedCell}
          horizonMinutes={horizonMinutes}
          filterMode={filterMode}
        />
      </main>

      {/* 2. Top-Left Floating Tactical Layer Drawer Button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
          className="flex items-center gap-2 rounded-lg border border-[#1E2E48] bg-[#111A2C]/95 px-3 py-1.5 text-xs font-sans font-medium text-slate-200 hover:text-sky-300 hover:border-sky-500/40 shadow-2xl backdrop-blur-md transition select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          title="Toggle Weather Map Layers"
          aria-label="Toggle Weather Map Layers"
          aria-expanded={isLayerDrawerOpen}
        >
          <Layers className="h-3.5 w-3.5 text-sky-400" />
          <span>Layers</span>
          <span className="rounded bg-[#0C2438] px-1.5 py-0.2 text-[10px] font-bold text-sky-300 border border-sky-500/30 font-mono">
            {activeLayerCount}
          </span>
        </button>

        {/* Slide-out Layer Drawer */}
        <MapLayerDrawer
          isOpen={isLayerDrawerOpen}
          onClose={() => setIsLayerDrawerOpen(false)}
        />
      </div>

      {/* 3. Top-Center Quick Hazard Filter Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <HazardFilterBar />
      </div>

      {/* 4. Bottom-Center Floating Timeline Scrubber Dock */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-2 sm:px-4 pointer-events-auto">
        <TimelineDock
          currentHorizonMinutes={horizonMinutes}
          onHorizonChange={setHorizonMinutes}
          baseTimestampUtc={baseTimestampUtc}
        />
      </div>

      {/* 5. Accessible Geometric Severity Map Legend */}
      <MapLegend />

      {/* 6. Risk Inspector: Responsive Bottom Sheet on Mobile, Drawer on Desktop */}
      {selectedCell && (
        <aside
          role="region"
          aria-label={`Risk Inspector for ${selectedCell.name}`}
          className="fixed inset-x-2 bottom-2 top-auto max-h-[85vh] sm:fixed sm:inset-x-auto sm:top-16 sm:right-4 sm:bottom-20 z-30 sm:w-96 shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in slide-in-from-bottom sm:slide-in-from-right-3 duration-200 overflow-hidden"
        >
          <RiskInspector
            cellData={selectedCell}
            onClose={() => setSelectedCell(null)}
            className="h-full border border-[#1E2E48] bg-[#111A2C]/98 backdrop-blur-md"
          />
        </aside>
      )}
    </div>
  );
};
