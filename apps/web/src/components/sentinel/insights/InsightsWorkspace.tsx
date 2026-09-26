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
  Activity,
  Layers,
  ShieldAlert,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
} from "lucide-react";

type InsightTab = "attribution" | "confidence" | "model" | "limitations";

export const InsightsWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InsightTab>("attribution");
  const [showTechnicalEvidence, setShowTechnicalEvidence] = useState<boolean>(false);

  const handleExportModelDetails = () => {
    const modelCardJson = {
      model_name: "Conv3D-MultiTask-Nowcast",
      version: "v1.0.0-production-candidate",
      verification: {
        status: "CERTIFIED_OPERATIONAL",
        pr_auc: 0.856,
        f1_score: 0.835,
        brier_score: 0.070,
        expected_calibration_error: 0.084,
        inference_latency_ms: 3.7,
      },
      inputs: [
        "INSAT-3D Infrared (TIR1/TIR2)",
        "Doppler Weather Radar (Dehradun)",
        "IMD WRF Numerical Weather Models",
        "SRTM 30m Digital Elevation Model",
      ],
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
    a.download = `trinetra_forecast_analysis_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2330] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
            <Activity className="h-4 w-4" />
            <span>Prediction Insights & Evidence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans mt-0.5">
            Forecast Analysis
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Understanding what the weather model sees, how confident it is, and what factors drove the prediction.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="h-3.5 w-3.5 text-indigo-400" />}
          onClick={handleExportModelDetails}
        >
          Export Analysis Data
        </Button>
      </div>

      {/* 2. Plain English Human Summary Banner (Rule 17) */}
      <Card variant="base" className="border-l-4 border-l-indigo-500 bg-[#121522]">
        <CardContent className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-300">
              Model Reasoning Summary
            </span>
            <Badge severity="low" size="xs">High confidence</Badge>
          </div>
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            Rainfall intensity and steep mountain terrain are the strongest factors behind the current flash-flood risk.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Satellite observations indicate rapid convective cloud cooling (-21.4 K/hr) over the Mandakini basin. Combined with terrain slope angles above 40°, water is projected to drain into valley bottoms in under 45 minutes, creating heightened flood susceptibility.
          </p>

          <div className="pt-2 border-t border-[#1E2330] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>Primary Driver: <strong className="text-white">Rainfall + Steep Gorges</strong></span>
              <span>•</span>
              <span>Speed: <strong className="text-emerald-400 font-mono">3.7 ms</strong></span>
            </div>

            <button
              onClick={() => setShowTechnicalEvidence(!showTechnicalEvidence)}
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              <span>{showTechnicalEvidence ? "Hide scientific evidence" : "Show scientific evidence"}</span>
              {showTechnicalEvidence ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Technical Evidence Panel (Collapsed by default - Rule 17) */}
          {showTechnicalEvidence && (
            <div className="mt-3 rounded-lg border border-[#232736] bg-[#0E1017] p-3 text-xs text-slate-300 space-y-2 animate-in fade-in duration-150">
              <div className="text-[11px] font-semibold text-slate-200">
                Mathematical Verification & Benchmark Performance
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="bg-[#141722] p-2 rounded border border-[#1E2330]">
                  <div className="text-slate-400">Event Detection</div>
                  <div className="font-mono font-medium text-emerald-400 mt-0.5">0.856</div>
                  <div className="text-[9px] text-slate-500">PR-AUC (+18.1% over baseline)</div>
                </div>
                <div className="bg-[#141722] p-2 rounded border border-[#1E2330]">
                  <div className="text-slate-400">Prediction Accuracy</div>
                  <div className="font-mono font-medium text-emerald-400 mt-0.5">0.835</div>
                  <div className="text-[9px] text-slate-500">F1 Score (+15.6% improvement)</div>
                </div>
                <div className="bg-[#141722] p-2 rounded border border-[#1E2330]">
                  <div className="text-slate-400">Forecast Calibration</div>
                  <div className="font-mono font-medium text-slate-200 mt-0.5">0.070</div>
                  <div className="text-[9px] text-slate-500">Brier Score (Strictly &lt; 0.10)</div>
                </div>
                <div className="bg-[#141722] p-2 rounded border border-[#1E2330]">
                  <div className="text-slate-400">Inference Latency</div>
                  <div className="font-mono font-medium text-emerald-400 mt-0.5">3.7 ms</div>
                  <div className="text-[9px] text-slate-500">TensorRT FP16 Execution</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Analysis Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#1E2330] pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab("attribution")}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === "attribution"
              ? "bg-[#181C28] text-indigo-300 font-medium border border-indigo-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          What Influenced the Forecast
        </button>

        <button
          onClick={() => setActiveTab("confidence")}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === "confidence"
              ? "bg-[#181C28] text-indigo-300 font-medium border border-indigo-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Model Confidence & Benchmarks
        </button>

        <button
          onClick={() => setActiveTab("model")}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === "model"
              ? "bg-[#181C28] text-indigo-300 font-medium border border-indigo-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Model Architecture
        </button>

        <button
          onClick={() => setActiveTab("limitations")}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === "limitations"
              ? "bg-[#181C28] text-indigo-300 font-medium border border-indigo-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Known Limitations
        </button>
      </div>

      {/* 4. Tab Content Panels */}
      <div>
        {activeTab === "attribution" && <FeatureAttributionPanel />}
        {activeTab === "confidence" && <HurdleBenchmarkMatrix />}
        {activeTab === "model" && <ModelCard />}
        {activeTab === "limitations" && <OperationalLimitationsCard />}
      </div>
    </div>
  );
};
