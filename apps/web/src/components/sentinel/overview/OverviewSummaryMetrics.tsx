"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { StatusDot } from "@/components/sentinel/StatusDot";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { Flame, Clock, Bell, Wifi, ArrowUpRight } from "lucide-react";

export const OverviewSummaryMetrics: React.FC = () => {
  const { alerts, cells, horizonMinutes, setHorizonMinutes, baseTimestampUtc, setCurrentView, setSelectedCell } = useSentinel();

  // Find the highest severity cell from dynamic cells
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {/* 1. Highest Modeled Risk */}
      <Card
        variant="interactive"
        borderAccent="critical"
        onClick={() => {
          setSelectedCell(highestCell);
          setCurrentView("map");
        }}
        title="Click to inspect this location on the Weather Map"
      >
        <CardHeader>
          <CardTitle className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between w-full">
            <span>Highest Modeled Risk</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge severity="critical">
              HIGHEST RISK
            </Badge>
            <span className="font-mono text-sm font-bold text-rose-400">
              {Math.round(highestCell.probabilities.flashFlood * 100)}%
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-100 mt-2 truncate">
            {highestCell.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Cell #{highestCell.cellId} • Extreme Valley Runoff
          </div>
        </CardContent>
      </Card>

      {/* 2. Active Model Advisories */}
      <Card
        variant="interactive"
        onClick={() => setCurrentView("alerts")}
        title="Click to open Alerts queue"
      >
        <CardHeader>
          <CardTitle className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between w-full">
            <span>Active Advisories</span>
            <Bell className="h-3.5 w-3.5 text-sky-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {alerts.length}
            </span>
            <span className="text-xs text-slate-400">Total Active</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] mt-2">
            <span className="text-rose-400 font-medium">{criticalCount} Critical</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-medium">{warningCount} Warning</span>
            <span className="text-slate-600">•</span>
            <span className="text-yellow-400 font-medium">{watchCount} Watch</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            SEOC Incident Queue
          </div>
        </CardContent>
      </Card>

      {/* 3. Forecast Lead Window */}
      <Card
        variant="interactive"
        onClick={() => setCurrentView("timeline")}
        title="Click to open Forecast timeline"
      >
        <CardHeader>
          <CardTitle className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between w-full">
            <span>Forecast Window</span>
            <Clock className="h-3.5 w-3.5 text-sky-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-sky-400">
              +{Math.floor(horizonMinutes / 60)}h {horizonMinutes % 60 ? `${horizonMinutes % 60}m` : "00m"}
            </span>
          </div>
          <div className="text-xs text-slate-300 mt-2">
            Valid at <strong className="text-white font-mono">{validTimeStr}</strong>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            High-Risk Convective Window
          </div>
        </CardContent>
      </Card>

      {/* 4. Data Freshness & Systems Status */}
      <Card variant="base">
        <CardHeader>
          <CardTitle className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between w-full">
            <span>Systems Status</span>
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <StatusDot status="nominal" label="Systems Normal" />
          </div>
          <div className="text-xs text-slate-300 mt-2">
            Satellite feed: <strong className="text-emerald-400 font-mono">12 min lag</strong>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Speed: 3.7 ms • 8 Catchment Stations Live
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
