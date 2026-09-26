"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import {
  Sparkles,
  AlertTriangle,
  Info,
  Sliders,
  HelpCircle,
  Activity,
  Layers,
} from "lucide-react";

interface FeatureItem {
  id: string;
  name: string;
  category: "Atmospheric" | "Satellite" | "Topographic";
  shapWeight: number; // relative weight 0 to 1
  impact: "Positive" | "Inhibiting";
  physicalMeaning: string;
  operationalInterpretation: string;
}

const ATTRIBUTION_FEATURES: FeatureItem[] = [
  {
    id: "tir1_cooling",
    name: "Satellite Cloud Cooling Rate",
    category: "Satellite",
    shapWeight: 0.342,
    impact: "Positive",
    physicalMeaning: "Rapid cooling of cloud tops indicates storm clouds are growing explosively higher into cold upper air.",
    operationalInterpretation: "Strongest indicator that heavy rain and severe weather may begin within the next 60 to 90 minutes.",
  },
  {
    id: "cape",
    name: "Atmospheric Storm Energy (CAPE)",
    category: "Atmospheric",
    shapWeight: 0.264,
    impact: "Positive",
    physicalMeaning: "Measures the warm, buoyant energy available to fuel thunderstorms. High values indicate severe storm potential.",
    operationalInterpretation: "Provides the fuel needed for strong updrafts, heavy rain bursts, and lightning.",
  },
  {
    id: "terrain_slope",
    name: "Mountain Terrain & Slope Steepness",
    category: "Topographic",
    shapWeight: 0.218,
    impact: "Positive",
    physicalMeaning: "Steep slopes (above 35°) force moisture upward and cause surface water to rush downhill into narrow valleys.",
    operationalInterpretation: "The main physical factor that turns heavy rainfall into a rapid flash flood runoff surge.",
  },
  {
    id: "tpw",
    name: "Total Atmospheric Moisture (TPW)",
    category: "Atmospheric",
    shapWeight: 0.185,
    impact: "Positive",
    physicalMeaning: "Total moisture contained in the atmospheric column. High levels indicate moisture-rich air suitable for torrential downpours.",
    operationalInterpretation: "Ensures the storm has enough water vapor to sustain prolonged heavy downpours.",
  },
  {
    id: "radar_dbz",
    name: "Weather Radar Rain Intensity",
    category: "Atmospheric",
    shapWeight: 0.152,
    impact: "Positive",
    physicalMeaning: "Radar reflectivity measuring raindrop and hail density inside the active storm cloud.",
    operationalInterpretation: "Direct real-time evidence of active downpours and hail cores already in progress.",
  },
  {
    id: "cin",
    name: "Atmospheric Cap (CIN)",
    category: "Atmospheric",
    shapWeight: 0.110,
    impact: "Inhibiting",
    physicalMeaning: "A warm atmospheric barrier layer that temporarily prevents storms from breaking out until lifted by mountains.",
    operationalInterpretation: "Acts as a lid holding back storms. When breached, stored energy releases suddenly.",
  },
  {
    id: "twi",
    name: "Ground Drainage & Saturation (TWI)",
    category: "Topographic",
    shapWeight: 0.094,
    impact: "Positive",
    physicalMeaning: "Identifies valley convergence zones and low points where rainfall naturally collects.",
    operationalInterpretation: "Pinpoints river basins and valley communities most at risk when runoff begins.",
  },
];

export const FeatureAttributionPanel: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem>(ATTRIBUTION_FEATURES[0]);

  return (
    <div className="space-y-6">
      {/* 1. Non-Causal Safety Notice */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 font-sans text-xs text-amber-200 backdrop-blur">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-amber-300 text-xs">
              Scientific Explanation Notice
            </span>
            <p className="leading-relaxed text-slate-300">
              These percentages show which atmospheric, satellite, and terrain measurements influenced the AI model&apos;s forecast most strongly. They provide operational transparency and should always be considered alongside local river gauges and official emergency directives.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Feature Importance Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Feature Ranking List */}
        <div className="lg:col-span-7 space-y-3">
          <Card variant="base">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  <CardTitle className="font-sans text-sm font-semibold">Global Feature Sensitivity Rankings</CardTitle>
                </div>
                <span className="font-sans text-xs text-slate-400">
                  Evaluated on test corpus (N=4,210)
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 p-3">
              {ATTRIBUTION_FEATURES.map((feat) => {
                const isSelected = selectedFeature.id === feat.id;
                const percentage = Math.round(feat.shapWeight * 100);

                return (
                  <div
                    key={feat.id}
                    onClick={() => setSelectedFeature(feat)}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      isSelected
                        ? "border-indigo-500/50 bg-[#1C1F30] shadow-sm"
                        : "border-white/[0.08] bg-[#111217]/70 hover:border-slate-600 hover:bg-[#1D202B]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-slate-200">{feat.name}</span>
                        <Badge
                          variant={
                            feat.category === "Satellite"
                              ? "cyan"
                              : feat.category === "Topographic"
                              ? "purple"
                              : "neutral"
                          }
                          size="xs"
                        >
                          {feat.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 font-mono font-semibold">
                        <span
                          className={
                            feat.impact === "Inhibiting" ? "text-amber-400" : "text-emerald-400"
                          }
                        >
                          {feat.impact === "Inhibiting" ? "-" : "+"}
                          {feat.shapWeight.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar visual */}
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          feat.impact === "Inhibiting"
                            ? "bg-amber-400"
                            : feat.category === "Satellite"
                            ? "bg-indigo-500"
                            : feat.category === "Topographic"
                            ? "bg-purple-400"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right: Detailed Feature Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="base" borderAccent="cyan">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <CardTitle className="font-sans text-sm font-semibold">Feature Deep Dive</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 font-sans text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Feature Identifier</span>
                <div className="text-sm font-semibold text-slate-100 font-sans mt-0.5">
                  {selectedFeature.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="cyan" size="xs">
                    {selectedFeature.category}
                  </Badge>
                  <span className="text-slate-400 text-xs">
                    SHAP Sensitivity: <strong className="text-slate-200 font-mono">{selectedFeature.shapWeight.toFixed(3)}</strong>
                  </span>
                </div>
              </div>

              <div className="border-t border-white/[0.08] pt-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Thermodynamic & Physical Role</span>
                <p className="font-sans text-xs text-slate-300 leading-relaxed mt-1">
                  {selectedFeature.physicalMeaning}
                </p>
              </div>

              <div className="border-t border-white/[0.08] pt-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Operational Nowcast Impact</span>
                <p className="font-sans text-xs text-indigo-200 leading-relaxed mt-1">
                  {selectedFeature.operationalInterpretation}
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-[#111217] p-3 text-xs text-slate-400 font-sans">
                <span className="text-indigo-300 font-semibold">Observer Note:</span> If this channel experiences sensor dropout or excessive latency (&gt; 30m), the model automatically downweights its contribution and defaults to NWP reanalysis priors.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
