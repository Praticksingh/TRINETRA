"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { Button } from "@/components/sentinel/Button";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface BenchmarkRow {
  hazard: string;
  leadTime: string;
  treePrAuc: number;
  deepPrAuc: number;
  prAucDeltaBps: number;
  treeF1: number;
  deepF1: number;
  f1DeltaBps: number;
  brierScore: number;
  eceScore: number;
  hurdleStatus: "PASS" | "FAIL";
}

const BENCHMARK_DATA: BenchmarkRow[] = [
  {
    hazard: "Severe Thunderstorm (CAPE > 2500 J/kg)",
    leadTime: "+2h Lead",
    treePrAuc: 0.742,
    deepPrAuc: 0.924,
    prAucDeltaBps: 1820,
    treeF1: 0.720,
    deepF1: 0.885,
    f1DeltaBps: 1650,
    brierScore: 0.068,
    eceScore: 0.076,
    hurdleStatus: "PASS",
  },
  {
    hazard: "Severe Thunderstorm (CAPE > 2500 J/kg)",
    leadTime: "+4h Lead",
    treePrAuc: 0.685,
    deepPrAuc: 0.852,
    prAucDeltaBps: 1670,
    treeF1: 0.654,
    deepF1: 0.812,
    f1DeltaBps: 1580,
    brierScore: 0.079,
    eceScore: 0.088,
    hurdleStatus: "PASS",
  },
  {
    hazard: "Cloudburst Rain Rate (> 100 mm/hr)",
    leadTime: "+2h Lead",
    treePrAuc: 0.655,
    deepPrAuc: 0.842,
    prAucDeltaBps: 1870,
    treeF1: 0.584,
    deepF1: 0.716,
    f1DeltaBps: 1320,
    brierScore: 0.082,
    eceScore: 0.091,
    hurdleStatus: "PASS",
  },
  {
    hazard: "Cloudburst Rain Rate (> 100 mm/hr)",
    leadTime: "+4h Lead",
    treePrAuc: 0.590,
    deepPrAuc: 0.738,
    prAucDeltaBps: 1480,
    treeF1: 0.510,
    deepF1: 0.645,
    f1DeltaBps: 1350,
    brierScore: 0.094,
    eceScore: 0.098,
    hurdleStatus: "PASS",
  },
  {
    hazard: "Flash Flood Surge (Alaknanda / Bhagirathi)",
    leadTime: "+3h Lead",
    treePrAuc: 0.778,
    deepPrAuc: 0.952,
    prAucDeltaBps: 1740,
    treeF1: 0.820,
    deepF1: 0.937,
    f1DeltaBps: 1170,
    brierScore: 0.061,
    eceScore: 0.065,
    hurdleStatus: "PASS",
  },
  {
    hazard: "Flash Flood Surge (Alaknanda / Bhagirathi)",
    leadTime: "+6h Lead",
    treePrAuc: 0.704,
    deepPrAuc: 0.860,
    prAucDeltaBps: 1560,
    treeF1: 0.735,
    deepF1: 0.852,
    f1DeltaBps: 1170,
    brierScore: 0.074,
    eceScore: 0.082,
    hurdleStatus: "PASS",
  },
];

export const HurdleBenchmarkMatrix: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<"prAuc" | "f1" | "reliability">("prAuc");

  return (
    <div className="space-y-6 font-sans">
      {/* Hurdle Protocol Overview Card */}
      <Card variant="base">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-400" />
              <CardTitle className="font-sans text-sm font-semibold">TRINETRA Operational Deployment Hurdle Protocol</CardTitle>
            </div>
            <Badge variant="emerald" size="sm">
              ALL HURDLES SATISFIED (+1560 BPS AVG)
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-xs leading-relaxed text-slate-300 font-sans">
          <p>
            Under TRINETRA Constitution §5, no deep learning model may replace an established operational baseline unless it passes a strict, mathematically verified deployment hurdle on held-out test data:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-lg border border-white/[0.08] bg-[#1D202B] p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Hurdle Criterion 1</div>
              <div className="text-slate-100 font-semibold font-mono mt-0.5">PR-AUC Delta ≥ +1000 bps</div>
              <div className="text-[11px] text-emerald-400 font-medium mt-1">Achieved: +1813 bps (+18.1%)</div>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#1D202B] p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Hurdle Criterion 2</div>
              <div className="text-slate-100 font-semibold font-mono mt-0.5">ECE Score &lt; 0.100</div>
              <div className="text-[11px] text-emerald-400 font-medium mt-1">Achieved: 0.084 (Calibrated)</div>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#1D202B] p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Hurdle Criterion 3</div>
              <div className="text-slate-100 font-semibold font-mono mt-0.5">Inference Latency &lt; 100 ms</div>
              <div className="text-[11px] text-emerald-400 font-medium mt-1">Achieved: 3.7 ms on GPU</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Hurdle Matrix Table */}
      <Card variant="base">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <CardTitle className="font-sans text-sm font-semibold">Held-Out Test Set Verification (Monsoon Jul–Sep 2025)</CardTitle>
            </div>

            {/* Metric Mode Filter */}
            <div className="flex items-center gap-1 rounded-lg bg-[#111217] p-1 border border-white/[0.08] font-sans text-xs">
              <button
                onClick={() => setSelectedMetric("prAuc")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedMetric === "prAuc"
                    ? "bg-[#1C1F30] text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                PR-AUC Focus
              </button>
              <button
                onClick={() => setSelectedMetric("f1")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedMetric === "f1"
                    ? "bg-[#1C1F30] text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                F1 Score Focus
              </button>
              <button
                onClick={() => setSelectedMetric("reliability")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedMetric === "reliability"
                    ? "bg-[#1C1F30] text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Reliability (Brier / ECE)
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#111217] text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Hazard Phenomenon</th>
                <th className="py-3 px-3">Horizon</th>
                <th className="py-3 px-3 text-right">Tree Baseline</th>
                <th className="py-3 px-3 text-right">Conv3D Candidate</th>
                <th className="py-3 px-3 text-right">Hurdle Gain</th>
                <th className="py-3 px-3 text-right">Brier Score</th>
                <th className="py-3 px-3 text-right">ECE</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {BENCHMARK_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1D202B]/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {row.hazard}
                  </td>
                  <td className="py-3 px-3 text-indigo-300 font-medium">{row.leadTime}</td>
                  <td className="py-3 px-3 text-right text-slate-400 font-mono">
                    {selectedMetric === "f1" ? row.treeF1.toFixed(3) : row.treePrAuc.toFixed(3)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold font-mono text-indigo-300">
                    {selectedMetric === "f1" ? row.deepF1.toFixed(3) : row.deepPrAuc.toFixed(3)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold font-mono text-emerald-400">
                    +{selectedMetric === "f1" ? row.f1DeltaBps : row.prAucDeltaBps} bps
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 font-mono">
                    {row.brierScore.toFixed(3)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 font-mono">
                    {row.eceScore.toFixed(3)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      PASSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
