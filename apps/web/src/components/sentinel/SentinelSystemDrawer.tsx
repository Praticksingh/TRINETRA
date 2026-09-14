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
        <div className="rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#36D9E8] font-bold flex items-center gap-1.5 uppercase">
              <Database className="h-3.5 w-3.5" />
              POSTGIS REAL-TIME FEED
            </span>
            <StatusDot status={isLiveConnected ? "nominal" : "replay"} />
          </div>

          <div className="text-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#91A5BB]">Channel:</span>
              <span className="text-slate-200">public.alerts (PostgreSQL 15)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#91A5BB]">State:</span>
              <span className={isLiveConnected ? "text-emerald-400 font-bold" : "text-purple-400 font-bold"}>
                {isLiveConnected ? "CONNECTED (WEBSOCKET LIVE)" : "SYNTHETIC REPLAY FALLBACK"}
              </span>
            </div>
          </div>
        </div>

        {/* Input Data Freshness */}
        <div className="rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-3 space-y-2.5">
          <div className="text-[#36D9E8] font-bold uppercase flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5" />
            SENSOR FEED FRESHNESS
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between border-b border-[#1F3350]/60 pb-1.5">
              <span className="text-slate-300">INSAT-3D Rapid Scan (TIR1):</span>
              <span className="text-emerald-400 font-bold">12m ago (Nominal)</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#1F3350]/60 pb-1.5">
              <span className="text-slate-300">NWP High-Res Reanalysis:</span>
              <span className="text-slate-200 font-bold">45m ago (Nominal)</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#1F3350]/60 pb-1.5">
              <span className="text-slate-300">Dehradun C-Band DWR Radar:</span>
              <span className="text-amber-400 font-bold">Offline (Optical Fill)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">ALOS 30m Hydro DEM:</span>
              <span className="text-cyan-300 font-bold">Static Infiltration Prior</span>
            </div>
          </div>
        </div>

        {/* Machine Learning Model Diagnostics */}
        <div className="rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-3 space-y-2">
          <div className="text-[#36D9E8] font-bold uppercase flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5" />
            MODEL RUNTIME METRICS
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-[#91A5BB]">Active Checkpoint:</span>
              <span className="text-[#36D9E8] font-bold">
                {isBaselineActive ? `v0.1.0-${selectedModel}` : "v1.0.0-conv3d-multitask"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#91A5BB]">SHA-256 Digest:</span>
              <span className="text-slate-400">9c8f2a41...b78e3f</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#91A5BB]">Inference Latency:</span>
              <span className="text-emerald-400 font-bold">
                {isBaselineActive ? "120 ms" : "3.7 ms (CUDA / ONNX)"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#91A5BB]">Active Job ID:</span>
              <span className="text-slate-200">{activeJobId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#91A5BB]">Last Execution:</span>
              <span className="text-slate-200">{lastGenTime}</span>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="rounded border border-amber-800/60 bg-amber-950/40 p-2.5 text-[10px] text-amber-200 leading-relaxed">
          <strong>Mandatory Protocol:</strong> Algorithmic nowcasts remain <em>MODEL ADVISORIES</em> until verified and dispatched by authorized SDMA/SEOC meteorological duty officers.
        </div>

        <Button variant="secondary" className="w-full" onClick={toggleSystemDrawer}>
          Close Telemetry Panel
        </Button>
      </div>
    </Drawer>
  );
};
