"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { CloudRain, AlertTriangle, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export const OverviewSummaryMetrics: React.FC = () => {
  const { alerts, cells, horizonMinutes, baseTimestampUtc, setCurrentView, setSelectedCell } = useSentinel();

  // Find the highest severity cell
  const criticalCells = cells.filter((c) => c.severity === "critical");
  const highestCell = criticalCells[0] || cells.find((c) => c.severity === "warning") || cells[0] || GRID_CELLS[0];

  // Count active alerts by severity
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const watchCount = alerts.filter((a) => a.severity === "watch" || a.severity === "advisory").length;

  // Format valid time
  const baseDate = new Date(baseTimestampUtc);
  const validDate = new Date(baseDate.getTime() + horizonMinutes * 60000);
  const validTimeStr = validDate.toUTCString().slice(17, 22) + " UTC";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-sans">
      {/* 1. Current Weather Condition */}
      <Card
        variant="interactive"
        onClick={() => setCurrentView("map")}
        title="View current weather conditions on map"
      >
        <CardHeader>
          <CardTitle className="text-xs text-slate-400 font-medium flex items-center justify-between w-full">
            <span>Current conditions</span>
            <CloudRain className="h-3.5 w-3.5 text-indigo-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-base sm:text-lg font-semibold text-slate-100">
            Intense Rainfall
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Mandakini & Alaknanda
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Cloud top cooling: active convection
          </div>
        </CardContent>
      </Card>

      {/* 2. Highest Modeled Risk */}
      <Card
        variant="interactive"
        borderAccent="critical"
        onClick={() => {
          setSelectedCell(highestCell);
          setCurrentView("map");
        }}
        title="Inspect highest risk location"
      >
        <CardHeader>
          <CardTitle className="text-xs text-slate-400 font-medium flex items-center justify-between w-full">
            <span>Highest risk</span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge severity="critical" size="xs">Critical</Badge>
            <span className="font-mono text-sm font-semibold text-rose-300">
              {Math.round(highestCell.probabilities.flashFlood * 100)}% risk
            </span>
          </div>
          <div className="text-xs font-medium text-slate-200 mt-1 truncate">
            {highestCell.name}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Steep gorge runoff risk
          </div>
        </CardContent>
      </Card>

      {/* 3. Forecast Window */}
      <Card
        variant="interactive"
        onClick={() => setCurrentView("timeline")}
        title="Explore forecast timeline"
      >
        <CardHeader>
          <CardTitle className="text-xs text-slate-400 font-medium flex items-center justify-between w-full">
            <span>Forecast window</span>
            <Clock className="h-3.5 w-3.5 text-slate-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-base sm:text-lg font-semibold text-slate-100 font-mono">
            Next 2–3 hours
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Valid until {validTimeStr}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Updated every 15 minutes
          </div>
        </CardContent>
      </Card>

      {/* 4. Active Warnings */}
      <Card
        variant="interactive"
        onClick={() => setCurrentView("alerts")}
        title="View active alerts"
      >
        <CardHeader>
          <CardTitle className="text-xs text-slate-400 font-medium flex items-center justify-between w-full">
            <span>Active warnings</span>
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100">
              {alerts.length}
            </span>
            <span className="text-xs text-slate-400">issued</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] mt-1 text-slate-400">
            <span className="text-rose-400">{criticalCount} critical</span>
            <span>•</span>
            <span className="text-amber-400">{warningCount} warning</span>
            <span>•</span>
            <span className="text-yellow-400">{watchCount} watch</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
