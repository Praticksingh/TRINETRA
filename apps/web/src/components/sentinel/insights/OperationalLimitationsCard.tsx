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
              System Safety & Limitations
            </span>
            <p className="leading-relaxed text-slate-300 font-sans">
              TRINETRA provides early-warning guidance to help disaster management teams prepare ahead of time. It estimates probabilities, not absolute certainties. Operators should keep the following physical limitations in mind:
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
        {/* Limitation 1: Mountain Ridges Blocking Radar */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-amber-400" />
              <CardTitle className="font-sans text-sm font-semibold">1. High Ridges Blocking Weather Radar</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-300 font-sans">
            <p className="text-xs leading-relaxed">
              In deep mountain gorges (such as Kedarnath, Joshimath, and Uttarkashi), towering Himalayan ridges block ground radar beams below 3,000 meters.
            </p>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200 font-sans">
              <strong>How the system handles this:</strong> When radar is blocked, the model relies more heavily on weather satellite cloud cooling rates and high-resolution mountain terrain models.
            </div>
          </CardContent>
        </Card>

        {/* Limitation 2: Warm-Rain Cloudbursts */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-indigo-400" />
              <CardTitle className="font-sans text-sm font-semibold">2. Lower-Altitude Heavy Rain Clouds</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-300 font-sans">
            <p className="text-xs leading-relaxed">
              Some extreme downpours form in lower clouds that do not reach freezing cloud-top temperatures, which can look less dramatic on satellite thermal images.
            </p>
            <div className="rounded-lg border border-indigo-500/30 bg-[#1C1F30] p-2.5 text-xs text-indigo-200 font-sans">
              <strong>How the system handles this:</strong> The model combines low-level moisture measurements and steep slope lift factors to avoid missing these events.
            </div>
          </CardContent>
        </Card>

        {/* Limitation 3: Saturated Ground Speeding Up Runoff */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-purple-400" />
              <CardTitle className="font-sans text-sm font-semibold">3. Pre-Existing Ground Saturation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-300 font-sans">
            <p className="text-xs leading-relaxed">
              If heavy rain has already fallen in the past 2 to 3 days, mountain soil may already be completely full of water. Additional rain runs off immediately without soaking into the ground.
            </p>
            <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-2.5 text-xs text-purple-200 font-sans">
              <strong>Recommended approach:</strong> In areas with days of continuous rain, treat flash flood warnings with heightened urgency because water will rise faster.
            </div>
          </CardContent>
        </Card>

        {/* Limitation 4: Delayed Satellite Data */}
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-400" />
              <CardTitle className="font-sans text-sm font-semibold">4. Satellite Data Delays</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-300 font-sans">
            <p className="text-xs leading-relaxed">
              If new satellite images are delayed beyond 30 minutes, the forecast automatically expands its estimated arrival times by ±45 minutes to account for older data.
            </p>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-200 font-sans">
              <strong>Safety indicator:</strong> The top navigation bar displays an amber warning banner whenever satellite data is more than 30 minutes old.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Box */}
      <Card variant="base">
        <CardContent className="p-4 text-xs font-sans text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Safety Standard: Early-warning advisory protocol for emergency management review</span>
          </div>
          <span className="text-indigo-300 font-mono text-[11px]">Safety Policy: v1.0</span>
        </CardContent>
      </Card>
    </div>
  );
};
