"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      role="region"
      aria-label="Map Severity Legend"
      className="absolute bottom-28 right-3 sm:bottom-4 sm:right-4 z-20 rounded-lg border border-[#1E2E48] bg-[#0c1424]/95 p-2 font-sans text-xs text-slate-300 backdrop-blur-md shadow-2xl select-none max-w-[calc(100vw-24px)]"
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Severity:</span>
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">Low (●)</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400 font-medium">
            <span className="inline-block h-2 w-2 bg-yellow-400 transform rotate-45" />
            <span className="hidden sm:inline">Watch (◆)</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-medium">
            <span className="inline-block font-bold">▲</span>
            <span className="hidden sm:inline">Warning (▲)</span>
          </div>
          <div className="flex items-center gap-1 text-rose-400 font-medium">
            <span className="inline-block font-bold">▲</span>
            <span className="hidden sm:inline">Critical (▲)</span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          title={isExpanded ? "Collapse Legend Details" : "Expand Legend Details"}
          aria-label={isExpanded ? "Collapse Legend Details" : "Expand Legend Details"}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-[#1E2E48] space-y-1.5 text-[11px] text-slate-400 animate-in fade-in duration-150 font-sans">
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 border border-sky-500/70 border-dashed bg-sky-500/20 inline-block rounded-sm" />
            <span>Pilot Catchment Corridor (Uttarakhand)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 border border-purple-500/70 border-dashed bg-purple-500/10 inline-block rounded-sm" />
            <span>Doppler Weather Radar (DWR) 75km Range</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 border border-[#1E2E48] bg-[#16233B] inline-block rounded-sm" />
            <span>Forecast Grid Resolution: ~4.4 km (0.04°)</span>
          </div>
        </div>
      )}
    </div>
  );
};
