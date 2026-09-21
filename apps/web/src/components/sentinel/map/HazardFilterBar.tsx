"use client";

import React, { useMemo } from "react";
import { useSentinel } from "@/context/SentinelContext";
import { FilterMode, GRID_CELLS } from "@/app/forecast/ForecastMap";
import { Filter, Flame, Waves, Mountain, Compass } from "lucide-react";

export const HazardFilterBar: React.FC = () => {
  const { cells, filterMode, setFilterMode } = useSentinel();

  const filterCounts = useMemo(() => {
    return {
      all: cells.length,
      critical: cells.filter((c) => c.severity === "critical" || c.severity === "warning").length,
      flash_flood: cells.filter((c) => c.probabilities.flashFlood >= 0.7).length,
      steep_gorges: cells.filter((c) => c.terrain.slopeDeg >= 35.0).length,
      foothills: cells.filter((c) => c.terrain.elevationM < 800).length,
    };
  }, [cells]);

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
      activeClasses: "bg-[#1C1F30] text-indigo-300 font-semibold border-indigo-500/40 shadow-sm",
    },
    {
      id: "critical",
      label: "Critical (▲)",
      badgeCount: filterCounts.critical,
      activeClasses: "bg-[#241418] text-rose-300 font-semibold border-rose-500/40 shadow-sm",
    },
    {
      id: "flash_flood",
      label: "Flash Flood",
      badgeCount: filterCounts.flash_flood,
      activeClasses: "bg-[#1C1F30] text-indigo-300 font-semibold border-indigo-500/40 shadow-sm",
    },
    {
      id: "steep_gorges",
      label: "Steep Slopes (≥35°)",
      badgeCount: filterCounts.steep_gorges,
      activeClasses: "bg-[#241F12] text-amber-300 font-semibold border-amber-500/40 shadow-sm",
    },
    {
      id: "foothills",
      label: "Foothills (<800m)",
      badgeCount: filterCounts.foothills,
      activeClasses: "bg-[#11221A] text-emerald-300 font-semibold border-emerald-500/40 shadow-sm",
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Hazard Sector Filters"
      className="hidden md:flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#161820]/95 px-3 py-1.5 text-xs font-sans shadow-clay-card backdrop-blur-xl select-none"
    >
      <span className="text-zinc-400 font-medium pr-1 text-[11px] flex items-center gap-1">
        <Filter className="h-3 w-3 text-indigo-400" />
        Filter:
      </span>

      {filterOptions.map((opt) => {
        const isActive = filterMode === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => setFilterMode(opt.id)}
            className={`rounded-xl px-2.5 py-1 transition-all duration-150 flex items-center gap-1.5 border text-xs active:translate-y-0.5 ${
              isActive
                ? `${opt.activeClasses} shadow-clay-btn`
                : "border-transparent text-zinc-400 hover:text-slate-200 hover:bg-[#1D202B] hover:shadow-clay-btn font-medium"
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold shadow-clay-badge ${
                isActive ? "bg-black/40 text-white" : "bg-[#111217] text-zinc-400"
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
