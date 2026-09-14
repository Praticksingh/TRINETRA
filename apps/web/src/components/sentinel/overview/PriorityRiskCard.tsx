"use client";

import React, { useState } from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { Button } from "@/components/sentinel/Button";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import {
  AlertTriangle,
  Flame,
  ArrowRight,
  Download,
  FileCode,
  ShieldAlert,
  Mountain,
  Droplets,
  ExternalLink,
} from "lucide-react";

export const PriorityRiskCard: React.FC = () => {
  const { alerts, setSelectedCell, setCurrentView } = useSentinel();
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Highest priority alert & corresponding cell
  const priorityAlert = alerts.find((a) => a.severity === "critical") || alerts[0];
  const matchedCell = GRID_CELLS.find((c) => priorityAlert.affectedCells.includes(c.cellId)) || GRID_CELLS[2];

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
    <Card variant="elevated" borderAccent="critical" className="relative">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge severity="critical">
            HIGHEST RISK AREA
          </Badge>
          <span className="font-mono text-xs text-slate-400">
            Cell #{matchedCell.cellId} • [{matchedCell.coordinates[0].toFixed(3)}°E, {matchedCell.coordinates[1].toFixed(3)}°N]
          </span>
        </div>

        {/* Mandatory Safety Notice */}
        <span className="rounded bg-amber-950/70 px-2 py-0.5 text-[10px] font-sans font-bold text-amber-300 border border-amber-800/60">
          MODEL ADVISORY (NOT OFFICIAL WARNING)
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-bold text-slate-100 font-sans">
              {priorityAlert.headline}
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {priorityAlert.description}
            </p>
          </div>

          {/* Probability & Surge Score Callout */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-3 shrink-0">
            <div className="text-[10px] font-sans text-slate-400 uppercase tracking-wider">Surge Risk</div>
            <div className="text-2xl font-bold font-mono text-red-400">
              {Math.round(matchedCell.probabilities.flashFlood * 100)}%
            </div>
            <div className="text-[10px] font-sans text-red-300 font-medium flex items-center gap-1">
              <Flame className="h-3 w-3" />
              <span>Extreme Cirque Runoff</span>
            </div>
          </div>
        </div>

        {/* Dual-Factor Decomposition Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1F3350]/80 text-xs font-sans">
          <div className="rounded border border-[#1F3350] bg-[#0F1A2A]/80 p-2.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 text-sky-300 font-medium">
                <Droplets className="h-3.5 w-3.5 text-sky-400" />
                Atmospheric Severity <span className="text-[10px] font-mono text-slate-500">(P_meteo)</span>
              </span>
              <span className="font-bold text-sky-300 font-mono">{Math.round(pMeteo * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full"
                style={{ width: `${Math.round(pMeteo * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-sans">
              Cloudburst potential: {Math.round(matchedCell.probabilities.cloudburst * 100)}% • Updraft: 120 mm/h
            </div>
          </div>

          <div className="rounded border border-[#1F3350] bg-[#0F1A2A]/80 p-2.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <Mountain className="h-3.5 w-3.5 text-amber-400" />
                Terrain Vulnerability <span className="text-[10px] font-mono text-slate-500">(S_terrain)</span>
              </span>
              <span className="font-bold text-amber-400 font-mono">{Math.round(sTerrain * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${Math.round(sTerrain * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-sans">
              Slope: {matchedCell.terrain.slopeDeg.toFixed(1)}° • Elevation: {matchedCell.terrain.elevationM}m MSL
            </div>
          </div>
        </div>

        {/* Dual-Factor Physics Clarification */}
        <div className="rounded border border-[#1F3350]/60 bg-[#080E1A]/80 p-2.5 text-[11px] text-slate-400 font-sans leading-relaxed">
          <span className="font-semibold text-slate-300">Dual-Factor Risk Architecture: </span>
          Severe convective flash-flood risk combines dynamic atmospheric rainfall forcing (<span className="font-mono text-slate-300">P_meteo</span>) with static catchment terrain vulnerability (<span className="font-mono text-slate-300">S_terrain</span>). Orographic slope accelerates runoff drainage but does not trigger convection independently.
        </div>
      </CardContent>

      <CardFooter className="flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            onClick={() => {
              setSelectedCell(matchedCell);
              setCurrentView("map");
            }}
          >
            View on Weather Map
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentView("alerts")}
          >
            View in Alerts
          </Button>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5" />}
            onClick={handleExportCap}
          >
            Export CAP XML
          </Button>

          {downloadNotice && (
            <span className="text-emerald-400 font-mono text-[10px] animate-fade-in">
              ✓ {downloadNotice}
            </span>
          )}
        </div>

        <div className="text-[10px] font-mono text-[#91A5BB]">
          Lifecycle Status: <strong className="text-amber-400">{priorityAlert.status || "UNDER_REVIEW"}</strong>
        </div>
      </CardFooter>
    </Card>
  );
};
