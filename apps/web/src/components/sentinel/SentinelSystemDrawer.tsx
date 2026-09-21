"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Drawer } from "@/components/sentinel/Drawer";
import { StatusDot } from "@/components/sentinel/StatusDot";
import { Button } from "@/components/sentinel/Button";
import { Activity, Wifi, Database, Cpu, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export const SentinelSystemDrawer: React.FC = () => {
  const {
    isSystemDrawerOpen,
    toggleSystemDrawer,
    activeJobId,
    lastGenTime,
    selectedModel,
    isBaselineActive,
    isLiveConnected,
  } = useSentinel();

  return (
    <Drawer
      isOpen={isSystemDrawerOpen}
      onClose={toggleSystemDrawer}
      title="SYSTEM TELEMETRY & PROVENANCE"
      subtitle="Data Pipeline Ingestion & Model Diagnostics"
      position="right"
      width="w-full sm:w-[420px]"
    >
      <div className="space-y-4 text-xs font-mono">
        {/* Connection & Live Heartbeat */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1D202B]/90 p-3.5 shadow-clay-btn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-400 font-bold flex items-center gap-1.5 uppercase">
              <Database className="h-3.5 w-3.5" />
              POSTGIS REAL-TIME FEED
            </span>
            <StatusDot status={isLiveConnected ? "nominal" : "replay"} />
          </div>

          <div className="text-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Channel:</span>
              <span className="text-slate-200">public.alerts (PostgreSQL 15)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">State:</span>
              <span className={isLiveConnected ? "text-emerald-400 font-bold" : "text-purple-400 font-bold"}>
                {isLiveConnected ? "CONNECTED (WEBSOCKET LIVE)" : "SYNTHETIC REPLAY FALLBACK"}
              </span>
            </div>
          </div>
        </div>

        {/* Input Data Freshness */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1D202B]/90 p-3.5 space-y-2.5 shadow-clay-btn">
          <div className="text-indigo-400 font-bold uppercase flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5" />
            SENSOR FEED FRESHNESS
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
              <span className="text-slate-300">INSAT-3D Rapid Scan (TIR1):</span>
              <span className="text-emerald-400 font-bold">12m ago (Nominal)</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
              <span className="text-slate-300">NWP High-Res Reanalysis:</span>
              <span className="text-slate-200 font-bold">45m ago (Nominal)</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
              <span className="text-slate-300">Dehradun C-Band DWR Radar:</span>
              <span className="text-amber-400 font-bold">Offline (Optical Fill)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">ALOS 30m Hydro DEM:</span>
              <span className="text-indigo-300 font-bold">Static Infiltration Prior</span>
            </div>
          </div>
        </div>

        {/* Machine Learning Model Diagnostics */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1D202B]/90 p-3.5 space-y-2 shadow-clay-btn">
          <div className="text-indigo-400 font-bold uppercase flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5" />
            MODEL RUNTIME METRICS
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Checkpoint:</span>
              <span className="text-indigo-300 font-bold">
                {isBaselineActive ? `v0.1.0-${selectedModel}` : "v1.0.0-conv3d-multitask"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">SHA-256 Digest:</span>
              <span className="text-slate-400">9c8f2a41...b78e3f</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Inference Latency:</span>
              <span className="text-emerald-400 font-bold">
                {isBaselineActive ? "120 ms" : "3.7 ms (CUDA / ONNX)"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Active Job ID:</span>
              <span className="text-slate-200">{activeJobId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Last Execution:</span>
              <span className="text-slate-200">{lastGenTime}</span>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="rounded-2xl border border-amber-500/40 bg-[#241F12] p-3 text-[10px] text-amber-200 leading-relaxed shadow-clay-btn">
          <strong>Mandatory Protocol:</strong> Algorithmic nowcasts remain <em>MODEL ADVISORIES</em> until verified and dispatched by authorized SDMA/SEOC meteorological duty officers.
        </div>

        <Button variant="secondary" className="w-full" onClick={toggleSystemDrawer}>
          Close Telemetry Panel
        </Button>
      </div>
    </Drawer>
  );
};
