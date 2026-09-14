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
  Wifi,
  ShieldAlert,
  Flame,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/sentinel/Badge";
import { Button } from "@/components/sentinel/Button";
import { SelectedCellData } from "@/app/forecast/RiskPanel";

export interface RiskInspectorProps {
  cellData: SelectedCellData | null;
  onClose: () => void;
  className?: string;
}

export const RiskInspector: React.FC<RiskInspectorProps> = ({
  cellData,
  onClose,
  className = "",
}) => {
  const [showLimitations, setShowLimitations] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

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
      className={`rounded-xl border border-[#1E2D4A] bg-[#111A2C]/95 text-slate-200 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col ${className}`}
    >
      {/* 1. Header: Location, Coordinates, Severity, Advisory Notice */}
      <div className="border-b border-[#1E2D4A] bg-[#111A2C] px-4 py-3 font-sans">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge severity={cellData.severity} size="sm">
              {cellData.severity.toUpperCase()}
            </Badge>
            <span className="rounded bg-amber-950/70 px-1.5 py-0.5 text-[9px] font-sans font-bold text-amber-300 border border-amber-800/50">
              MODEL ADVISORY
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#16233B] transition"
            aria-label="Close Cell Risk Inspector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
            {cellData.name}
          </h2>
          <div className="flex items-center gap-2 text-[10px] font-sans text-slate-400 mt-0.5">
            <span>Cell #{cellData.cellId}</span>
            <span>•</span>
            <span>[{cellData.coordinates[0].toFixed(3)}°E, {cellData.coordinates[1].toFixed(3)}°N]</span>
            <span>•</span>
            <span>{cellData.terrain.elevationM}m MSL</span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {/* Key Metrics Summary Bar */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Weather</div>
            <div className="text-sm font-bold font-mono text-sky-400 mt-0.5">
              {Math.round(pMeteo * 100)}%
            </div>
            <div className="text-[9px] text-slate-400 font-mono">P_meteo</div>
          </div>

          <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Terrain</div>
            <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
              {Math.round(sTerrain * 100)}%
            </div>
            <div className="text-[9px] text-slate-400 font-mono">S_terrain</div>
          </div>

          <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-2">
            <div className="text-[10px] text-rose-300 uppercase tracking-wider font-medium">Surge Risk</div>
            <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
              {Math.round(cellData.probabilities.flashFlood * 100)}%
            </div>
            <div className="text-[9px] text-rose-400 font-mono">Combined</div>
          </div>
        </div>

        {/* Operational Guidance */}
        <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-3 space-y-2">
          <div className="flex items-center justify-between text-sky-400 text-xs font-semibold tracking-wide">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Operational Guidance
            </span>
            <span className="rounded bg-[#111A2C] px-2 py-0.5 text-[10px] text-slate-300 border border-[#1E2D4A] font-sans">
              {dominantDriver.replace("_", " ")}
            </span>
          </div>

          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            {dominantDriver === "TERRAIN_AMPLIFIED" && (
              <>
                Extreme ravine confinement (slope {cellData.terrain.slopeDeg.toFixed(1)}°) channels moderate convective rainfall into accelerated surge velocities. Runoff concentration time is compressed to under 45 minutes.
              </>
            )}
            {dominantDriver === "METEOROLOGY_DRIVEN" && (
              <>
                Rapid convective cooling rate with high moisture convergence creates severe precipitation rate ({Math.round(cellData.probabilities.cloudburst * 100)}% cloudburst probability) that exceeds catchment infiltration capacity.
              </>
            )}
            {dominantDriver === "COMPOUND_SURGE" && (
              <>
                Compound threat: Severe localized convective cloudburst coinciding with steep, convergent mountain terrain (TWI {cellData.terrain.twi.toFixed(1)}). High likelihood of cirque inundation and debris channel activation.
              </>
            )}
          </p>

          <div className="pt-2 border-t border-[#1F3350]/60 text-[10px] text-[#91A5BB]">
            <strong className="text-slate-200">Recommended Action:</strong> Maintain active watch on riverfront settlements; verify automated upstream raingauges along the drainage corridor.
          </div>
        </div>

        {/* Dual-Factor Decomposition Visualization */}
        <div className="rounded-lg border border-[#1E2D4A] bg-[#111A2C] p-3.5 space-y-3.5">
          <div className="text-[#38BDF8] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Dual-Factor Independent Decomposition
          </div>

          {/* Dynamic Weather Forcing */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-[#38BDF8]" />
                Atmospheric Forcing (P_meteo)
              </span>
              <span className="font-semibold text-[#38BDF8]">{Math.round(pMeteo * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-[#38BDF8] rounded-full transition-all duration-300"
                style={{ width: `${Math.round(pMeteo * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Cloudburst: {Math.round(cellData.probabilities.cloudburst * 100)}%</span>
              <span>Thunderstorm: {Math.round(cellData.probabilities.thunderstorm * 100)}%</span>
            </div>
          </div>

          {/* Static Terrain Susceptibility */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Mountain className="h-3.5 w-3.5 text-amber-400" />
                Terrain Susceptibility (S_terrain)
              </span>
              <span className="font-semibold text-amber-400">{Math.round(sTerrain * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(sTerrain * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Slope: {cellData.terrain.slopeDeg.toFixed(1)}°</span>
              <span>TWI: {cellData.terrain.twi.toFixed(1)}</span>
              <span>Elevation: {cellData.terrain.elevationM}m</span>
            </div>
          </div>
        </div>

        {/* DEM Topography & Catchment Parameters */}
        <div className="rounded-lg border border-[#1E2D4A] bg-[#111A2C] p-3.5">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs mb-2.5 uppercase tracking-wider">
            <Mountain className="h-3.5 w-3.5 text-[#38BDF8]" />
            <span>Catchment Topographic Parameters</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-[#16233B]/70 p-2.5 border border-[#1E2D4A]">
              <div className="text-[10px] uppercase font-medium text-slate-400">Slope Incline</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {cellData.terrain.slopeDeg.toFixed(1)}°
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {cellData.terrain.slopeDeg > 35 ? "Severe Incline (≥35°)" : "Moderate Incline"}
              </div>
            </div>

            <div className="rounded-lg bg-[#16233B]/70 p-2.5 border border-[#1E2D4A]">
              <div className="text-[10px] uppercase font-medium text-slate-400">Topographic Wetness</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {cellData.terrain.twi.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Convergent Channel</div>
            </div>

            <div className="rounded-lg bg-[#16233B]/70 p-2.5 border border-[#1E2D4A]">
              <div className="text-[10px] uppercase font-medium text-slate-400">Elevation (MSL)</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {cellData.terrain.elevationM} m
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Himalayan Basin</div>
            </div>

            <div className="rounded-lg bg-[#16233B]/70 p-2.5 border border-[#1E2D4A]">
              <div className="text-[10px] uppercase font-medium text-slate-400">Catchment Vulnerability</div>
              <div className="text-sm font-bold text-rose-300 mt-0.5">
                {(cellData.terrain.catchmentVuln * 10).toFixed(1)} / 10
              </div>
              <div className="text-[10px] text-rose-400 mt-0.5">Hydrological Risk</div>
            </div>
          </div>
        </div>

        {/* Explainable AI Attribution (SHAP feature weights) */}
        <div className="rounded-lg border border-[#1E2D4A] bg-[#111A2C] p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-200 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-[#38BDF8]" />
              Contributing Factors
            </span>
            <span className="text-[11px] text-slate-400">Model Sensitivity</span>
          </div>

          <div className="space-y-2.5">
            {cellData.xaiAttribution.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{factor.label}</span>
                  <span className="text-[#38BDF8] font-semibold">
                    +{Math.round(factor.contribution * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#38BDF8] rounded-full"
                      style={{ width: `${Math.round(factor.contribution * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 w-24 text-right">
                    {factor.observedValue} {factor.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mandatory Visible Non-Causal Disclaimer */}
          <div className="mt-3 rounded-lg border border-[#1E2D4A] bg-[#16233B]/60 p-2.5 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200 font-medium">Non-Causal Explanation:</strong> Feature weights quantify relative model sensitivity across neural layers. They provide operational transparency without asserting deterministic physical causality.
          </div>
        </div>

        {/* Technical Details & Model Limitations Accordion */}
        <div className="rounded-lg border border-[#1E2D4A] bg-[#111A2C] overflow-hidden">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="flex w-full items-center justify-between p-3 text-left font-semibold text-xs text-slate-300 hover:text-white transition"
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-[#38BDF8]" />
              Model Diagnostics & Limitations
            </span>
            {showTechnicalDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showTechnicalDetails && (
            <div className="border-t border-[#1E2D4A] p-3 space-y-2 text-[11px] text-slate-400 leading-relaxed">
              <div className="grid grid-cols-2 gap-2 text-slate-300 pb-2 border-b border-[#1E2D4A]/60">
                <div>Model: <strong className="text-white">v1.0.0-conv3d</strong></div>
                <div>Inference: <strong className="text-emerald-400">3.7 ms</strong></div>
                <div>PR-AUC: <strong className="text-white">0.906</strong></div>
                <div>Brier Score: <strong className="text-emerald-400">0.070</strong></div>
              </div>

              <div className="space-y-1.5 pt-1 text-slate-300">
                <div>• <strong className="text-slate-200">Hydrodynamics:</strong> Shallow-water hydraulic wave propagation and backwater surges remain unmodeled.</div>
                <div>• <strong className="text-slate-200">Infiltration:</strong> Soil moisture parameterized via Topographic Wetness Index (TWI) rather than live TDR sensor arrays.</div>
                <div>• <strong className="text-slate-200">Debris Dams:</strong> Landslide dam outbursts can trigger surges exceeding modeled catchment precipitation bounds.</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-2 border-t border-[#1E2D4A] flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>Advisory Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#1E2D4A] bg-[#16233B] text-xs font-medium text-slate-200 hover:text-white hover:bg-[#1E2D4A] transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
