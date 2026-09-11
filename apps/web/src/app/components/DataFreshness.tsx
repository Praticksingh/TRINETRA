import React from "react";
import { Activity, Clock, Wifi, AlertTriangle, CheckCircle2 } from "lucide-react";

interface DataFreshnessProps {
  satelliteAgeMinutes: number;
  nwpAgeMinutes: number;
  lastInferenceUtc: string;
  inferenceLatencyMs: number;
  modelVersion?: string;
  isDegraded?: boolean;
}

export default function DataFreshness({
  satelliteAgeMinutes,
  nwpAgeMinutes,
  lastInferenceUtc,
  inferenceLatencyMs,
  modelVersion = "v0.1.0-baseline-synthetic",
  isDegraded = false,
}: DataFreshnessProps) {
  const isSatelliteStale = satelliteAgeMinutes > 45;
  const isNwpStale = nwpAgeMinutes > 180;
  const hasStaleFeeds = isSatelliteStale || isNwpStale || isDegraded;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-800 bg-[#0a0f1d] px-3.5 py-2 text-xs font-mono">
      <div className="flex flex-wrap items-center gap-4">
        {/* System telemetry heartbeat */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {!hasStaleFeeds ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            )}
          </span>
          <span className="text-slate-300 font-medium">
            {!hasStaleFeeds ? "TELEMETRY NOMINAL" : "DATA DEGRADED"}
          </span>
        </div>

        {/* Satellite Freshness */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Wifi className="h-3.5 w-3.5 text-cyan-400" />
          <span>SATELLITE (INSAT):</span>
          <span
            className={
              isSatelliteStale ? "text-amber-400 font-semibold" : "text-slate-200"
            }
          >
            {satelliteAgeMinutes}m ago
          </span>
        </div>

        {/* NWP Reanalysis Freshness */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Activity className="h-3.5 w-3.5 text-indigo-400" />
          <span>NWP ANALYSIS:</span>
          <span
            className={
              isNwpStale ? "text-amber-400 font-semibold" : "text-slate-200"
            }
          >
            {nwpAgeMinutes}m ago
          </span>
        </div>

        {/* Inference Latency */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span>LATENCY:</span>
          <span className="text-slate-200">{inferenceLatencyMs}ms</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
        <span>
          MODEL: <span className="text-cyan-300">{modelVersion}</span>
        </span>
        <span className="text-slate-600">|</span>
        <span>
          LAST INFERENCE: <span className="text-slate-200">{lastInferenceUtc}</span>
        </span>
      </div>
    </div>
  );
}
