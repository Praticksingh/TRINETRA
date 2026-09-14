"use client";

import React, { useMemo } from "react";
import { useSentinel } from "@/context/SentinelContext";
import { FilterMode, GRID_CELLS } from "@/app/forecast/ForecastMap";
import { Filter, Flame, Waves, Mountain, Compass } from "lucide-react";

export const HazardFilterBar: React.FC = () => {
  const { filterMode, setFilterMode } = useSentinel();

  const filterCounts = useMemo(() => {
    return {
      all: GRID_CELLS.length,
      critical: GRID_CELLS.filter((c) => c.severity === "critical" || c.severity === "warning").length,
      flash_flood: GRID_CELLS.filter((c) => c.probabilities.flashFlood >= 0.7).length,
      steep_gorges: GRID_CELLS.filter((c) => c.terrain.slopeDeg >= 35.0).length,
      foothills: GRID_CELLS.filter((c) => c.terrain.elevationM < 800).length,
    };
  }, []);

  const filterOptions: Array<{
    id: FilterMode;
    label: string;
    icon?: React.ElementType;
    badgeCount: number;
    activeClasses: string;
  }> = [
    {
      id: "all",
      label: "All Sectors",
      badgeCount: filterCounts.all,
      activeClasses: "bg-sky-950/80 text-sky-300 font-semibold border-sky-500/40 shadow-sm",
    },
    {
      id: "critical",
      label: "Critical (▲)",
      badgeCount: filterCounts.critical,
      activeClasses: "bg-rose-950/90 text-rose-300 font-semibold border-rose-600/60 shadow-sm",
    },
    {
      id: "flash_flood",
      label: "Flash Flood",
      badgeCount: filterCounts.flash_flood,
      activeClasses: "bg-blue-950/90 text-blue-300 font-semibold border-blue-600/60 shadow-sm",
    },
    {
      id: "steep_gorges",
      label: "Steep Slopes (≥35°)",
      badgeCount: filterCounts.steep_gorges,
      activeClasses: "bg-amber-950/90 text-amber-300 font-semibold border-amber-600/60 shadow-sm",
    },
    {
      id: "foothills",
      label: "Foothills (<800m)",
      badgeCount: filterCounts.foothills,
      activeClasses: "bg-emerald-950/90 text-emerald-300 font-semibold border-emerald-600/60 shadow-sm",
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Hazard Sector Filters"
      className="hidden md:flex items-center gap-1.5 rounded-full border border-[#1F3350] bg-[#0c1424]/95 px-3 py-1 text-xs font-sans shadow-2xl backdrop-blur-md select-none"
    >
      <span className="text-slate-400 font-medium pr-1 text-[11px] flex items-center gap-1">
        <Filter className="h-3 w-3 text-sky-400" />
        Filter:
      </span>

      {filterOptions.map((opt) => {
        const isActive = filterMode === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => setFilterMode(opt.id)}
            className={`rounded-full px-2.5 py-0.5 transition-all duration-150 flex items-center gap-1.5 border text-xs ${
              isActive
                ? opt.activeClasses
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#16233B]/50 font-medium"
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.1 text-[10px] font-mono font-bold ${
                isActive ? "bg-black/30 text-white" : "bg-[#16233B] text-slate-400"
              }`}
            >
              {opt.badgeCount}
            </span>
          </button>
        );
      })}
    </div>
  );
};
