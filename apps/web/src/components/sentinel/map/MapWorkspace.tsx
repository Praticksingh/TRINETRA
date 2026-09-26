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
    <div className="flex h-full w-full items-center justify-center bg-[#090B10] text-slate-400 font-sans text-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
        <span>Loading Weather Map...</span>
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
    <div className="relative flex flex-1 h-full w-full overflow-hidden bg-[#090B10]">
      {/* 1. Full-Screen Interactive Weather Map Canvas (Dominates Screen - Rule 10) */}
      <main className="relative h-full w-full z-0">
        <ForecastMap
          cells={cells}
          layers={layers}
          selectedCell={selectedCell}
          onSelectCell={setSelectedCell}
          horizonMinutes={horizonMinutes}
          filterMode={filterMode}
          topCenterSlot={<HazardFilterBar />}
        />
      </main>

      {/* 2. Floating Operational Rail (Collapsible, unobtrusive) */}
      <OperationalRail activeLayerCount={activeLayerCount} onOpenLayers={() => setIsLayerDrawerOpen(true)} />

      {/* 3. Compact Floating Layer Entry Point for Tablet & Mobile */}
      <div className="absolute top-3 left-3 z-20 lg:hidden">
        <button
          onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
          className="flex items-center gap-2 rounded-lg border border-[#2B3142] bg-[#121520]/95 px-3 py-2 text-xs font-sans font-medium text-slate-200 hover:text-white shadow-md backdrop-blur-md transition min-h-[38px]"
          title="Toggle Weather Map Layers"
          aria-label="Toggle Weather Map Layers"
          aria-expanded={isLayerDrawerOpen}
        >
          <Layers className="h-3.5 w-3.5 text-indigo-400" />
          <span>Layers</span>
          <span className="rounded bg-[#1A1F2E] px-1.5 py-0.2 text-[10px] font-bold text-indigo-300 font-mono">
            {activeLayerCount}
          </span>
        </button>

        {/* Slide-out Layer Drawer */}
        <MapLayerDrawer
          isOpen={isLayerDrawerOpen}
          onClose={() => setIsLayerDrawerOpen(false)}
        />
      </div>

      {/* 4. Bottom-Center Floating Timeline Scrubber Dock (Positioned above mobile bottom nav) */}
      <div className="absolute bottom-18 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl lg:max-w-2xl xl:max-w-3xl px-2 sm:px-4 pointer-events-auto">
        <TimelineDock
          currentHorizonMinutes={horizonMinutes}
          onHorizonChange={setHorizonMinutes}
          baseTimestampUtc={baseTimestampUtc}
        />
      </div>

      {/* 5. Accessible Severity Map Legend */}
      <MapLegend />

      {/* 6. Location Detail Panel: Responsive Bottom Sheet on Mobile, Drawer on Desktop */}
      {selectedCell && (
        <aside
          role="region"
          aria-label={`Location details for ${selectedCell.name}`}
          className="fixed inset-x-2 bottom-18 top-auto max-h-[75vh] sm:fixed sm:inset-x-auto sm:top-14 sm:right-4 sm:bottom-20 z-30 sm:w-96 shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-right-3 duration-200 overflow-hidden"
        >
          <RiskInspector
            cellData={selectedCell}
            onClose={() => setSelectedCell(null)}
            className="h-full border border-[#2B3142] bg-[#121520]/98 backdrop-blur-xl"
          />
        </aside>
      )}
    </div>
  );
};
