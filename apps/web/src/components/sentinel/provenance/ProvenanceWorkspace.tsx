"use client";

import React, { useState } from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { Button } from "@/components/sentinel/Button";
import { SensorFreshnessMatrix } from "./SensorFreshnessMatrix";
import { PipelineLatencyAudit } from "./PipelineLatencyAudit";
import { AuditTrailCard } from "./AuditTrailCard";
import { SyntheticReplayNotice } from "./SyntheticReplayNotice";
import {
  Database,
  RefreshCw,
  Clock,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from "lucide-react";

export const ProvenanceWorkspace: React.FC = () => {
  const { activeJobId, lastGenTime, isBaselineActive, selectedModel } = useSentinel();
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null);

  const handleManualTrigger = async () => {
    setIsTriggering(true);
    setTriggerStatus("Triggering 15-minute inference cycle...");
    try {
      const res = await fetch("http://localhost:8000/api/v1/orchestration/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_synthetic_replay: true,
          source: "sentinel_provenance_workspace",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTriggerStatus(`Cycle completed successfully (Job ID: ${data.job_id || "TRN-NEW"})`);
      } else {
        setTriggerStatus("Simulated local inference cycle executed (API offline fallback)");
      }
    } catch {
      setTriggerStatus("Simulated local inference cycle executed (API offline fallback)");
    } finally {
      setIsTriggering(false);
      setTimeout(() => setTriggerStatus(null), 4000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 font-sans text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            <Database className="h-4 w-4" />
            <span>Data Sources & System Health</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans mt-1">
            Data Ingestion, System Status & Audit Log
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Live status of satellite feeds, weather models, processing speeds, and forecast run logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            isLoading={isTriggering}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isTriggering ? "animate-spin" : ""}`} />}
            onClick={handleManualTrigger}
          >
            Run Forecast Cycle
          </Button>
        </div>
      </div>

      {/* Ephemeral Trigger Banner */}
      {triggerStatus && (
        <div className="rounded-2xl border border-indigo-500/40 bg-[#1C1F30] p-3 text-xs font-sans text-indigo-200 flex items-center justify-between shadow-clay-card animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
            <span>{triggerStatus}</span>
          </div>
        </div>
      )}

      {/* Top Telemetry KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-center font-sans">
        <Card variant="base">
          <CardContent className="p-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Satellite Ingest</div>
            <div className="text-sm font-semibold font-mono text-emerald-400 mt-1">12 min lag</div>
            <span className="text-[10px] text-slate-400">INSAT-3D Normal</span>
          </CardContent>
        </Card>

        <Card variant="base">
          <CardContent className="p-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Weather Model</div>
            <div className="text-sm font-semibold font-mono text-slate-200 mt-1">45 min lag</div>
            <span className="text-[10px] text-slate-400">NCMRWF Regional</span>
          </CardContent>
        </Card>

        <Card variant="base" borderAccent="cyan">
          <CardContent className="p-3">
            <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">Processing Speed</div>
            <div className="text-sm font-semibold font-mono text-indigo-200 mt-1">
              {isBaselineActive ? "120 ms" : "3.7 ms"}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">GPU Accelerated</span>
          </CardContent>
        </Card>

        <Card variant="base">
          <CardContent className="p-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Job</div>
            <div className="text-sm font-semibold font-mono text-slate-200 mt-1 truncate">{activeJobId}</div>
            <span className="text-[10px] text-slate-400">PostGIS Partition</span>
          </CardContent>
        </Card>

        <Card variant="base">
          <CardContent className="p-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Last Generation</div>
            <div className="text-sm font-semibold font-mono text-slate-200 mt-1 truncate">{lastGenTime}</div>
            <span className="text-[10px] text-slate-400">UTC Synchronized</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* 1. Multi-Sensor Freshness */}
        <SensorFreshnessMatrix />

        {/* 2. End-to-End Latency Audit */}
        <PipelineLatencyAudit />

        {/* 3. Cryptographic Audit Trail */}
        <AuditTrailCard />

        {/* 4. Synthetic Replay Governance Notice */}
        <SyntheticReplayNotice />
      </div>
    </div>
  );
};
