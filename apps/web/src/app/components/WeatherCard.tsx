import React from "react";
import { CloudRain, Wind, Thermometer, Radio, Droplets, ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface AtmosphericMetrics {
  cape: number; // J/kg
  cin: number; // J/kg
  tpw: number; // mm
  tir1_cooling_rate: number; // K/hr
  radar_reflectivity_dbz: number; // dBZ
  surface_temp_c: number;
  rh_percent: number;
}

interface WeatherCardProps {
  metrics: AtmosphericMetrics;
  stationName?: string;
  timestamp?: string;
  isSynthetic?: boolean;
}

export default function WeatherCard({
  metrics,
  stationName = "Uttarakhand Atmospheric Sounding Grid #3012",
  timestamp = "2026-09-11 08:30 UTC",
  isSynthetic = true,
}: WeatherCardProps) {
  // Evaluation of convective instability based on CAPE
  const isSevereCape = metrics.cape >= 2500;
  const isHighReflectivity = metrics.radar_reflectivity_dbz >= 45;
  const isRapidCooling = metrics.tir1_cooling_rate <= -10;

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0d1424] p-4 text-slate-200 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Atmospheric Sounding & Telemetry
            </h4>
            {isSynthetic && (
              <span className="rounded bg-amber-950/60 px-1.5 py-0.2 text-[9px] font-mono text-amber-400 border border-amber-800/40">
                SYNTHETIC REPLAY
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{stationName}</p>
        </div>
        <div className="text-right text-[10px] font-mono text-slate-400">
          <div>VALID TIME</div>
          <div className="text-slate-300">{timestamp}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* CAPE Metric */}
        <div className="rounded border border-slate-800/80 bg-slate-900/50 p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-mono">
              <Wind className="h-3 w-3 text-cyan-400" />
              CAPE
            </span>
            {isSevereCape ? (
              <span className="text-[9px] text-rose-400 font-mono flex items-center">
                <ArrowUpRight className="h-2.5 w-2.5" /> HIGH
              </span>
            ) : (
              <span className="text-[9px] text-emerald-400 font-mono">NORMAL</span>
            )}
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {metrics.cape.toLocaleString()}{" "}
            <span className="text-[11px] font-normal text-slate-400">J/kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Convective Available Energy</div>
        </div>

        {/* CIN Metric */}
        <div className="rounded border border-slate-800/80 bg-slate-900/50 p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-mono">
              <Thermometer className="h-3 w-3 text-amber-400" />
              CIN
            </span>
            <span className="text-[9px] text-slate-400 font-mono">CAP</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {metrics.cin}{" "}
            <span className="text-[11px] font-normal text-slate-400">J/kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Convective Inhibition</div>
        </div>

        {/* TPW Metric */}
        <div className="rounded border border-slate-800/80 bg-slate-900/50 p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-mono">
              <Droplets className="h-3 w-3 text-blue-400" />
              TPW
            </span>
            <span className="text-[9px] text-cyan-400 font-mono">MOISTURE</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {metrics.tpw.toFixed(1)}{" "}
            <span className="text-[11px] font-normal text-slate-400">mm</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Total Precipitable Water</div>
        </div>

        {/* Cloud-Top Cooling Rate */}
        <div className="rounded border border-slate-800/80 bg-slate-900/50 p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-mono">
              <CloudRain className="h-3 w-3 text-purple-400" />
              TIR1 COOLING
            </span>
            {isRapidCooling && (
              <span className="text-[9px] text-rose-400 font-mono flex items-center">
                <ArrowDownRight className="h-2.5 w-2.5" /> DEEP
              </span>
            )}
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {metrics.tir1_cooling_rate.toFixed(1)}{" "}
            <span className="text-[11px] font-normal text-slate-400">K/hr</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Cloud-top Convective Growth</div>
        </div>

        {/* Radar Reflectivity */}
        <div className="rounded border border-slate-800/80 bg-slate-900/50 p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-mono">
              <Radio className="h-3 w-3 text-rose-400" />
              DWR RADAR
            </span>
            {isHighReflectivity && (
              <span className="text-[9px] text-rose-400 font-mono">INTENSE</span>
            )}
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {metrics.radar_reflectivity_dbz}{" "}
            <span className="text-[11px] font-normal text-slate-400">dBZ</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Composite Core Reflectivity</div>
        </div>

        {/* Surface Conditions */}
        <div className="rounded border border-slate-800/80 bg-slate-900/50 p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-mono text-slate-300">SURFACE MET</span>
            <span className="text-[9px] font-mono text-slate-400">RH {metrics.rh_percent}%</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {metrics.surface_temp_c.toFixed(1)}°C
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Temp / Dewpoint Spread</div>
        </div>
      </div>
    </div>
  );
}
