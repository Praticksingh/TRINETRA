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
    <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none text-xs font-sans text-slate-300 py-0.5">
      {/* Left: Operational Health & Feeds */}
      <div className="flex items-center gap-3.5 shrink-0">
        {/* System Health */}
        <div className="flex items-center gap-2 bg-[#111A2C] px-2.5 py-1 rounded-md border border-[#1F3350]">
          <span className="flex h-2 w-2">
            {!hasStaleFeeds ? (
              <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></span>
            ) : (
              <span className="inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            )}
          </span>
          <span className="text-slate-200 font-medium text-xs">
            {!hasStaleFeeds ? "Systems Normal" : "Data Delayed"}
          </span>
        </div>

        {/* Stale Warning Badge if feeds lag */}
        {hasStaleFeeds && (
          <div className="flex items-center gap-1 rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-700/60">
            <ShieldAlert className="h-3 w-3 text-amber-400" />
            <span>Delayed Data Feeds</span>
          </div>
        )}

        <span className="h-3.5 w-px bg-[#1F3350] hidden sm:inline-block" aria-hidden="true" />

        {/* Satellite Freshness */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Wifi className="h-3.5 w-3.5 text-sky-400" />
          <span>Satellite (INSAT):</span>
          <span
            className={
              isSatelliteStale ? "text-amber-400 font-medium" : "text-slate-200 font-mono text-[11px]"
            }
          >
            {satelliteAgeMinutes} min ago
          </span>
        </div>

        <span className="h-3.5 w-px bg-[#1F3350] hidden sm:inline-block" aria-hidden="true" />

        {/* NWP Reanalysis Freshness */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Activity className="h-3.5 w-3.5 text-indigo-400" />
          <span>Weather Model (NWP):</span>
          <span
            className={
              isNwpStale ? "text-amber-400 font-medium" : "text-slate-200 font-mono text-[11px]"
            }
          >
            {nwpAgeMinutes} min ago
          </span>
        </div>

        <span className="h-3.5 w-px bg-[#1F3350] hidden md:inline-block" aria-hidden="true" />

        {/* Pipeline Latency */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span>Processing:</span>
          <span className="text-emerald-300 font-mono text-[11px] font-semibold">{inferenceLatencyMs} ms</span>
        </div>
      </div>

      {/* Right: Job & Time Metadata */}
      <div className="hidden xl:flex items-center gap-2.5 text-slate-400 text-[11px] shrink-0">
        <div className="flex items-center gap-1">
          <Cpu className="h-3 w-3 text-sky-400" />
          <span>Job: <span className="text-slate-300 font-mono font-medium">{jobId.slice(0, 16)}</span></span>
        </div>
        <span className="text-slate-700">|</span>
        <span>
          Model: <span className="text-sky-300 font-mono">{modelVersion}</span>
        </span>
        <span className="text-slate-700">|</span>
        <span>
          Observed: <span className="text-slate-300 font-mono">{lastObservationUtc}</span>
        </span>
        <span className="text-slate-700">|</span>
        <span>
          Generated: <span className="text-slate-200 font-mono">{lastInferenceUtc}</span>
        </span>
      </div>
    </div>
  );
}
