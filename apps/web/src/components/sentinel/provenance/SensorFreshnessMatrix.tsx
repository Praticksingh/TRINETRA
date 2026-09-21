"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import {
  Satellite,
  Wind,
  Radio,
  Mountain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface SensorFeed {
  id: string;
  name: string;
  provider: string;
  channel: string;
  cadence: string;
  observedLagMinutes: number;
  maxToleratedLagMinutes: number;
  status: "NOMINAL" | "DEGRADED" | "CRITICAL" | "STATIC";
  mitigationNote?: string;
  icon: React.ElementType;
}

const SENSOR_FEEDS: SensorFeed[] = [
  {
    id: "insat3d_tir1",
    name: "INSAT-3D / 3DR Imager (TIR1)",
    provider: "ISRO / IMD (MOSDAC Gateway)",
    channel: "Thermal Infrared Channel 1 (10.8 µm)",
    cadence: "15-minute Rapid Scan",
    observedLagMinutes: 12,
    maxToleratedLagMinutes: 30,
    status: "NOMINAL",
    icon: Satellite,
  },
  {
    id: "nwp_um",
    name: "NCMRWF Unified Model Analysis",
    provider: "MoES / NCMRWF High-Res Regional",
    channel: "CAPE, CIN, TPW, 850hPa Wind Vectors",
    cadence: "Hourly Reanalysis Cycle",
    observedLagMinutes: 45,
    maxToleratedLagMinutes: 90,
    status: "NOMINAL",
    icon: Wind,
  },
  {
    id: "dwr_dehradun",
    name: "Dehradun C-Band Doppler Radar",
    provider: "India Meteorological Department (IMD)",
    channel: "Equivalent Radar Reflectivity (dBZ)",
    cadence: "10-minute Volume Scan",
    observedLagMinutes: 18,
    maxToleratedLagMinutes: 25,
    status: "DEGRADED",
    mitigationNote: "Valley ridgeline beam blockage below 3km AGL. Optical TIR1 fill algorithm active.",
    icon: Radio,
  },
  {
    id: "alos_dem",
    name: "ALOS World 3D (AW3D30) DEM",
    provider: "JAXA Earth Observation Center",
    channel: "30m Slope, Aspect, Planform Curvature",
    cadence: "Static Prior Dataset",
    observedLagMinutes: 0,
    maxToleratedLagMinutes: 0,
    status: "STATIC",
    icon: Mountain,
  },
];

export const SensorFreshnessMatrix: React.FC = () => {
  return (
    <Card variant="base">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Satellite className="h-4 w-4 text-indigo-400" />
            <CardTitle>Upstream Sensor Feeds & Ingestion Latencies</CardTitle>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            POLL CADENCE: 60 SECONDS
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 font-mono text-xs">
        {SENSOR_FEEDS.map((feed) => {
          const Icon = feed.icon;
          const isNominal = feed.status === "NOMINAL";
          const isStatic = feed.status === "STATIC";
          const isDegraded = feed.status === "DEGRADED";

          return (
            <div
              key={feed.id}
              className="rounded-xl border border-white/[0.08] bg-[#1D202B]/80 p-3 space-y-2 hover:border-slate-600 transition-colors font-sans text-xs shadow-clay-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1C1F30] border border-indigo-500/30 text-indigo-300 shadow-clay-btn">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-sans font-semibold text-slate-100">{feed.name}</div>
                    <div className="text-[10px] text-slate-400">{feed.provider}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Observed Lag</span>
                    <span
                      className={`font-semibold font-mono ${
                        isNominal || isStatic
                          ? "text-emerald-400"
                          : isDegraded
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {isStatic ? "STATIC PRIOR" : `${feed.observedLagMinutes} min`}
                    </span>
                  </div>

                  <Badge
                    variant={isNominal ? "emerald" : isDegraded ? undefined : "neutral"}
                    severity={isDegraded ? "warning" : undefined}
                    size="xs"
                  >
                    {feed.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 border-t border-white/[0.06] pt-2">
                <div>
                  <span className="text-slate-400">Channel:</span> <span className="text-slate-300">{feed.channel}</span>
                </div>
                <div>
                  <span className="text-slate-400">Update Cadence:</span> <span className="text-slate-300">{feed.cadence}</span>
                </div>
              </div>

              {feed.mitigationNote && (
                <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 p-2 text-xs text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{feed.mitigationNote}</span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
