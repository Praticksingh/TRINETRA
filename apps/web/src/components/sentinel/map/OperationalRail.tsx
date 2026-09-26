"use client";

import React, { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, Layers } from "lucide-react";
import { useSentinel } from "@/context/SentinelContext";
import { Badge } from "@/components/sentinel/Badge";

interface OperationalRailProps {
  activeLayerCount: number;
  onOpenLayers: () => void;
}

/** A compact, decision-first floating control that leaves the map unobstructed. */
export const OperationalRail: React.FC<OperationalRailProps> = ({ activeLayerCount, onOpenLayers }) => {
  const { alerts, cells, setSelectedCell } = useSentinel();
  // Default to collapsed so the map canvas dominates the view! (Rule 10)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const activeAlerts = useMemo(
    () => alerts
      .filter((alert) => alert.status !== "RESOLVED" && alert.status !== "REVOKED")
      .sort((a, b) => {
        const order = { critical: 0, warning: 1, watch: 2, low: 3 } as Record<string, number>;
        return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
      })
      .slice(0, 3),
    [alerts]
  );

  const criticalSectors = cells.filter((cell) => cell.severity === "critical" || cell.severity === "warning").length;

  if (isCollapsed) {
    return (
      <aside
        aria-label="Map controls floating bar"
        className="absolute top-3 left-3 z-20 hidden lg:flex items-center gap-2 rounded-lg border border-[#2B3142] bg-[#121520]/95 px-3 py-1.5 shadow-md backdrop-blur-md select-none"
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-white transition"
        >
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Active Alerts</span>
          <span className="rounded bg-rose-950/80 px-1.5 py-0.2 text-[10px] font-semibold text-rose-300 border border-rose-500/40 font-mono">
            {activeAlerts.length}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </button>

        <span className="h-3.5 w-px bg-[#2B3142]" />

        <button
          onClick={onOpenLayers}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <Layers className="h-3.5 w-3.5 text-indigo-400" />
          <span>Layers ({activeLayerCount})</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Active weather alerts queue"
      className="absolute top-3 bottom-24 left-3 z-20 hidden w-72 flex-col overflow-hidden rounded-xl border border-[#2B3142] bg-[#121520]/95 shadow-xl backdrop-blur-md lg:flex animate-in fade-in slide-in-from-left-2 duration-150"
    >
      <div className="border-b border-[#1E2330] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium text-indigo-400">Weather Alerts</p>
            <h2 className="text-sm font-semibold text-white">Active Hazards</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 min-w-5 items-center justify-center rounded border border-rose-500/40 bg-rose-950/80 px-1.5 text-[10px] font-bold text-rose-300">
              {activeAlerts.length}
            </span>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-[#181C28] transition"
              title="Collapse Alerts Panel"
              aria-label="Collapse Alerts Panel"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          {criticalSectors} areas currently have high-risk weather.
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-2.5">
        {activeAlerts.map((alert) => (
          <button
            key={alert.id}
            onClick={() => {
              const cell = cells.find((item) => item.cellId === alert.affectedCells[0]);
              if (cell) setSelectedCell(cell);
            }}
            className="group w-full rounded-lg border border-[#222736] bg-[#141722] p-2.5 text-left transition hover:border-indigo-400/40 hover:bg-[#181C28] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400"
          >
            <div className="flex items-center justify-between gap-2">
              <Badge severity={alert.severity} size="xs" />
              <span className="font-mono text-[10px] text-slate-400">
                {alert.validFrom ? `${alert.validFrom.slice(11, 16)} UTC` : "Active"}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-white">
              {alert.headline}
            </p>
            <p className="text-[11px] text-slate-400">{alert.regionName}</p>
          </button>
        ))}
      </div>

      <div className="border-t border-[#1E2330] p-2 bg-[#0E1017]">
        <button
          onClick={onOpenLayers}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[#2B3142] bg-[#141722] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#181C28] hover:text-white transition"
        >
          <Layers className="h-3.5 w-3.5 text-indigo-400" />
          <span>Toggle Weather Layers ({activeLayerCount})</span>
        </button>
      </div>
    </aside>
  );
};
