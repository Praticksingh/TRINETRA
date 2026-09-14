"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { Button } from "@/components/sentinel/Button";
import { ModelCard } from "./ModelCard";
import { HurdleBenchmarkMatrix } from "./HurdleBenchmarkMatrix";
import { FeatureAttributionPanel } from "./FeatureAttributionPanel";
import { OperationalLimitationsCard } from "./OperationalLimitationsCard";
import {
  Cpu,
  BarChart3,
  Sparkles,
  ShieldAlert,
  Download,
  FileCode,
  Activity,
  CheckCircle2,
  Award,
} from "lucide-react";

type InsightTab = "benchmarks" | "model_card" | "xai" | "limitations";

export const InsightsWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InsightTab>("benchmarks");

  const handleExportModelCardJson = () => {
    const modelCardJson = {
      model_name: "Conv3D-MultiTask-Nowcast",
      version: "v1.0.0-production-candidate",
      hurdle_verification: {
        status: "CERTIFIED_OPERATIONAL",
        pr_auc_delta_bps: 1813,
        f1_delta_bps: 1560,
        brier_score: 0.070,
        expected_calibration_error: 0.084,
        inference_latency_ms: 3.7,
      },
      architecture: {
        backbone: "3D ResNet-18 Spatiotemporal",
        input_tensor_shape: [null, 10, 4, 32, 32],
        parameters: 14820000,
        lookback_window: "2 hours (4 x 30m frames)",
        forecast_horizons: ["T+1h", "T+2h", "T+3h", "T+4h", "T+5h", "T+6h"],
      },
      safety_guardrails: {
        is_official_warning: false,
        non_causal_attribution: true,
        radar_occlusion_mitigation: true,
      },
    };

    const blob = new Blob([JSON.stringify(modelCardJson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trinetra_model_card_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2D4A] pb-4">
        <div>
          <div className="flex items-center gap-2 font-sans text-xs text-[#38BDF8] font-semibold uppercase tracking-wider">
            <Cpu className="h-4 w-4" />
            <span>AI Model Analysis & Verification</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans mt-1">
            AI Model Performance & Analysis
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Accuracy benchmarks, model architecture, factor influence, and operational limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5 text-[#38BDF8]" />}
            onClick={handleExportModelCardJson}
          >
            Export Model Card (JSON)
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Hurdle KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center font-sans">
        <Card variant="base">
          <CardContent className="p-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Active Model</div>
            <div className="text-sm font-bold text-slate-200 mt-1">Conv3D Multi-Task</div>
            <span className="text-[10px] text-emerald-400 font-medium">Production Candidate</span>
          </CardContent>
        </Card>

        <Card variant="base" borderAccent="cyan">
          <CardContent className="p-3">
            <div className="text-[10px] text-[#38BDF8] uppercase tracking-wider font-semibold">PR-AUC Gain</div>
            <div className="text-sm font-bold text-sky-300 mt-1">0.906 (+1813 bps)</div>
            <span className="text-[10px] text-emerald-400 font-medium">Hurdle cleared</span>
          </CardContent>
        </Card>

        <Card variant="base" borderAccent="cyan">
          <CardContent className="p-3">
            <div className="text-[10px] text-[#38BDF8] uppercase tracking-wider font-semibold">F1 Accuracy Gain</div>
            <div className="text-sm font-bold text-sky-300 mt-1">0.864 (+1560 bps)</div>
            <span className="text-[10px] text-emerald-400 font-medium">Hurdle cleared</span>
          </CardContent>
        </Card>

        <Card variant="base">
          <CardContent className="p-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Brier Reliability</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">0.070</div>
            <span className="text-[10px] text-slate-400">Target &lt; 0.100</span>
          </CardContent>
        </Card>

        <Card variant="base">
          <CardContent className="p-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Calibration Error</div>
            <div className="text-sm font-bold text-slate-200 mt-1">0.084</div>
            <span className="text-[10px] text-slate-400">Calibrated</span>
          </CardContent>
        </Card>

        <Card variant="base">
          <CardContent className="p-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Speed (Latency)</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">3.7 ms</div>
            <span className="text-[10px] text-slate-400">GPU TensorRT</span>
          </CardContent>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-[#1E2D4A] font-sans text-xs">
        <button
          onClick={() => setActiveTab("benchmarks")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-colors border-b-2 ${
            activeTab === "benchmarks"
              ? "border-[#38BDF8] text-[#38BDF8] bg-[#16233B]/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Performance Benchmarks</span>
        </button>

        <button
          onClick={() => setActiveTab("model_card")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-colors border-b-2 ${
            activeTab === "model_card"
              ? "border-[#38BDF8] text-[#38BDF8] bg-[#16233B]/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>Model Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab("xai")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-colors border-b-2 ${
            activeTab === "xai"
              ? "border-[#38BDF8] text-[#38BDF8] bg-[#16233B]/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Factor Analysis (XAI)</span>
        </button>

        <button
          onClick={() => setActiveTab("limitations")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-colors border-b-2 ${
            activeTab === "limitations"
              ? "border-[#38BDF8] text-[#38BDF8] bg-[#16233B]/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Failure Modes & Safety</span>
        </button>
      </div>

      {/* 4. Active Tab Content */}
      <div>
        {activeTab === "benchmarks" && <HurdleBenchmarkMatrix />}
        {activeTab === "model_card" && <ModelCard />}
        {activeTab === "xai" && <FeatureAttributionPanel />}
        {activeTab === "limitations" && <OperationalLimitationsCard />}
      </div>
    </div>
  );
};
