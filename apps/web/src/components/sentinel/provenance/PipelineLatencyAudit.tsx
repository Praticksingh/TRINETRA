"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { Zap, Clock, Server, CheckCircle2, Cpu, Database } from "lucide-react";

interface LatencyStage {
  name: string;
  category: "Ingestion" | "Preprocessing" | "GPU Inference" | "Persistence" | "Alert Dispatch";
  durationMs: number;
  slaTargetMs: number;
  workerEngine: string;
}

const LATENCY_STAGES: LatencyStage[] = [
  {
    name: "INSAT HDF5 Satellite Ingest & Radiometric Calibration",
    category: "Ingestion",
    durationMs: 1200,
    slaTargetMs: 2500,
    workerEngine: "FastAPI Async Ingestion Daemon",
  },
  {
    name: "GDAL / Rasterio Reprojection to EPSG:4326 Grid",
    category: "Preprocessing",
    durationMs: 820,
    slaTargetMs: 1500,
    workerEngine: "GeoPandas / Xarray Multiprocessing",
  },
  {
    name: "NWP Atmospheric Feature Extraction (CAPE, CIN, TPW)",
    category: "Preprocessing",
    durationMs: 410,
    slaTargetMs: 800,
    workerEngine: "NCMRWF GRIB2 Parser",
  },
  {
    name: "ALOS 30m Topographic Vulnerability Lookup (S_terrain)",
    category: "Preprocessing",
    durationMs: 180,
    slaTargetMs: 400,
    workerEngine: "Rasterio Windowed DEM Fetch",
  },
  {
    name: "Conv3D Spatiotemporal Multi-Task Neural Forward Pass",
    category: "GPU Inference",
    durationMs: 3.7,
    slaTargetMs: 50,
    workerEngine: "NVIDIA TensorRT FP16 Engine",
  },
  {
    name: "Supabase PostGIS Batch Insert & Spatial Index Update",
    category: "Persistence",
    durationMs: 14.2,
    slaTargetMs: 100,
    workerEngine: "PostgreSQL 16 Partitioned Table",
  },
  {
    name: "SEOC Alert Deduplication & OASIS CAP Dispatch Check",
    category: "Alert Dispatch",
    durationMs: 5.1,
    slaTargetMs: 50,
    workerEngine: "Sentinel Alert Evaluator",
  },
];

export const PipelineLatencyAudit: React.FC = () => {
  const totalLatencyMs = LATENCY_STAGES.reduce((sum, s) => sum + s.durationMs, 0);

  return (
    <Card variant="base">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#36D9E8]" />
            <CardTitle>End-to-End Inference Cycle Latency Audit</CardTitle>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#91A5BB]">TOTAL CYCLE:</span>
            <strong className="text-emerald-400">
              {(totalLatencyMs / 1000).toFixed(2)}s / 5.0s SLA
            </strong>
            <Badge variant="emerald" size="xs">
              47% OF SLA BUDGET
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 font-mono text-xs">
        {/* Latency Stages List */}
        <div className="space-y-2">
          {LATENCY_STAGES.map((stage, idx) => {
            const isGpu = stage.category === "GPU Inference";
            const percentOfTotal = ((stage.durationMs / totalLatencyMs) * 100).toFixed(1);

            return (
              <div
                key={idx}
                className="rounded-lg border border-[#1E2D4A] bg-[#16233B]/70 p-3 flex flex-wrap items-center justify-between gap-2 font-sans text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-sans font-semibold text-slate-200">{stage.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{stage.workerEngine}</span>
                      <span>•</span>
                      <span className="text-slate-400">{percentOfTotal}% of cycle</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Execution Time</span>
                    <span
                      className={`font-semibold font-mono ${
                        isGpu ? "text-[#38BDF8]" : "text-slate-200"
                      }`}
                    >
                      {stage.durationMs < 10
                        ? `${stage.durationMs} ms`
                        : `${(stage.durationMs / 1000).toFixed(2)} s`}
                    </span>
                  </div>

                  <Badge
                    variant={
                      isGpu
                        ? "cyan"
                        : stage.category === "Ingestion"
                        ? "neutral"
                        : stage.category === "Persistence"
                        ? "purple"
                        : "neutral"
                    }
                    size="xs"
                  >
                    {stage.category}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Latency SLA Summary Card */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 flex flex-wrap items-center justify-between gap-2 text-emerald-300 font-sans text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Operational SLA Target: Latency budget strictly capped at &lt; 5.0 seconds.</span>
          </div>
          <span className="text-xs text-slate-400">
            GPU Neural Forward Pass: <strong className="text-emerald-300 font-mono">3.7 ms</strong>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
