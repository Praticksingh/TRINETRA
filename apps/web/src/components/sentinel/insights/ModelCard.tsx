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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C1F30] border border-indigo-500/30 text-indigo-300">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-100 font-sans">
                    AI Weather Forecasting Model
                  </h3>
                  <Badge variant="cyan" size="xs">
                    v1.0.0
                  </Badge>
                  <Badge variant="emerald" size="xs">
                    VALIDATION PASSED
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Deep Learning Model for Short-Term Severe Weather (Conv3D Architecture)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-slate-400">
                Engine: <strong className="text-slate-200 font-mono">PyTorch 2.4 + TensorRT</strong>
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <p className="text-xs leading-relaxed text-slate-300">
            This AI model estimates localized severe weather conditions across Himalayan river basins. It analyzes the last 2 hours of thermal satellite imagery (INSAT-3D/3DR), atmospheric humidity and wind data, and 30-meter terrain slope and elevation models to detect storm intensification and rapid runoff risks.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg border border-white/[0.08] bg-[#1D202B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Input Data</span>
              <div className="text-sm font-semibold font-mono text-slate-200 mt-1">10 Channels</div>
              <span className="text-[10px] text-slate-400">Satellite, radar & terrain</span>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#1D202B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Model Size</span>
              <div className="text-sm font-semibold font-mono text-indigo-300 mt-1">14.8M Parameters</div>
              <span className="text-[10px] text-slate-400">Optimized for speed</span>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#1D202B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Forecast Speed</span>
              <div className="text-sm font-semibold font-mono text-emerald-400 mt-1">3.7 ms</div>
              <span className="text-[10px] text-slate-400">Near-instant execution</span>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#1D202B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Forecast Period</span>
              <div className="text-sm font-semibold font-mono text-indigo-300 mt-1">Now to 6 Hours</div>
              <span className="text-[10px] text-slate-400">30-minute intervals</span>
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
              <Database className="h-4 w-4 text-indigo-400" />
              <CardTitle className="font-sans text-sm font-semibold">Training Data & Historical Testing</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 font-sans text-xs">
            <div className="flex justify-between border-b border-white/[0.08] pb-2">
              <span className="text-slate-400">Training Seasons:</span>
              <span className="text-slate-200 font-medium">2020 – 2024 Monsoons (Jul 1 – Sep 30)</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.08] pb-2">
              <span className="text-slate-400">Independent Test Set:</span>
              <span className="text-indigo-300 font-medium">2025 Monsoon (Independent Test Data)</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.08] pb-2">
              <span className="text-slate-400">Time Testing Integrity:</span>
              <span className="text-emerald-400 font-medium">Strict forward evaluation (no future leakage)</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.08] pb-2">
              <span className="text-slate-400">Region Covered:</span>
              <span className="text-slate-200 font-mono text-[11px]">Uttarakhand Himalayas (28.5°–31.5°N)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Severe Event Focus:</span>
              <span className="text-slate-300">Weighted for rare heavy downpours</span>
            </div>
          </CardContent>
        </Card>

        {/* Neural Network Details */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <CardTitle className="font-sans text-sm font-semibold">Forecast Output Modules</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 font-sans text-xs">
            <div className="flex justify-between border-b border-white/[0.08] pb-2">
              <span className="text-slate-400">Core Pattern Extractor:</span>
              <span className="text-slate-200 font-medium">Spatiotemporal 3D Convolutional Network</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.08] pb-2">
              <span className="text-slate-400">Module 1 (Thunderstorms):</span>
              <span className="text-slate-200">Probability of storm activity and lightning</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.08] pb-2">
              <span className="text-slate-400">Module 2 (Extremely Heavy Rain):</span>
              <span className="text-slate-200">Probability of rainfall exceeding 100 mm/h</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.08] pb-2">
              <span className="text-slate-400">Module 3 (Flash Flood Risk):</span>
              <span className="text-slate-200">Combined rainfall runoff and mountain steepness</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Multi-Task Calibration:</span>
              <span className="text-indigo-300">Uncertainty-weighted balanced training</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Deployment Specifications */}
      <Card variant="base">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-400" />
            <CardTitle className="font-sans text-sm font-semibold">Forecast Run Environment & System Specs</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-white/[0.08] bg-[#1D202B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Forecast API</span>
              <div className="text-slate-200 font-semibold mt-1">High-Throughput API Service</div>
              <span className="text-[10px] text-emerald-400 font-medium">Containerized microservice</span>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-[#1D202B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Database Storage</span>
              <div className="text-indigo-300 font-semibold mt-1">Spatial PostGIS Database</div>
              <span className="text-[10px] text-slate-400">Partitioned by forecast hour</span>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-[#1D202B] p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Memory Usage</span>
              <div className="text-slate-200 font-semibold font-mono mt-1">1.4 GB GPU / 2.1 GB RAM</div>
              <span className="text-[10px] text-slate-400">Lightweight deployment</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
