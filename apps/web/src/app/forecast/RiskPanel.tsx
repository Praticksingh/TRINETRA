import React from "react";
import { X, AlertTriangle, Mountain, Wind, Droplets, Info, Compass, ShieldCheck } from "lucide-react";
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
  if (!cellData) return null;

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
        {/* Probability Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2 font-mono text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Nowcast Hazard Probabilities</span>
            <span className="text-cyan-400">T+{cellData.horizonMinutes / 60}h Horizon</span>
          </div>

          <div className="space-y-2">
            {/* Thunderstorm */}
            <div className="rounded border border-slate-800/80 bg-slate-900/60 p-2.5">
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <span className="text-slate-300">Severe Thunderstorm</span>
                <span className="font-bold text-amber-400">
                  {Math.round(cellData.probabilities.thunderstorm * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${cellData.probabilities.thunderstorm * 100}%` }}
                />
              </div>
            </div>

            {/* Cloudburst */}
            <div className="rounded border border-slate-800/80 bg-slate-900/60 p-2.5">
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <span className="text-slate-300">Cloudburst Potential</span>
                <span className="font-bold text-orange-400">
                  {Math.round(cellData.probabilities.cloudburst * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${cellData.probabilities.cloudburst * 100}%` }}
                />
              </div>
            </div>

            {/* Flash Flood */}
            <div className="rounded border border-slate-800/80 bg-slate-900/60 p-2.5">
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <span className="text-slate-300">Flash Flood Runoff Risk</span>
                <span className="font-bold text-rose-400">
                  {Math.round(cellData.probabilities.flashFlood * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${cellData.probabilities.flashFlood * 100}%` }}
                />
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
            <div className="rounded bg-slate-800/50 p-2">
              <div className="text-slate-400 text-[10px]">SLOPE GRADIENT</div>
              <div className="text-sm font-bold text-slate-100">
                {cellData.terrain.slopeDeg.toFixed(1)}°
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">Steep Incline</div>
            </div>

            <div className="rounded bg-slate-800/50 p-2">
              <div className="text-slate-400 text-[10px]">TOPOGRAPHIC WETNESS</div>
              <div className="text-sm font-bold text-slate-100">
                {cellData.terrain.twi.toFixed(1)}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">High Inundation Propensity</div>
            </div>

            <div className="rounded bg-slate-800/50 p-2">
              <div className="text-slate-400 text-[10px]">ELEVATION (MSL)</div>
              <div className="text-sm font-bold text-slate-100">
                {cellData.terrain.elevationM} m
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">Himalayan Valley Floor</div>
            </div>

            <div className="rounded bg-slate-800/50 p-2">
              <div className="text-slate-400 text-[10px]">CATCHMENT VULNERABILITY</div>
              <div className="text-sm font-bold text-rose-300">
                {(cellData.terrain.catchmentVuln * 10).toFixed(1)} / 10
              </div>
              <div className="text-[9px] text-rose-400 mt-0.5">Severe Hydrological Risk</div>
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
            <strong>Disaster Support Transparency:</strong> Attributions represent relative input feature importance within the spatiotemporal model. They provide operational guidance without claiming deterministic causal certainty.
          </div>
        </div>
      </div>
    </div>
  );
}
