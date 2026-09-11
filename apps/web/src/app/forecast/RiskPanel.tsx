import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Mountain,
  Wind,
  Droplets,
  Info,
  Compass,
  ShieldCheck,
  HelpCircle,
  Activity,
  Layers,
} from "lucide-react";
import RiskBadge, { SeverityLevel } from "../components/RiskBadge";

export interface SelectedCellData {
  cellId: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  severity: SeverityLevel;
  horizonMinutes: number;
  validTime: string;
  probabilities: {
    thunderstorm: number;
    cloudburst: number;
    flashFlood: number;
  };
  terrain: {
    slopeDeg: number;
    elevationM: number;
    twi: number;
    catchmentVuln: number;
  };
  xaiAttribution: Array<{
    feature: string;
    label: string;
    contribution: number;
    observedValue: number;
    unit: string;
  }>;
}

interface RiskPanelProps {
  cellData: SelectedCellData | null;
  onClose: () => void;
  className?: string;
}

export default function RiskPanel({
  cellData,
  onClose,
  className = "",
}: RiskPanelProps) {
  const [showLimitations, setShowLimitations] = useState<boolean>(false);

  if (!cellData) return null;

  // Calculate dual-factor decomposition
  const pMeteo = Math.min(
    1.0,
    cellData.probabilities.cloudburst * 0.75 + cellData.probabilities.thunderstorm * 0.25
  );
  const sTerrain = Math.min(
    1.0,
    (cellData.terrain.slopeDeg / 40.0) * 0.55 + ((cellData.terrain.twi - 2.0) / 12.0) * 0.45
  );
  const surgeAmp = Math.pow(pMeteo * sTerrain, 0.8);

  const dominantDriver =
    pMeteo > sTerrain + 0.2
      ? "METEOROLOGY_DRIVEN"
      : sTerrain > pMeteo + 0.2
      ? "TERRAIN_AMPLIFIED"
      : "COMPOUND_SURGE";

  return (
    <div
      className={`rounded-lg border border-slate-800 bg-[#0c1322]/95 shadow-2xl backdrop-blur-md text-slate-200 overflow-hidden flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#090e1a] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <RiskBadge severity={cellData.severity} size="sm" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100 leading-tight">
              {cellData.name}
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              CELL #{cellData.cellId} • [{cellData.coordinates[0].toFixed(3)}°E, {cellData.coordinates[1].toFixed(3)}°N]
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          aria-label="Close Cell Risk Inspector"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Mandatory Scientific Integrity Disclaimer */}
        <div className="rounded border border-amber-800/60 bg-amber-950/40 p-2.5 font-mono text-[10px] text-amber-200">
          <div className="flex items-center justify-between font-bold mb-1">
            <span className="flex items-center gap-1 text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              STATISTICAL RISK ESTIMATE (PILOT)
            </span>
            <button
              onClick={() => setShowLimitations(!showLimitations)}
              className="text-cyan-300 underline hover:text-cyan-100 text-[9px]"
            >
              {showLimitations ? "Hide Details" : "Model Limitations"}
            </button>
          </div>
          <p className="text-[9px] text-amber-200/80 leading-relaxed">
            Flash-flood index reflects hydrometeorological surge susceptibility. Not deterministic 2D hydraulic inundation truth.
          </p>

          {showLimitations && (
            <div className="mt-2 pt-2 border-t border-amber-800/50 space-y-1 text-[9px] text-amber-100/90">
              <div>• <strong>Hydrodynamics:</strong> Shallow-water hydraulic wave propagation and backwater effects are unmodeled.</div>
              <div>• <strong>Infiltration:</strong> Soil saturation parameterized by Topographic Wetness Index (TWI), not live TDR probes.</div>
              <div>• <strong>Debris Dams:</strong> Local landslide dam breach surges can exceed modeled catchment bounds.</div>
            </div>
          )}
        </div>

        {/* Dual-Factor Decomposition: Weather vs. Terrain */}
        <div className="rounded border border-slate-800 bg-[#0a1122] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono font-semibold text-[11px] text-cyan-300 uppercase flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              Dual-Factor Flash-Flood Attribution
            </span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-cyan-400 border border-slate-700">
              {dominantDriver}
            </span>
          </div>

          <div className="space-y-2.5 font-mono">
            {/* Factor 1: Dynamic Weather Forcing */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-cyan-400" />
                  Meteorological Forcing (P_meteo)
                </span>
                <span className="font-bold text-cyan-300">{Math.round(pMeteo * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(pMeteo * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                <span>Cloudburst: {Math.round(cellData.probabilities.cloudburst * 100)}%</span>
                <span>Thunderstorm: {Math.round(cellData.probabilities.thunderstorm * 100)}%</span>
              </div>
            </div>

            {/* Factor 2: Static Terrain Susceptibility */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 flex items-center gap-1">
                  <Mountain className="h-3 w-3 text-amber-400" />
                  Terrain Susceptibility (S_terrain)
                </span>
                <span className="font-bold text-amber-400">{Math.round(sTerrain * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(sTerrain * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                <span>Slope: {cellData.terrain.slopeDeg.toFixed(1)}°</span>
                <span>TWI: {cellData.terrain.twi.toFixed(1)}</span>
                <span>Relief: {cellData.terrain.elevationM}m</span>
              </div>
            </div>

            {/* Factor 3: Surge Amplification Interaction */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-rose-400" />
                  Fused Flash-Flood Risk (R_surge)
                </span>
                <span className="font-extrabold text-rose-400">
                  {Math.round(cellData.probabilities.flashFlood * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(cellData.probabilities.flashFlood * 100)}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-400 mt-1 leading-tight">
                {dominantDriver === "TERRAIN_AMPLIFIED"
                  ? "Hydraulic confinement in steep ravine amplifies moderate rain into surge potential."
                  : dominantDriver === "METEOROLOGY_DRIVEN"
                  ? "Extreme localized convective rainfall core exceeds catchment infiltration rate."
                  : "Compound threat: high rainfall intensity coinciding with steep, convergent mountain terrain."}
              </div>
            </div>
          </div>
        </div>

        {/* Terrain Vulnerability Section */}
        <div className="rounded border border-slate-800 bg-slate-900/40 p-3">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold text-[11px] mb-2 uppercase">
            <Mountain className="h-3.5 w-3.5" />
            <span>DEM Topography & Catchment Dynamics</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
            <div className="rounded bg-slate-800/50 p-2 border border-slate-800">
              <div className="text-slate-400 text-[10px]">SLOPE GRADIENT</div>
              <div className="text-sm font-bold text-slate-100">
                {cellData.terrain.slopeDeg.toFixed(1)}°
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {cellData.terrain.slopeDeg > 35 ? "Extreme Incline" : "Moderate Incline"}
              </div>
            </div>

            <div className="rounded bg-slate-800/50 p-2 border border-slate-800">
              <div className="text-slate-400 text-[10px]">TOPOGRAPHIC WETNESS</div>
              <div className="text-sm font-bold text-slate-100">
                {cellData.terrain.twi.toFixed(1)}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">Convergent Drainage Channel</div>
            </div>

            <div className="rounded bg-slate-800/50 p-2 border border-slate-800">
              <div className="text-slate-400 text-[10px]">ELEVATION (MSL)</div>
              <div className="text-sm font-bold text-slate-100">
                {cellData.terrain.elevationM} m
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">Himalayan Catchment</div>
            </div>

            <div className="rounded bg-slate-800/50 p-2 border border-slate-800">
              <div className="text-slate-400 text-[10px]">CATCHMENT VULNERABILITY</div>
              <div className="text-sm font-bold text-rose-300">
                {(cellData.terrain.catchmentVuln * 10).toFixed(1)} / 10
              </div>
              <div className="text-[9px] text-rose-400 mt-0.5">Hydrological Vulnerability</div>
            </div>
          </div>
        </div>

        {/* Explainable AI Attribution */}
        <div className="rounded border border-slate-800 bg-[#0a0f1d] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono font-semibold text-[11px] text-slate-300 uppercase flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              XAI Contributing Factor Attribution
            </span>
            <span className="text-[9px] font-mono text-slate-400">SHAP / Feature Weights</span>
          </div>

          <div className="space-y-2">
            {cellData.xaiAttribution.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-300">{factor.label}</span>
                  <span className="text-cyan-300 font-bold">
                    +{Math.round(factor.contribution * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${factor.contribution * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {factor.observedValue} {factor.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded border border-slate-800 bg-slate-900/60 p-2 text-[10px] text-slate-400 leading-relaxed font-mono">
            <strong>Operational Transparency:</strong> Attributions represent relative input feature importance within the spatiotemporal model. They provide operational guidance without claiming deterministic causal certainty.
          </div>
        </div>
      </div>
    </div>
  );
}
