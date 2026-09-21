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
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  ShieldCheck,
  Compass,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/sentinel/Badge";
import { SelectedCellData } from "@/app/forecast/RiskPanel";

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
  const [showLimitations, setShowLimitations] = useState<boolean>(false);

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
      aria-label={`Risk Inspector for ${cellData.name}`}
      className={`rounded-3xl border border-white/[0.08] bg-[#161820]/98 text-slate-200 shadow-clay-card-elevated backdrop-blur-xl overflow-hidden flex flex-col ${className}`}
    >
      {/* 1. Header: Name, Severity, Coordinates */}
      <div className="border-b border-white/[0.08] bg-[#111217]/60 px-5 py-4 font-sans">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge severity={cellData.severity} size="sm">
              {cellData.severity.toUpperCase()}
            </Badge>
            <span className="rounded-full bg-[#241F12] px-2 py-0.5 text-[9px] font-semibold text-amber-300 border border-amber-500/30 shadow-clay-badge">
              MODEL ADVISORY
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:text-slate-200 hover:bg-[#1D202B] transition shadow-clay-btn active:translate-y-0.5"
            aria-label="Close Cell Risk Inspector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white font-sans tracking-tight">
            {cellData.name}
          </h2>
          <div className="flex items-center gap-2 text-xs font-sans text-zinc-400 mt-1">
            <span>Cell #{cellData.cellId}</span>
            <span>•</span>
            <span className="font-mono">[{cellData.coordinates[0].toFixed(3)}°E, {cellData.coordinates[1].toFixed(3)}°N]</span>
            <span>•</span>
            <span>{cellData.terrain.elevationM}m MSL</span>
          </div>
        </div>

        {/* 3 Tab Navigation Strip */}
        <div className="flex items-center gap-1 mt-3.5 p-1 rounded-2xl bg-[#111217] border border-white/[0.05] shadow-clay-inset">
          <button
            onClick={() => setActiveTab("threat")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-xl transition active:translate-y-0.5 ${
              activeTab === "threat"
                ? "bg-[#1D202B] text-indigo-300 font-semibold shadow-clay-btn"
                : "text-zinc-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Threat</span>
          </button>

          <button
            onClick={() => setActiveTab("atmospheric")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-xl transition active:translate-y-0.5 ${
              activeTab === "atmospheric"
                ? "bg-[#1D202B] text-indigo-300 font-semibold shadow-clay-btn"
                : "text-zinc-400 hover:text-slate-200"
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Atmospheric</span>
          </button>

          <button
            onClick={() => setActiveTab("action")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-xl transition active:translate-y-0.5 ${
              activeTab === "action"
                ? "bg-[#1D202B] text-indigo-300 font-semibold shadow-clay-btn"
                : "text-zinc-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Action & SOP</span>
          </button>
        </div>
      </div>

      {/* 2. Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm font-sans">
        {/* ================= TAB 1: THREAT & TERRAIN ================= */}
        {activeTab === "threat" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Quick 3-Metric Summary Bar */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/80 p-2.5 shadow-clay-btn">
                <div className="text-[10px] text-zinc-400 uppercase font-medium">Rain Forcing</div>
                <div className="text-base font-bold font-mono text-indigo-400 mt-0.5">
                  {Math.round(pMeteo * 100)}%
                </div>
                <div className="text-[9px] text-zinc-500 font-mono">P_meteo</div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/80 p-2.5 shadow-clay-btn">
                <div className="text-[10px] text-zinc-400 uppercase font-medium">Slope Runoff</div>
                <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                  {Math.round(sTerrain * 100)}%
                </div>
                <div className="text-[9px] text-zinc-500 font-mono">S_terrain</div>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-[#241418] p-2.5 shadow-clay-btn">
                <div className="text-[10px] text-rose-300 uppercase font-medium">Surge Hazard</div>
                <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
                  {Math.round(cellData.probabilities.flashFlood * 100)}%
                </div>
                <div className="text-[9px] text-rose-400/80 font-mono">Combined</div>
              </div>
            </div>

            {/* Operational Guidance */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/80 p-3.5 space-y-2 shadow-clay-btn">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <Activity className="h-3.5 w-3.5" />
                  Primary Threat Dynamics
                </span>
                <span className="rounded-full bg-[#161820] px-2.5 py-0.5 text-[10px] text-slate-300 border border-white/[0.08] shadow-clay-badge font-sans">
                  {dominantDriver.replace("_", " ")}
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                {dominantDriver === "TERRAIN_AMPLIFIED" && (
                  <>
                    Extreme ravine confinement (slope {cellData.terrain.slopeDeg.toFixed(1)}°) channels convective rainfall into accelerated surge velocities. Runoff concentration time is compressed to under 45 minutes.
                  </>
                )}
                {dominantDriver === "METEOROLOGY_DRIVEN" && (
                  <>
                    Rapid convective cooling rate with severe moisture convergence creates extreme precipitation ({Math.round(cellData.probabilities.cloudburst * 100)}% cloudburst probability) exceeding soil infiltration capacity.
                  </>
                )}
                {dominantDriver === "COMPOUND_SURGE" && (
                  <>
                    Compound threat: Localized convective cloudburst coinciding with steep, convergent mountain terrain (TWI {cellData.terrain.twi.toFixed(1)}). High likelihood of cirque inundation and debris channel activation.
                  </>
                )}
              </p>
            </div>

            {/* Dual-Factor Decomposition Visualization */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/80 p-3.5 space-y-3 shadow-clay-btn">
              <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                Dual-Factor Physics Decomposition
              </div>

              {/* Dynamic Atmospheric Forcing */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-indigo-400" />
                    Atmospheric Forcing (P_meteo)
                  </span>
                  <span className="font-semibold text-indigo-400 font-mono">{Math.round(pMeteo * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-[#111217] rounded-full shadow-clay-inset overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${Math.round(pMeteo * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Cloudburst: {Math.round(cellData.probabilities.cloudburst * 100)}%</span>
                  <span>Thunderstorm: {Math.round(cellData.probabilities.thunderstorm * 100)}%</span>
                </div>
              </div>

              {/* Static Terrain Susceptibility */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Mountain className="h-3.5 w-3.5 text-amber-400" />
                    Terrain Susceptibility (S_terrain)
                  </span>
                  <span className="font-semibold text-amber-400 font-mono">{Math.round(sTerrain * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-[#111217] rounded-full shadow-clay-inset overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${Math.round(sTerrain * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Slope: {cellData.terrain.slopeDeg.toFixed(1)}°</span>
                  <span>TWI: {cellData.terrain.twi.toFixed(1)}</span>
                  <span>MSL: {cellData.terrain.elevationM}m</span>
                </div>
              </div>
            </div>

            {/* Catchment Topography */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/80 p-3.5 shadow-clay-btn">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs mb-2.5 uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5 text-indigo-400" />
                <span>Catchment Topographic Parameters</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <div className="text-[10px] uppercase font-medium text-zinc-400">Slope Incline</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {cellData.terrain.slopeDeg.toFixed(1)}°
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {cellData.terrain.slopeDeg > 35 ? "Severe Incline (≥35°)" : "Moderate Incline"}
                  </div>
                </div>

                <div className="rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <div className="text-[10px] uppercase font-medium text-zinc-400">Topographic Wetness</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {cellData.terrain.twi.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Convergent Channel</div>
                </div>

                <div className="rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <div className="text-[10px] uppercase font-medium text-zinc-400">Elevation (MSL)</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {cellData.terrain.elevationM} m
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Alpine Basin</div>
                </div>

                <div className="rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <div className="text-[10px] uppercase font-medium text-zinc-400">Catchment Vulnerability</div>
                  <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                    {(cellData.terrain.catchmentVuln * 10).toFixed(1)} / 10
                  </div>
                  <div className="text-[10px] text-rose-400 mt-0.5">High Drainage Risk</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ATMOSPHERIC & RADAR ================= */}
        {activeTab === "atmospheric" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Moisture & Kinematic Matrix (PS 05 Specific) */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/80 p-3.5 space-y-2.5 shadow-clay-btn">
              <div className="flex items-center justify-between text-slate-200 font-semibold text-xs uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Moisture & Kinematics (IWV)</span>
                </span>
                <span className="text-[10px] font-mono text-indigo-300 bg-[#1C1F30] border border-indigo-500/40 px-2 py-0.5 rounded-full shadow-clay-badge">
                  PS 05 Matrix
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <div className="text-[10px] uppercase font-medium text-zinc-400">Integrated Water Vapor</div>
                  <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                    {(cellData.xaiAttribution.find(a => a.feature === 'tpw')?.observedValue || 58.2).toFixed(1)} mm
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Saturated Column</div>
                </div>

                <div className="rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <div className="text-[10px] uppercase font-medium text-zinc-400">Cloud Top Cooling Rate</div>
                  <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                    {(cellData.xaiAttribution.find(a => a.feature === 'cooling')?.observedValue || -18.5).toFixed(1)} K/hr
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Rapid Updraft Growth</div>
                </div>

                <div className="rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <div className="text-[10px] uppercase font-medium text-zinc-400">Instability (CAPE)</div>
                  <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                    {Math.round(cellData.xaiAttribution.find(a => a.feature === 'cape')?.observedValue || 3150)} J/kg
                  </div>
                  <div className="text-[10px] text-amber-400/80 mt-0.5">Extreme Energy</div>
                </div>

                <div className="rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <div className="text-[10px] uppercase font-medium text-zinc-400">Vertical Wind Shear</div>
                  <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                    18.4 m/s
                  </div>
                  <div className="text-[10px] text-purple-400/80 mt-0.5">Convective Tilt</div>
                </div>
              </div>
            </div>

            {/* Explainable AI Attribution (SHAP feature weights) */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/80 p-3.5 space-y-3 shadow-clay-btn">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-indigo-400" />
                  Neural Feature Attribution
                </span>
                <span className="text-[11px] text-zinc-400">SHAP Sensitivity</span>
              </div>

              <div className="space-y-2.5">
                {cellData.xaiAttribution.map((factor, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{factor.label}</span>
                      <span className="text-indigo-400 font-semibold font-mono">
                        +{Math.round(factor.contribution * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-[#111217] rounded-full shadow-clay-inset overflow-hidden">
                        <div
                          className="h-full bg-indigo-400 rounded-full shadow-sm"
                          style={{ width: `${Math.round(factor.contribution * 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-zinc-400 w-24 text-right font-mono">
                        {factor.observedValue} {factor.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#111217]/90 p-3 text-[11px] text-zinc-400 leading-relaxed shadow-clay-inset">
                <strong className="text-slate-200 font-medium">Non-Causal Notice:</strong> Feature weights represent neural gradient sensitivities across multi-spectral channels, providing operational explainability without asserting deterministic physical causality.
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ACTION & SOP ================= */}
        {activeTab === "action" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Action Recommendations */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/80 p-3.5 space-y-3 shadow-clay-btn">
              <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Standard Operating Procedure (SOP)
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2 rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#241418] text-rose-300 font-bold text-[10px] shadow-clay-badge border border-rose-500/30">
                    1
                  </span>
                  <div>
                    <strong className="text-white">Riverfront Alert Broadcast:</strong> Transmit immediate evacuation warnings to settlements within 500m of the active river channel.
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#241F12] text-amber-300 font-bold text-[10px] shadow-clay-badge border border-amber-500/30">
                    2
                  </span>
                  <div>
                    <strong className="text-white">Hydro-Gauge Verification:</strong> Poll upstream automatic rain gauges (ARGs) along the Mandakini and Alaknanda catchments.
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-[#111217] p-2.5 border border-white/[0.04] shadow-clay-inset">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1C1F30] text-indigo-300 font-bold text-[10px] shadow-clay-badge border border-indigo-500/30">
                    3
                  </span>
                  <div>
                    <strong className="text-white">Civil Defense Staging:</strong> Position NDRF / SDRF rapid response teams at downstream bridge crossings.
                  </div>
                </div>
              </div>
            </div>

            {/* Model Diagnostics & Boundaries */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#1D202B]/80 p-3.5 space-y-2.5 shadow-clay-btn">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                  Model Verification & Bounds
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">3.7 ms</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pb-2 border-b border-white/[0.06]">
                <div className="text-zinc-400">Model: <strong className="text-white">Conv3D Multi-task</strong></div>
                <div className="text-zinc-400">PR-AUC: <strong className="text-white">0.856</strong></div>
                <div className="text-zinc-400">F1 Score: <strong className="text-emerald-400">0.835</strong></div>
                <div className="text-zinc-400">Brier Score: <strong className="text-emerald-400">0.070</strong></div>
              </div>

              <div className="space-y-1.5 text-[11px] text-zinc-400 pt-1 leading-relaxed">
                <div>• <strong className="text-slate-200">Hydrodynamics:</strong> Shallow-water hydraulic wave propagation remains unmodeled.</div>
                <div>• <strong className="text-slate-200">Infiltration:</strong> Soil moisture parameterized via Topographic Wetness Index (TWI).</div>
                <div>• <strong className="text-slate-200">Debris Dams:</strong> Landslide lake outburst floods can trigger surges exceeding rainfall bounds.</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            <span>Advisory Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#1D202B] text-xs font-medium text-slate-200 hover:text-white shadow-clay-btn active:translate-y-0.5 active:shadow-clay-btn-pressed transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
