"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import {
  Cpu,
  Database,
  Layers,
  Calendar,
  Clock,
  Zap,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Server,
  Activity,
} from "lucide-react";

export const ModelCard: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      {/* Model Overview Banner */}
      <Card variant="base" borderAccent="cyan">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16233B] border border-sky-500/30 text-[#38BDF8]">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-100 font-sans">
                    Conv3D-MultiTask-Nowcast
                  </h3>
                  <Badge variant="cyan" size="xs">
                    v1.0.0-PROD-CANDIDATE
                  </Badge>
                  <Badge variant="emerald" size="xs">
                    HURDLE PASSED
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Spatiotemporal 3D Convolutional Neural Network with Multi-Hazard Decoders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-slate-400">
                Framework: <strong className="text-slate-200 font-mono">PyTorch 2.4 + TensorRT</strong>
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <p className="text-xs leading-relaxed text-slate-300">
            The <strong>Conv3D Multi-Task Nowcaster</strong> is TRINETRA&apos;s authoritative neural backbone for hyper-local convective weather prediction. It processes a spatio-temporal tensor comprising 4 consecutive frames (2-hour lookback window @ 30-min cadence) of INSAT-3D/3DR Thermal Infrared-1 (TIR1) brightness temperatures, tightly fused with 6 NWP atmospheric variables and 30m ALOS AW3D30 topographic curvature layers.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Input Tensor</span>
              <div className="text-sm font-semibold font-mono text-slate-200 mt-1">[B, 10, 4, 32, 32]</div>
              <span className="text-[10px] text-slate-400">10 channels × 4 timesteps</span>
            </div>

            <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Parameters</span>
              <div className="text-sm font-semibold font-mono text-[#38BDF8] mt-1">14.82 Million</div>
              <span className="text-[10px] text-slate-400">FP16 Quantized Engine</span>
            </div>

            <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Inference Latency</span>
              <div className="text-sm font-semibold font-mono text-emerald-400 mt-1">3.7 ms</div>
              <span className="text-[10px] text-slate-400">NVIDIA L4 TensorRT</span>
            </div>

            <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Target Horizons</span>
              <div className="text-sm font-semibold font-mono text-sky-300 mt-1">T+1h to T+6h</div>
              <span className="text-[10px] text-slate-400">30-min discrete steps</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture & Training Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Training Data Details */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[#38BDF8]" />
              <CardTitle className="font-sans text-sm font-semibold">Training Corpus & Temporal Split</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 font-sans text-xs">
            <div className="flex justify-between border-b border-[#1E2D4A] pb-2">
              <span className="text-slate-400">Training Seasons:</span>
              <span className="text-slate-200 font-medium">2020 – 2024 Monsoons (Jul 1 – Sep 30)</span>
            </div>
            <div className="flex justify-between border-b border-[#1E2D4A] pb-2">
              <span className="text-slate-400">Held-Out Test Split:</span>
              <span className="text-[#38BDF8] font-medium">2025 Monsoon (Jul 1 – Sep 30, 2025)</span>
            </div>
            <div className="flex justify-between border-b border-[#1E2D4A] pb-2">
              <span className="text-slate-400">Temporal Leakage Guard:</span>
              <span className="text-emerald-400 font-medium">Enforced strictly forward (no lookahead)</span>
            </div>
            <div className="flex justify-between border-b border-[#1E2D4A] pb-2">
              <span className="text-slate-400">Spatial Domain:</span>
              <span className="text-slate-200 font-mono text-[11px]">28.5°N–31.5°N, 77.5°E–81.0°E (Uttarakhand)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Event Sampling:</span>
              <span className="text-slate-300">Extreme-value rebalancing (Focal Loss &gamma;=2)</span>
            </div>
          </CardContent>
        </Card>

        {/* Neural Network Details */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#38BDF8]" />
              <CardTitle className="font-sans text-sm font-semibold">Multi-Head Decoder Architecture</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 font-sans text-xs">
            <div className="flex justify-between border-b border-[#1E2D4A] pb-2">
              <span className="text-slate-400">Backbone Encoder:</span>
              <span className="text-slate-200 font-medium">3D ResNet-18 (Spatiotemporal)</span>
            </div>
            <div className="flex justify-between border-b border-[#1E2D4A] pb-2">
              <span className="text-slate-400">Decoder 1 (Thunderstorm):</span>
              <span className="text-slate-200">Binary Cross-Entropy with Logit Calibration</span>
            </div>
            <div className="flex justify-between border-b border-[#1E2D4A] pb-2">
              <span className="text-slate-400">Decoder 2 (Cloudburst):</span>
              <span className="text-slate-200">Focal Loss (&alpha;=0.25, &gamma;=2.0)</span>
            </div>
            <div className="flex justify-between border-b border-[#1E2D4A] pb-2">
              <span className="text-slate-400">Decoder 3 (Flash Flood):</span>
              <span className="text-slate-200">Terrain-Gated Composite Decoupler</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Loss Balancing:</span>
              <span className="text-[#38BDF8]">Kendall & Gal Uncertainty Weighting</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Deployment Specifications */}
      <Card variant="base">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-400" />
            <CardTitle className="font-sans text-sm font-semibold">Inference Container & Runtime Constraints</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Inference Service</span>
              <div className="text-slate-200 font-semibold mt-1">FastAPI + Uvicorn Worker</div>
              <span className="text-[10px] text-emerald-400 font-medium">Stateless containerized process</span>
            </div>
            <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Persistence Target</span>
              <div className="text-[#38BDF8] font-semibold mt-1">Supabase PostGIS</div>
              <span className="text-[10px] text-slate-400">Partitioned by forecast hour</span>
            </div>
            <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Memory Footprint</span>
              <div className="text-slate-200 font-semibold font-mono mt-1">1.4 GB VRAM / 2.1 GB RAM</div>
              <span className="text-[10px] text-slate-400">Zero host memory leakage</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
