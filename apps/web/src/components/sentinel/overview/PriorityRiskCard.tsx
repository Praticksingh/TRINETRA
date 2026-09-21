"use client";

import React, { useState } from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { Button } from "@/components/sentinel/Button";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import {
  AlertTriangle,
  Flame,
  ArrowRight,
  Download,
  Mountain,
  Droplets,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  ShieldAlert,
} from "lucide-react";

export const PriorityRiskCard: React.FC = () => {
  const { alerts, cells, setSelectedCell, setCurrentView } = useSentinel();
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [showPhysicsDetails, setShowPhysicsDetails] = useState<boolean>(false);

  // Highest priority alert & corresponding cell
  const priorityAlert = alerts.find((a) => a.severity === "critical") || alerts[0];
  const matchedCell =
    cells.find((c) => priorityAlert?.affectedCells?.includes(c.cellId)) ||
    cells[0] ||
    GRID_CELLS[2];

  // Dual-factor values
  const pMeteo = Math.min(
    1.0,
    matchedCell.probabilities.cloudburst * 0.75 + matchedCell.probabilities.thunderstorm * 0.25
  );
  const sTerrain = Math.min(
    1.0,
    (matchedCell.terrain.slopeDeg / 40.0) * 0.55 + ((matchedCell.terrain.twi - 2.0) / 12.0) * 0.45
  );

  const handleExportCap = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${priorityAlert.id}</identifier>
  <sender>trinetra-nowcast@sdma.uk.gov.in</sender>
  <sent>${priorityAlert.issuedAt}</sent>
  <status>Test</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <note>TRINETRA Model Advisory. Not an official government decree.</note>
  <info>
    <category>Met</category>
    <event>${priorityAlert.hazardType.replace("_", " ").toUpperCase()}</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Likely</certainty>
    <headline>${priorityAlert.headline}</headline>
    <description>${priorityAlert.description}</description>
    <area>
      <areaDesc>${priorityAlert.regionName}</areaDesc>
    </area>
  </info>
</alert>`;

    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${priorityAlert.id}_CAP.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadNotice("CAP v1.2 XML downloaded");
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="relative rounded-3xl border border-rose-500/30 bg-gradient-to-br from-[#1E1218] via-[#171822] to-[#12131A] p-5 sm:p-6 shadow-clay-card-elevated transition-all">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 rounded-full bg-[#241418] px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30 shadow-clay-badge">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            HIGHEST ACTIVE THREAT
          </span>

          <span className="flex items-center gap-1 text-xs text-zinc-400">
            <MapPin className="h-3.5 w-3.5 text-zinc-500" />
            <strong className="text-slate-200">{matchedCell.name}</strong> (Cell #{matchedCell.cellId})
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-300/90 font-mono">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            ~2h Lead Window
          </span>
        </div>

        <span className="rounded-full bg-[#241F12] px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30 shadow-clay-badge">
          MODEL ADVISORY (NON-OFFICIAL)
        </span>
      </div>

      {/* Main Threat Overview */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 8 Cols: Threat Text & Humanized Summary */}
        <div className="lg:col-span-8 space-y-2">
          <h2 className="text-lg sm:text-xl font-bold text-white font-sans tracking-tight">
            {priorityAlert.headline}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {priorityAlert.description}
          </p>

          {/* Dual-Factor Human Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            {/* Atmospheric Rain Intensity */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/90 p-3.5 shadow-clay-btn">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-medium text-indigo-300">
                  <Droplets className="h-3.5 w-3.5 text-indigo-400" />
                  Atmospheric Rain Intensity
                </span>
                <span className="font-mono font-bold text-indigo-300">{Math.round(pMeteo * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-[#111217] rounded-full shadow-clay-inset overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.round(pMeteo * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5">
                Extreme convective updrafts & cloud top cooling rates (-18.5 K/hr).
              </p>
            </div>

            {/* Slope Runoff Risk */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/90 p-3.5 shadow-clay-btn">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-medium text-amber-300">
                  <Mountain className="h-3.5 w-3.5 text-amber-400" />
                  Catchment Slope Vulnerability
                </span>
                <span className="font-mono font-bold text-amber-400">{Math.round(sTerrain * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-[#111217] rounded-full shadow-clay-inset overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.round(sTerrain * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5">
                Slope {matchedCell.terrain.slopeDeg.toFixed(1)}° accelerates runoff drainage toward valley floor.
              </p>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Quick Metric Badge & Actions */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#1D202B]/90 p-4 space-y-4 shadow-clay-btn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Flash Flood Probability
            </span>
            <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              Critical
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-400">
            {Math.round(matchedCell.probabilities.flashFlood * 100)}%
          </div>

          <div className="text-[11px] text-zinc-400">
            Status: <strong className="text-amber-300 font-mono">{priorityAlert.status || "UNDER_REVIEW"}</strong>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              onClick={() => {
                setSelectedCell(matchedCell);
                setCurrentView("map");
              }}
            >
              View on Weather Map
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => setCurrentView("alerts")}
              >
                Review Alerts
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-center border border-white/[0.08] hover:bg-[#252937]"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                onClick={handleExportCap}
              >
                CAP XML
              </Button>
            </div>

            {downloadNotice && (
              <span className="text-center text-emerald-400 font-mono text-[10px] animate-fade-in">
                ✓ {downloadNotice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progressive Disclosure: Deep Atmospheric Physics & Equations */}
      <div className="mt-4 pt-3 border-t border-white/[0.08]">
        <button
          onClick={() => setShowPhysicsDetails(!showPhysicsDetails)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
        >
          <span>{showPhysicsDetails ? "Hide Physical Formulations" : "Show Physical Formulations & Coordinates"}</span>
          {showPhysicsDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showPhysicsDetails && (
          <div className="mt-3 rounded-2xl border border-white/[0.08] bg-[#0A0F1B]/95 p-4 text-xs text-slate-300 space-y-2 shadow-clay-inset animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
              <span className="font-semibold text-slate-200">
                Dual-Factor Risk Model Formulation
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Coords: [{matchedCell.coordinates[0].toFixed(3)}°E, {matchedCell.coordinates[1].toFixed(3)}°N] • Elevation: {matchedCell.terrain.elevationM}m MSL
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Flash flood risk combines dynamic atmospheric rainfall forcing (<code className="text-sky-300">P_meteo</code>) with static catchment terrain vulnerability (<code className="text-amber-300">S_terrain</code>). Steep orographic slopes accelerate runoff drainage into valley basins but do not independently trigger convective rainfall without convective available potential energy (CAPE) and negative vertical velocity (&omega;).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
