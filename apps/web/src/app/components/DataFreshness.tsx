import React from "react";
import { Activity, Clock, Wifi, AlertTriangle, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";

interface DataFreshnessProps {
  satelliteAgeMinutes: number;
  nwpAgeMinutes: number;
  lastInferenceUtc: string;
  lastObservationUtc?: string;
  inferenceLatencyMs: number;
  modelVersion?: string;
  jobId?: string;
  isDegraded?: boolean;
}

export default function DataFreshness({
  satelliteAgeMinutes,
  nwpAgeMinutes,
  lastInferenceUtc,
  lastObservationUtc = "2026-09-11 08:30 UTC",
  inferenceLatencyMs,
  modelVersion = "v1.0.0-conv3d-multitask",
  jobId = "job_nowcast_active",
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

        {/* Stale Warning Badge if feeds lag */}
        {hasStaleFeeds && (
          <div className="flex items-center gap-1 rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-700/60 animate-pulse">
            <ShieldAlert className="h-3 w-3 text-amber-400" />
            <span>DATA STALE / RUNOFF DEGRADED</span>
          </div>
        )}

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

        {/* Pipeline Latency */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span>LATENCY:</span>
          <span className="text-emerald-300 font-bold">{inferenceLatencyMs}ms</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
        <div className="flex items-center gap-1">
          <Cpu className="h-3 w-3 text-cyan-400" />
          <span>JOB: <span className="text-slate-300 font-bold">{jobId.slice(0, 16)}</span></span>
        </div>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span>
          MODEL: <span className="text-cyan-300">{modelVersion}</span>
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span>
          OBS: <span className="text-slate-300">{lastObservationUtc}</span>
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span>
          GEN: <span className="text-slate-200">{lastInferenceUtc}</span>
        </span>
      </div>
    </div>
  );
}
