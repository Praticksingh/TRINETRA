"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useSentinel } from "@/context/SentinelContext";
import { MapLayerDrawer } from "./MapLayerDrawer";
import { HazardFilterBar } from "./HazardFilterBar";
import { MapLegend } from "./MapLegend";
import { TimelineDock } from "@/components/sentinel/timeline";
import { RiskInspector } from "@/components/sentinel/inspector";
import { OperationalRail } from "./OperationalRail";
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
    cells,
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
    <div className="relative flex flex-1 h-full w-full overflow-hidden bg-[#0B0C10]">
      {/* 1. Full-Screen Interactive GIS Map */}
      <main className="relative h-full w-full z-0">
        <ForecastMap
          cells={cells}
          layers={layers}
          selectedCell={selectedCell}
          onSelectCell={setSelectedCell}
          horizonMinutes={horizonMinutes}
          filterMode={filterMode}
        />
      </main>

      <OperationalRail activeLayerCount={activeLayerCount} onOpenLayers={() => setIsLayerDrawerOpen(true)} />

      {/* Compact layer entry point for tablet and mobile. */}
      <div className="absolute top-4 left-4 z-20 lg:hidden">
        <button
          onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0F1624]/95 px-3 py-1.5 text-xs font-sans font-medium text-slate-200 hover:text-sky-300 hover:border-slate-700 shadow-xl backdrop-blur-md transition select-none"
          title="Toggle Weather Map Layers"
          aria-label="Toggle Weather Map Layers"
          aria-expanded={isLayerDrawerOpen}
        >
          <Layers className="h-3.5 w-3.5 text-sky-400" />
          <span>Layers</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-bold text-sky-300 border border-slate-700 font-mono">
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
          className="fixed inset-x-2 bottom-2 top-auto max-h-[85vh] sm:fixed sm:inset-x-auto sm:top-16 sm:right-4 sm:bottom-20 z-30 sm:w-[26rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom sm:slide-in-from-right-3 duration-200 overflow-hidden"
        >
          <RiskInspector
            cellData={selectedCell}
            onClose={() => setSelectedCell(null)}
            className="h-full border border-slate-800 bg-[#0F1624]/98 backdrop-blur-xl"
          />
        </aside>
      )}
    </div>
  );
};
