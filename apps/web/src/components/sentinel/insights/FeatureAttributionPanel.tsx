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
    name: "TIR1 Cloud-Top Cooling Rate (dT/dt)",
    category: "Satellite",
    shapWeight: 0.342,
    impact: "Positive",
    physicalMeaning: "Rapid cooling (< -12 K/hr) signals explosive vertical updraft and cloud-top expansion into the cold upper troposphere.",
    operationalInterpretation: "Primary trigger for cloudburst initiation within the subsequent 60–90 minutes.",
  },
  {
    id: "cape",
    name: "Convective Available Potential Energy (CAPE)",
    category: "Atmospheric",
    shapWeight: 0.264,
    impact: "Positive",
    physicalMeaning: "Integrates positive buoyant energy available to an ascending air parcel. Values > 2500 J/kg represent extreme thermodynamic instability.",
    operationalInterpretation: "Furnishes kinetic energy required for severe severe updrafts and severe lightning strikes.",
  },
  {
    id: "terrain_slope",
    name: "30m Topographic Slope Angle & Curvature",
    category: "Topographic",
    shapWeight: 0.218,
    impact: "Positive",
    physicalMeaning: "High slope gradients (> 35°) accelerate mechanical orographic lift and surface overland runoff convergence into narrow ravines.",
    operationalInterpretation: "Decoupled static terrain vulnerability prior that amplifies flash flood runoff surge.",
  },
  {
    id: "tpw",
    name: "Total Precipitable Water (TPW)",
    category: "Atmospheric",
    shapWeight: 0.185,
    impact: "Positive",
    physicalMeaning: "Total atmospheric water vapor contained in a vertical column. Values > 50 mm indicate deep tropical moisture availability.",
    operationalInterpretation: "Provides the moisture reservoir required for sustained torrential rainfall rates.",
  },
  {
    id: "radar_dbz",
    name: "Doppler Radar Reflectivity Core (dBZ)",
    category: "Atmospheric",
    shapWeight: 0.152,
    impact: "Positive",
    physicalMeaning: "Hydrometeor backscatter power. Cores exceeding 45 dBZ above the freezing level indicate heavy graupel/hail loading.",
    operationalInterpretation: "Direct evidence of mature multicellular convective storm core.",
  },
  {
    id: "cin",
    name: "Convective Inhibition (CIN)",
    category: "Atmospheric",
    shapWeight: 0.110,
    impact: "Inhibiting",
    physicalMeaning: "Negative energy barrier preventing parcels from reaching Level of Free Convection (LFC).",
    operationalInterpretation: "Acts as a cap. Strong CIN suppresses storm initiation despite high CAPE until breached by orographic lift.",
  },
  {
    id: "twi",
    name: "Topographic Wetness Index (TWI)",
    category: "Topographic",
    shapWeight: 0.094,
    impact: "Positive",
    physicalMeaning: "Ratio of upslope contributing drainage area to local slope gradient: ln(a / tan(beta)).",
    operationalInterpretation: "Identifies natural drainage choke points and talweg hollows prone to sudden torrent pooling.",
  },
];

export const FeatureAttributionPanel: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem>(ATTRIBUTION_FEATURES[0]);

  return (
    <div className="space-y-6">
      {/* 1. Mandatory Non-Causal Safety Notice */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 font-sans text-xs text-amber-200 backdrop-blur">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-amber-300 text-xs">
              Non-Causal Explanation Guardrail
            </span>
            <p className="leading-relaxed text-slate-300">
              SHAP and feature attribution values displayed below represent <strong>mathematical sensitivity coefficients</strong> of the neural network model within its training manifold. They do <strong>NOT</strong> assert deterministic physical causation, nor do they replace physical streamflow measurements, geotechnical soil stability surveys, or official IMD/CWC hydrologic forecasts.
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
