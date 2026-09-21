"use client";

import React, { useState, useMemo } from "react";
import { AlertTriangle, ChevronRight, ChevronLeft, ChevronDown, Layers, ShieldAlert, X } from "lucide-react";
import { useSentinel } from "@/context/SentinelContext";
import { Badge } from "@/components/sentinel/Badge";

interface OperationalRailProps {
  activeLayerCount: number;
  onOpenLayers: () => void;
}

/** A compact, decision-first queue that leaves the tactical map unobstructed. */
export const OperationalRail: React.FC<OperationalRailProps> = ({ activeLayerCount, onOpenLayers }) => {
  const { alerts, cells, setCurrentView, setSelectedCell } = useSentinel();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

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
        aria-label="Operational incident queue collapsed"
        className="absolute top-4 left-4 z-20 hidden lg:flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#161820]/95 px-3 py-1.5 shadow-clay-card backdrop-blur-xl select-none"
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-indigo-300 transition"
        >
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Incident Queue</span>
          <span className="rounded-full bg-[#241418] px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40 font-mono shadow-clay-badge">
            {activeAlerts.length}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </button>

        <span className="h-3.5 w-px bg-white/[0.08]" />

        <button
          onClick={onOpenLayers}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-indigo-300 transition"
        >
          <Layers className="h-3.5 w-3.5 text-indigo-400" />
          <span>Layers ({activeLayerCount})</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Operational incident queue"
      className="absolute top-16 bottom-24 left-4 z-20 hidden w-72 flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#161820]/95 shadow-clay-card-elevated backdrop-blur-xl lg:flex animate-in fade-in slide-in-from-left-2 duration-150"
    >
      <div className="border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Incident Queue</p>
            <h2 className="text-sm font-bold text-white">Needs Operator Review</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-rose-500/40 bg-[#241418] px-2 text-xs font-bold text-rose-300 shadow-clay-badge">
              {activeAlerts.length}
            </span>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-zinc-400 hover:text-slate-200 rounded-xl hover:bg-[#1D202B] transition shadow-clay-btn active:translate-y-0.5"
              title="Collapse Incident Queue"
              aria-label="Collapse Incident Queue"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-zinc-400">
          {criticalSectors} sectors currently at warning level or higher.
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-2.5 scrollbar-thin">
        {activeAlerts.map((alert) => (
          <button
            key={alert.id}
            onClick={() => {
              const cell = cells.find((item) => item.cellId === alert.affectedCells[0]);
              if (cell) setSelectedCell(cell);
            }}
            className="group w-full rounded-2xl border border-white/[0.06] bg-[#1D202B]/80 p-3 text-left transition hover:border-indigo-400/40 hover:bg-[#252937] shadow-clay-btn active:translate-y-0.5 active:shadow-clay-btn-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <div className="flex items-start justify-between gap-2">
              <Badge severity={alert.severity} size="xs">
                {alert.severity}
              </Badge>
              <span className="text-[10px] font-medium text-zinc-400 font-mono">
                {(alert.status ?? "GENERATED").replace("_", " ")}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-slate-100">
              {alert.regionName}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
              {alert.hazardType.replace("_", " ")} · starts {alert.validFrom.slice(11, 16)} UTC
            </p>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-sky-400 opacity-0 transition group-hover:opacity-100">
              Inspect area <ChevronRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/[0.08] p-2.5">
        <button
          onClick={onOpenLayers}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#1D202B] px-2 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white shadow-clay-btn active:translate-y-0.5 active:shadow-clay-btn-pressed"
        >
          <Layers className="h-3.5 w-3.5 text-indigo-400" />
          <span>Layers ({activeLayerCount})</span>
        </button>
        <button
          onClick={() => setCurrentView("alerts")}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-[#4F46E5] px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 shadow-clay-btn-primary active:translate-y-0.5 active:shadow-clay-btn-pressed"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Review All</span>
        </button>
      </div>
    </aside>
  );
};
