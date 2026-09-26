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
      title="SYSTEM STATUS & DATA SOURCES"
      subtitle="Live Data Feeds & Forecast Model Status"
      position="right"
      width="w-full sm:w-[420px]"
    >
      <div className="space-y-4 text-xs font-mono">
        {/* Connection & Live Heartbeat */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1D202B]/90 p-3.5 shadow-clay-btn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-400 font-bold flex items-center gap-1.5 uppercase">
              <Database className="h-3.5 w-3.5" />
              LIVE DATA CONNECTION
            </span>
            <StatusDot status={isLiveConnected ? "nominal" : "replay"} />
          </div>

          <div className="text-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Data Feed:</span>
              <span className="text-slate-200">Alerts & Forecast Channel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={isLiveConnected ? "text-emerald-400 font-bold" : "text-purple-400 font-bold"}>
                {isLiveConnected ? "CONNECTED (LIVE FEED)" : "HISTORICAL SCENARIO MODE"}
              </span>
            </div>
          </div>
        </div>

        {/* Input Data Freshness */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1D202B]/90 p-3.5 space-y-2.5 shadow-clay-btn">
          <div className="text-indigo-400 font-bold uppercase flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5" />
            WEATHER DATA SOURCES & AGE
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
              <span className="text-slate-300">Indian Weather Satellite (INSAT-3D):</span>
              <span className="text-emerald-400 font-bold">12m ago (Normal)</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
              <span className="text-slate-300">Regional Weather Forecast Model:</span>
              <span className="text-slate-200 font-bold">45m ago (Normal)</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
              <span className="text-slate-300">Dehradun Weather Radar:</span>
              <span className="text-amber-400 font-bold">Temporarily Offline (Using Satellite Data)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Terrain Elevation Map (DEM):</span>
              <span className="text-indigo-300 font-bold">Active (Topographic Base)</span>
            </div>
          </div>
        </div>

        {/* Machine Learning Model Diagnostics */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1D202B]/90 p-3.5 space-y-2 shadow-clay-btn">
          <div className="text-indigo-400 font-bold uppercase flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5" />
            FORECAST MODEL DETAILS
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Model:</span>
              <span className="text-indigo-300 font-bold">
                {isBaselineActive ? `Baseline: ${selectedModel}` : "AI Weather Model (Multi-Task Conv3D)"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Model Verification Code:</span>
              <span className="text-slate-400">9c8f2a41...b78e3f</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Forecast Speed:</span>
              <span className="text-emerald-400 font-bold">
                {isBaselineActive ? "120 ms" : "3.7 ms (GPU Accelerated)"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Forecast Run ID:</span>
              <span className="text-slate-200">{activeJobId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Last Forecast Run:</span>
              <span className="text-slate-200">{lastGenTime}</span>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="rounded-2xl border border-amber-500/40 bg-[#241F12] p-3 text-[10px] text-amber-200 leading-relaxed shadow-clay-btn">
          <strong>Safety Protocol:</strong> Automated AI forecasts serve as early advisory guidance. Official emergency dispatches are verified by certified meteorological duty officers.
        </div>

        <Button variant="secondary" className="w-full" onClick={toggleSystemDrawer}>
          Close System Panel
        </Button>
      </div>
    </Drawer>
  );
};
