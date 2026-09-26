"use client";

import React, { useState } from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
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
  CloudLightning,
  Waves,
  Info,
} from "lucide-react";

export const OverviewStoryCard: React.FC = () => {
  const { alerts, cells, setSelectedCell, setCurrentView } = useSentinel();
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Highest priority alert & cell
  const priorityAlert = alerts.find((a) => a.severity === "critical") || alerts[0];
  const matchedCell =
    cells.find((c) => priorityAlert?.affectedCells?.includes(c.cellId)) ||
    cells[0] ||
    GRID_CELLS[2];

  // Mathematical factors
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
  <note>TRINETRA Model Advisory. Meteorological Early Warning.</note>
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

    setDownloadNotice("Alert XML downloaded");
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 1. CURRENT WEATHER STORY (Primary Human-Readable Layer) */}
      <Card variant="base" className="border-l-4 border-l-rose-500 bg-[#141724]">
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232736] pb-3">
            <div className="flex items-center gap-2">
              <Badge severity="critical" size="sm">
                Critical Hazard
              </Badge>
              <span className="flex items-center gap-1 text-xs text-slate-300 font-medium">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {matchedCell.name}, Uttarakhand
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Expected in 2–3 hours</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Heavy convection is developing over northern Uttarakhand
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-3xl">
              Several valley areas are showing elevated rainfall and thunderstorm potential during the next 2–4 hours. Intense rainfall over steep mountain terrain poses a critical risk of rapid water runoff and flash flooding.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-400">
                  {Math.round(matchedCell.probabilities.flashFlood * 100)}%
                </span>
                <span className="text-xs text-slate-400">flood risk</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="text-xs text-slate-300">
                Peak window: <strong className="text-white">Next 2–3 hours</strong>
              </div>
            </div>

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
                Inspect on map
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentView("alerts")}
              >
                View alerts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. KEY HAZARDS (3 Scannable Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Hazard 1: Flash Flood */}
        <Card variant="base" className="bg-[#121520] border-[#222736]">
          <CardHeader className="py-2.5">
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-rose-400" />
              <CardTitle className="text-xs">Flash flood risk</CardTitle>
            </div>
            <Badge severity="critical" size="xs">Critical</Badge>
          </CardHeader>
          <CardContent className="py-3">
            <div className="text-sm font-semibold text-slate-100">
              High runoff potential
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Water collects rapidly in steep gorges ({matchedCell.terrain.slopeDeg.toFixed(0)}° slope). High risk of valley inundation.
            </p>
            <div className="text-[11px] text-rose-300 font-mono mt-2">
              {Math.round(matchedCell.probabilities.flashFlood * 100)}% estimated probability
            </div>
          </CardContent>
        </Card>

        {/* Hazard 2: Severe Thunderstorm */}
        <Card variant="base" className="bg-[#121520] border-[#222736]">
          <CardHeader className="py-2.5">
            <div className="flex items-center gap-2">
              <CloudLightning className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-xs">Thunderstorm activity</CardTitle>
            </div>
            <Badge severity="warning" size="xs">Warning</Badge>
          </CardHeader>
          <CardContent className="py-3">
            <div className="text-sm font-semibold text-slate-100">
              Active convective cells
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Strong vertical cloud growth detected by satellite. Frequent lightning and heavy wind gusts expected.
            </p>
            <div className="text-[11px] text-amber-300 font-mono mt-2">
              {Math.round(matchedCell.probabilities.thunderstorm * 100)}% estimated probability
            </div>
          </CardContent>
        </Card>

        {/* Hazard 3: Extreme Rainfall */}
        <Card variant="base" className="bg-[#121520] border-[#222736]">
          <CardHeader className="py-2.5">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-xs">Extreme rainfall</CardTitle>
            </div>
            <Badge severity="warning" size="xs">Elevated</Badge>
          </CardHeader>
          <CardContent className="py-3">
            <div className="text-sm font-semibold text-slate-100">
              Cloudburst potential
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sudden concentrated bursts (&gt; 35 mm/h) possible over isolated mountain slopes.
            </p>
            <div className="text-[11px] text-indigo-300 font-mono mt-2">
              {Math.round(matchedCell.probabilities.cloudburst * 100)}% estimated probability
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. WHY THIS MATTERS & PROGRESSIVE DISCLOSURE */}
      <Card variant="subtle" className="bg-[#0F121C] border-[#1E2332]">
        <CardContent className="p-4 space-y-3">
          <div>
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              <span>Why this matters</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              When heavy moisture reaches steep mountain terrain, the air is forced upward, causing intense localized clouds to dump large volumes of water quickly. In narrow Himalayan river valleys, there is very little soil absorption, meaning runoff rushes into streams within 30 to 45 minutes.
            </p>
          </div>

          {/* Collapsible Scientific & Technical Details */}
          <div className="border-t border-[#1E2332] pt-2.5">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <span>{showTechnicalDetails ? "Hide technical evidence" : "Show atmospheric evidence & model details"}</span>
              {showTechnicalDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 rounded-lg border border-[#232736] bg-[#141722] p-3 text-xs text-slate-300 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2330] pb-2 text-[11px]">
                  <span className="font-semibold text-slate-200">
                    Scientific Data & Atmospheric Variables
                  </span>
                  <span className="font-mono text-slate-400">
                    Location: [{matchedCell.coordinates[0].toFixed(3)}°E, {matchedCell.coordinates[1].toFixed(3)}°N] • Elevation: {matchedCell.terrain.elevationM}m
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-[#0E1017] p-2 rounded border border-[#1E2330]">
                    <div className="text-[10px] text-slate-400">Atmospheric Instability</div>
                    <div className="text-xs font-mono font-medium text-slate-200 mt-0.5">3,150 J/kg</div>
                    <div className="text-[9px] text-slate-500">CAPE Index</div>
                  </div>
                  <div className="bg-[#0E1017] p-2 rounded border border-[#1E2330]">
                    <div className="text-[10px] text-slate-400">Water Accumulation</div>
                    <div className="text-xs font-mono font-medium text-slate-200 mt-0.5">14.8</div>
                    <div className="text-[9px] text-slate-500">TWI Index</div>
                  </div>
                  <div className="bg-[#0E1017] p-2 rounded border border-[#1E2330]">
                    <div className="text-[10px] text-slate-400">Valley Slope</div>
                    <div className="text-xs font-mono font-medium text-slate-200 mt-0.5">{matchedCell.terrain.slopeDeg.toFixed(1)}°</div>
                    <div className="text-[9px] text-slate-500">Steep Topography</div>
                  </div>
                  <div className="bg-[#0E1017] p-2 rounded border border-[#1E2330]">
                    <div className="text-[10px] text-slate-400">Cloud Top Cooling</div>
                    <div className="text-xs font-mono font-medium text-slate-200 mt-0.5">-21.4 K/hr</div>
                    <div className="text-[9px] text-slate-500">Rapid Convection</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#1E2330]">
                  <span className="text-[11px] text-slate-400">
                    Calculated: Weather Factor ({Math.round(pMeteo * 100)}%) + Terrain Factor ({Math.round(sTerrain * 100)}%)
                  </span>
                  <button
                    onClick={handleExportCap}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download CAP XML</span>
                  </button>
                </div>

                {downloadNotice && (
                  <div className="text-center text-emerald-400 font-mono text-[10px]">
                    ✓ {downloadNotice}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
