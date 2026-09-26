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
    shortLabel: string;
    title: string;
    badgeCount: number;
    activeClasses: string;
  }> = [
    {
      id: "all",
      label: "All Areas",
      shortLabel: "All",
      title: "View all monitored river basins and valleys",
      badgeCount: filterCounts.all,
      activeClasses: "bg-[#1C1F30] text-indigo-300 font-semibold border-indigo-500/40 shadow-sm",
    },
    {
      id: "critical",
      label: "High & Critical Risk",
      shortLabel: "High Risk",
      title: "Areas currently under High or Critical weather risk",
      badgeCount: filterCounts.critical,
      activeClasses: "bg-[#241418] text-rose-300 font-semibold border-rose-500/40 shadow-sm",
    },
    {
      id: "flash_flood",
      label: "Flood Risk (≥70%)",
      shortLabel: "Flood Risk",
      title: "Areas with high flash flood risk (≥70% chance)",
      badgeCount: filterCounts.flash_flood,
      activeClasses: "bg-[#1C1F30] text-indigo-300 font-semibold border-indigo-500/40 shadow-sm",
    },
    {
      id: "steep_gorges",
      label: "Steep Slopes (≥35°)",
      shortLabel: "Steep Slopes",
      title: "Steep mountain terrain where water runs off fast",
      badgeCount: filterCounts.steep_gorges,
      activeClasses: "bg-[#241F12] text-amber-300 font-semibold border-amber-500/40 shadow-sm",
    },
    {
      id: "foothills",
      label: "Lower Valleys (<800m)",
      shortLabel: "Valleys",
      title: "Lower foothill valleys below 800m elevation",
      badgeCount: filterCounts.foothills,
      activeClasses: "bg-[#11221A] text-emerald-300 font-semibold border-emerald-500/40 shadow-sm",
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Weather Risk Filters"
      className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-[#2B3142] bg-[#121520]/95 px-2 py-1 text-xs font-sans shadow-md backdrop-blur-md select-none max-w-full overflow-x-auto scrollbar-none"
    >
      <span className="text-slate-400 font-medium pr-1 text-[11px] hidden md:flex items-center gap-1 shrink-0">
        <Filter className="h-3 w-3 text-indigo-400" />
        <span className="hidden lg:inline">Filter:</span>
      </span>

      {filterOptions.map((opt) => {
        const isActive = filterMode === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => setFilterMode(opt.id)}
            title={opt.title}
            className={`rounded-md px-2 sm:px-2.5 py-1 transition-colors duration-150 flex items-center gap-1 sm:gap-1.5 border text-xs shrink-0 ${
              isActive
                ? `${opt.activeClasses}`
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#181C28] font-normal"
            }`}
          >
            <span className="hidden 2xl:inline">{opt.label}</span>
            <span className="2xl:hidden">{opt.shortLabel}</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-mono font-medium ${
                isActive ? "bg-black/40 text-white" : "bg-[#161A26] text-slate-400"
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
