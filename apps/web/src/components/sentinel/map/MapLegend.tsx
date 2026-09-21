"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      role="region"
      aria-label="Map Severity Legend"
      className="absolute bottom-28 right-3 sm:bottom-4 sm:right-4 z-20 rounded-2xl border border-white/[0.08] bg-[#161820]/95 p-3 font-sans text-xs text-slate-300 backdrop-blur-xl shadow-clay-card select-none max-w-[calc(100vw-24px)]"
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Severity:</span>
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
            <span className="hidden sm:inline">Low (●)</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400 font-medium">
            <span className="inline-block h-2 w-2 bg-yellow-400 transform rotate-45 shadow-sm" />
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
          className="text-zinc-400 hover:text-slate-200 p-1 rounded-lg bg-[#1D202B] border border-white/[0.06] shadow-clay-btn active:translate-y-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          title={isExpanded ? "Collapse Legend Details" : "Expand Legend Details"}
          aria-label={isExpanded ? "Collapse Legend Details" : "Expand Legend Details"}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-white/[0.08] space-y-1.5 text-[11px] text-zinc-400 animate-in fade-in duration-150 font-sans">
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 border border-indigo-500/70 border-dashed bg-indigo-500/20 inline-block rounded-sm" />
            <span>Pilot Catchment Corridor (Uttarakhand)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 border border-purple-500/70 border-dashed bg-purple-500/10 inline-block rounded-sm" />
            <span>Doppler Weather Radar (DWR) 75km Range</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 border border-white/[0.08] bg-[#111217] inline-block rounded-sm" />
            <span>Forecast Grid Resolution: ~4.4 km (0.04°)</span>
          </div>
        </div>
      )}
    </div>
  );
};
