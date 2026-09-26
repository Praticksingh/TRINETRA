"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Mountain,
  Droplets,
  Info,
  Layers,
  Activity,
  ShieldCheck,
  Compass,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/sentinel/Badge";
import { SelectedCellData } from "@/app/forecast/RiskPanel";
import { TermHelp } from "@/components/sentinel/Tooltip";

export interface RiskInspectorProps {
  cellData: SelectedCellData | null;
  onClose: () => void;
  className?: string;
}

type InspectorTab = "threat" | "atmospheric" | "action";

export const RiskInspector: React.FC<RiskInspectorProps> = ({
  cellData,
  onClose,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>("threat");

  if (!cellData) return null;

  // Dual-factor independent calculation
  const pMeteo = Math.min(
    1.0,
    cellData.probabilities.cloudburst * 0.75 + cellData.probabilities.thunderstorm * 0.25
  );
  const sTerrain = Math.min(
    1.0,
    (cellData.terrain.slopeDeg / 40.0) * 0.55 + ((cellData.terrain.twi - 2.0) / 12.0) * 0.45
  );

  const dominantDriver =
    pMeteo > sTerrain + 0.2
      ? "METEOROLOGY_DRIVEN"
      : sTerrain > pMeteo + 0.2
      ? "TERRAIN_AMPLIFIED"
      : "COMPOUND_SURGE";

  return (
    <div
      role="region"
      aria-label={`Weather Risk Details for ${cellData.name}`}
      className={`rounded-xl border border-[#2B3142] bg-[#121520] text-slate-200 shadow-xl overflow-hidden flex flex-col ${className}`}
    >
      {/* 1. Header: Location Context & 6-Hour Mini Timeline */}
      <div className="border-b border-[#1E2330] bg-[#0E1017] px-4 py-3 font-sans space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge severity={cellData.severity} size="xs" />
            <span className="text-[10px] font-medium text-slate-400">
              Uttarakhand, India
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-[#181C28] transition min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Close location inspector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            {cellData.name}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span>Elevation: {cellData.terrain.elevationM}m</span>
            <span>•</span>
            <span>Slope: {cellData.terrain.slopeDeg.toFixed(0)}°</span>
            <span>•</span>
            <span className="font-mono text-slate-500">[{cellData.coordinates[0].toFixed(2)}°E, {cellData.coordinates[1].toFixed(2)}°N]</span>
          </div>
        </div>

        {/* 6-Hour Mini Forecast Timeline (Section 13) */}
        <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-[#141722] border border-[#232736] overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-medium shrink-0">Next 6h:</span>
          <div className="flex items-center gap-3 shrink-0 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-slate-300"><span>12:00</span> <span>🌧</span></span>
            <span className="flex items-center gap-1 text-slate-300"><span>13:00</span> <span>🌧</span></span>
            <span className="flex items-center gap-1 text-rose-300 font-semibold"><span>14:00</span> <span>⛈</span></span>
            <span className="flex items-center gap-1 text-rose-300 font-semibold"><span>15:00</span> <span>⛈</span></span>
            <span className="flex items-center gap-1 text-amber-300"><span>16:00</span> <span>🌧</span></span>
            <span className="flex items-center gap-1 text-slate-400"><span>17:00</span> <span>⛅</span></span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#141722] border border-[#232736]">
          <button
            onClick={() => setActiveTab("threat")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "threat"
                ? "bg-[#1C2130] text-indigo-300 border border-indigo-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("atmospheric")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "atmospheric"
                ? "bg-[#1C2130] text-indigo-300 border border-indigo-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wind className="h-3 w-3" />
            <span>Atmosphere</span>
          </button>

          <button
            onClick={() => setActiveTab("action")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "action"
                ? "bg-[#1C2130] text-indigo-300 border border-indigo-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3 w-3" />
            <span>Actions</span>
          </button>
        </div>
      </div>

      {/* 2. Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-sans">
        {/* ================= TAB 1: THREAT & TERRAIN ================= */}
        {activeTab === "threat" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* 3-Metric Summary Bar */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-[#232736] bg-[#141722] p-2">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <span>Rain Factor</span>
                  <TermHelp term="ATMOSPHERIC_FORCING" />
                </div>
                <div className="text-sm font-semibold font-mono text-indigo-300 mt-0.5">
                  {Math.round(pMeteo * 100)}%
                </div>
              </div>

              <div className="rounded-lg border border-[#232736] bg-[#141722] p-2">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <span>Terrain Factor</span>
                  <TermHelp term="TERRAIN_SUSCEPTIBILITY" />
                </div>
                <div className="text-sm font-semibold font-mono text-amber-300 mt-0.5">
                  {Math.round(sTerrain * 100)}%
                </div>
              </div>

              <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-2">
                <div className="text-[10px] text-rose-300 flex items-center justify-center gap-1">
                  <span>Flood Risk</span>
                  <TermHelp term="FLASH_FLOOD" />
                </div>
                <div className="text-sm font-bold font-mono text-rose-300 mt-0.5">
                  {Math.round(cellData.probabilities.flashFlood * 100)}%
                </div>
              </div>
            </div>

            {/* Explanation Narrative */}
            <div className="rounded-lg border border-[#232736] bg-[#141722] p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <Activity className="h-3.5 w-3.5" />
                  Situation Summary
                </span>
                <span className="text-[10px] text-slate-400">
                  {dominantDriver === "TERRAIN_AMPLIFIED" && "Steep terrain runoff"}
                  {dominantDriver === "METEOROLOGY_DRIVEN" && "Heavy localized rainfall"}
                  {dominantDriver === "COMPOUND_SURGE" && "Compound rain & terrain"}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed text-[11px]">
                {dominantDriver === "TERRAIN_AMPLIFIED" && (
                  <>Steep mountain slopes ({cellData.terrain.slopeDeg.toFixed(1)}°) direct rainfall rapidly into valley streams. Water can collect at valley bottoms in under 45 minutes.</>
                )}
                {dominantDriver === "METEOROLOGY_DRIVEN" && (
                  <>Intense thunderstorm cloud development is producing heavy rainfall ({Math.round(cellData.probabilities.cloudburst * 100)}% probability) that exceeds the mountain's natural drainage capacity.</>
                )}
                {dominantDriver === "COMPOUND_SURGE" && (
                  <>Severe localized storm activity over steep terrain with low absorption capacity. Elevated risk of rapid water surge in narrow river corridors.</>
                )}
              </p>
            </div>

            {/* Catchment Topography */}
            <div className="rounded-lg border border-[#232736] bg-[#141722] p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-200 font-medium text-xs">
                <Compass className="h-3.5 w-3.5 text-indigo-400" />
                <span>Terrain & Watershed Profile</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded bg-[#0E1017] p-2 border border-[#1E2330]">
                  <div className="text-[10px] text-slate-400">Slope Steepness</div>
                  <div className="text-xs font-semibold text-slate-200 font-mono mt-0.5">
                    {cellData.terrain.slopeDeg.toFixed(1)}°
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {cellData.terrain.slopeDeg > 35 ? "Steep gorge" : "Valley basin"}
                  </div>
                </div>

                <div className="rounded bg-[#0E1017] p-2 border border-[#1E2330]">
                  <div className="text-[10px] text-slate-400">Drainage (TWI)</div>
                  <div className="text-xs font-semibold text-slate-200 font-mono mt-0.5">
                    {cellData.terrain.twi.toFixed(1)}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Water accumulation</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ATMOSPHERIC & RADAR ================= */}
        {activeTab === "atmospheric" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="rounded-lg border border-[#232736] bg-[#141722] p-3 space-y-2">
              <div className="flex items-center justify-between text-slate-200 font-medium text-xs">
                <span className="flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Atmospheric Energy</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Sounding</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded bg-[#0E1017] p-2 border border-[#1E2330]">
                  <div className="text-[10px] text-slate-400">Atmospheric Moisture</div>
                  <div className="text-xs font-semibold text-indigo-300 font-mono mt-0.5">
                    {(cellData.xaiAttribution.find(a => a.feature === 'tpw')?.observedValue || 58.2).toFixed(1)} mm
                  </div>
                </div>

                <div className="rounded bg-[#0E1017] p-2 border border-[#1E2330]">
                  <div className="text-[10px] text-slate-400">Cloud Top Cooling</div>
                  <div className="text-xs font-semibold text-rose-300 font-mono mt-0.5">
                    {(cellData.xaiAttribution.find(a => a.feature === 'cooling')?.observedValue || -18.5).toFixed(1)} K/hr
                  </div>
                </div>

                <div className="rounded bg-[#0E1017] p-2 border border-[#1E2330]">
                  <div className="text-[10px] text-slate-400">Instability (CAPE)</div>
                  <div className="text-xs font-semibold text-amber-300 font-mono mt-0.5">
                    {Math.round(cellData.xaiAttribution.find(a => a.feature === 'cape')?.observedValue || 3150)} J/kg
                  </div>
                </div>

                <div className="rounded bg-[#0E1017] p-2 border border-[#1E2330]">
                  <div className="text-[10px] text-slate-400">Wind Shear</div>
                  <div className="text-xs font-semibold text-purple-300 font-mono mt-0.5">
                    18.4 m/s
                  </div>
                </div>
              </div>
            </div>

            {/* AI Attribution List */}
            <div className="rounded-lg border border-[#232736] bg-[#141722] p-3 space-y-2">
              <div className="text-xs font-medium text-slate-200 flex items-center justify-between">
                <span>Key Predictive Factors</span>
                <span className="text-[10px] text-slate-400">Influence</span>
              </div>

              <div className="space-y-2">
                {cellData.xaiAttribution.map((factor, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{factor.label}</span>
                      <span className="text-indigo-400 font-mono font-medium">
                        +{Math.round(factor.contribution * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0E1017] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.round(factor.contribution * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ACTION & RECOMMENDATIONS ================= */}
        {activeTab === "action" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="rounded-lg border border-[#232736] bg-[#141722] p-3 space-y-2">
              <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Recommended Safety Steps</span>
              </div>

              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="p-2 rounded bg-[#0E1017] border border-[#1E2330]">
                  <strong className="text-white">Riverbank Awareness:</strong> Advise communities and travelers near low-lying river channels to move to higher ground.
                </div>
                <div className="p-2 rounded bg-[#0E1017] border border-[#1E2330]">
                  <strong className="text-white">Rain Gauge Verification:</strong> Monitor upstream telemetry stations along the Mandakini and Alaknanda corridors.
                </div>
                <div className="p-2 rounded bg-[#0E1017] border border-[#1E2330]">
                  <strong className="text-white">Emergency Readiness:</strong> Alert local SDRF / disaster management teams near downstream crossings.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-[#1E2330] flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            Updated every 15 minutes
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md border border-[#2B3142] bg-[#181C28] text-xs font-medium text-slate-300 hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
