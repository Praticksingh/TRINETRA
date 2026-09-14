"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  EyeOff,
  CloudRain,
  Mountain,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const OperationalLimitationsCard: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      {/* Alert Banner */}
      <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 font-sans text-xs text-rose-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-rose-300 text-xs">
              Operational Trust Protocol: System Boundaries & Failure Modes
            </span>
            <p className="leading-relaxed text-slate-300 font-sans">
              TRINETRA is designed for decision-support in State Emergency Operation Centers (SEOC). It provides probabilistic risk guidance, not guaranteed physical certainty. Operators must account for the following documented physical and observational limitations:
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
        {/* Limitation 1: Radar Beam Occlusion */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-amber-400" />
              <CardTitle className="font-sans text-sm font-semibold">1. Himalayan Terrain Radar Beam Occlusion</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-300 font-sans">
            <p className="text-xs leading-relaxed">
              In deep river defiles and gorges (e.g., Alaknanda gorge near Joshimath, Bhagirathi near Uttarkashi, and Mandakini near Kedarnath), massive ridgelines block C-Band Doppler Radar beams below 3,000 meters above ground level.
            </p>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200 font-sans">
              <strong>System Mitigation:</strong> In occluded cells, the model automatically shifts feature weighting from Doppler reflectivity (dBZ) to INSAT-3D TIR1 cloud-top cooling rates and ALOS AW3D30 digital elevation priors.
            </div>
          </CardContent>
        </Card>

        {/* Limitation 2: Warm-Rain Cloudburst Undercatch */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-[#38BDF8]" />
              <CardTitle className="font-sans text-sm font-semibold">2. Warm-Rain Orographic Cloud Undercatch</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-300 font-sans">
            <p className="text-xs leading-relaxed">
              Certain orographically forced cloudbursts occur in relatively shallow convective clouds without deep ice-phase tops reaching -40°C. These events produce torrential rainfall without registering dramatic infrared cloud-top temperature drops on geostationary satellites.
            </p>
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2.5 text-xs text-sky-200 font-sans">
              <strong>System Mitigation:</strong> NWP low-level moisture flux convergence and high relative humidity (&gt; 85%) are combined with topographic slope indices to prevent false-negative misses.
            </div>
          </CardContent>
        </Card>

        {/* Limitation 3: Antecedent Soil Moisture Saturation Non-Linearity */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-purple-400" />
              <CardTitle className="font-sans text-sm font-semibold">3. Antecedent Soil Saturation Lag Non-Linearity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-300 font-sans">
            <p className="text-xs leading-relaxed">
              Flash flood hydrographs vary drastically based on prior 72-hour rainfall history. If steep catchment soils are already saturated at 100% field capacity, peak runoff surge arrives with near-zero infiltration lag, drastically shortening evacuation windows.
            </p>
            <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-2.5 text-xs text-purple-200 font-sans">
              <strong>Operational Directive:</strong> Flash flood surge indicators (R_surge) should always be evaluated alongside soil saturation moisture layers when available.
            </div>
          </CardContent>
        </Card>

        {/* Limitation 4: Telemetry Latency & Degraded Fallback */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-400" />
              <CardTitle className="font-sans text-sm font-semibold">4. Upstream Satellite Lag Fallback Mode</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-300 font-sans">
            <p className="text-xs leading-relaxed">
              When MOSDAC / ISRO INSAT-3D raw telemetry is delayed beyond 30 minutes, the nowcast engine flags predictions as <strong>DEGRADED SENSOR FALLBACK</strong> and expands lead-time uncertainty bands by ±45 minutes.
            </p>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-200 font-sans">
              <strong>Safety Guard:</strong> System immediately presents an amber telemetry alert in the console header when latency exceeds the 30-minute threshold.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Box */}
      <Card variant="base">
        <CardContent className="p-4 text-xs font-sans text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Audit Standard: Compliant with IMD/SDMA Nowcasting Safety Directives</span>
          </div>
          <span className="text-[#38BDF8] font-mono text-[11px]">Doc Ref: TRINETRA-SAF-2026-V1</span>
        </CardContent>
      </Card>
    </div>
  );
};
