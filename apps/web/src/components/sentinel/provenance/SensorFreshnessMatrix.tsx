"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import {
  Satellite,
  Wind,
  Radio,
  Mountain,
  History,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

interface SensorFeed {
  id: string;
  name: string;
  category: "Satellite" | "Weather Models" | "Radar" | "Terrain" | "Historical Data";
  provider: string;
  purpose: string;
  coverage: string;
  lastUpdated: string;
  status: "Operational" | "Partial (Terrain Blocked)" | "Active Replay" | "Static";
  severityStatus?: "low" | "watch" | "warning";
  technicalDetails: string;
  mitigationNote?: string;
  icon: React.ElementType;
}

const SENSOR_FEEDS: SensorFeed[] = [
  {
    id: "insat3d_tir1",
    name: "Indian Weather Satellite",
    category: "Satellite",
    provider: "ISRO / IMD (INSAT-3D / 3DR)",
    purpose: "Thermal infrared cloud top cooling & convective storm detection",
    coverage: "Pan-India & Himalayan Region",
    lastUpdated: "12m ago",
    status: "Operational",
    severityStatus: "low",
    technicalDetails: "Channels: TIR1 (10.8 µm), TIR2 (12.0 µm), Water Vapor (6.8 µm). Cadence: 15-minute full disc & rapid regional scans.",
    icon: Satellite,
  },
  {
    id: "nwp_um",
    name: "Numerical Weather Models",
    category: "Weather Models",
    provider: "NCMRWF & IMD Unified Model (WRF / GFS)",
    purpose: "Atmospheric instability, convective energy (CAPE), moisture influx",
    coverage: "Uttarakhand & Western Himalayas (4km grid)",
    lastUpdated: "45m ago",
    status: "Operational",
    severityStatus: "low",
    technicalDetails: "Model: NCMRWF 4km deterministic unified model with hourly assimilation of Doppler and satellite radiance profiles.",
    icon: Wind,
  },
  {
    id: "dwr_dehradun",
    name: "Doppler Weather Radar",
    category: "Radar",
    provider: "India Meteorological Department (Dehradun Station)",
    purpose: "Direct cloud droplet reflectivity and precipitation intensity estimation",
    coverage: "75km radius around Dehradun",
    lastUpdated: "18m ago",
    status: "Partial (Terrain Blocked)",
    severityStatus: "watch",
    mitigationNote: "High mountain ridges block radar beam below 3km altitude in deep river gorges. Satellite cloud top data is automatically fused to fill occlusion gaps.",
    technicalDetails: "Band: S-Band Polarimetric Doppler. Elevation scans: 0.5° to 19.5°. Beam blockage correction active.",
    icon: Radio,
  },
  {
    id: "alos_dem",
    name: "Digital Elevation Model & Hydrology",
    category: "Terrain",
    provider: "ALOS AW3D30 / SRTM 30m Topography",
    purpose: "Slope angles, river flow direction, and topographic wetness accumulation",
    coverage: "Uttarakhand State Catchments",
    lastUpdated: "Permanent Baseline",
    status: "Static",
    severityStatus: "low",
    technicalDetails: "Hydro-conditioned DEM at 30m resolution. Flow accumulation matrix computed via D-infinity algorithm.",
    icon: Mountain,
  },
  {
    id: "historical_catalog",
    name: "Historical Disaster Archive",
    category: "Historical Data",
    provider: "State Disaster Management Authority (SDMA)",
    purpose: "Benchmarking against 2013 Kedarnath, 2021 Chamoli, and past cloudburst records",
    coverage: "10-Year Severe Weather Catalog",
    lastUpdated: "Curated Baseline",
    status: "Active Replay",
    severityStatus: "low",
    technicalDetails: "Verified benchmark scenarios used for model training, synthetic validation, and disaster simulation calibration.",
    icon: History,
  },
];

export const SensorFreshnessMatrix: React.FC = () => {
  const [expandedFeedId, setExpandedFeedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedFeedId(expandedFeedId === id ? null : id);
  };

  return (
    <Card variant="base">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Satellite className="h-4 w-4 text-indigo-400" />
            <CardTitle>Data Sources & Feed Transparency</CardTitle>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            5 verified telemetry sources
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 font-sans text-xs">
        {SENSOR_FEEDS.map((feed) => {
          const Icon = feed.icon;
          const isExpanded = expandedFeedId === feed.id;

          return (
            <div
              key={feed.id}
              className="rounded-lg border border-[#232736] bg-[#141722] p-3.5 space-y-2.5 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#181C28] border border-[#2B3142] text-indigo-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100 flex items-center gap-2">
                      <span>{feed.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({feed.category})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{feed.provider}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Last Updated</span>
                    <span className="font-mono text-xs text-slate-200">{feed.lastUpdated}</span>
                  </div>

                  <Badge
                    severity={feed.severityStatus}
                    size="xs"
                  >
                    {feed.status}
                  </Badge>
                </div>
              </div>

              {/* Purpose & Coverage Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-[#1E2330]">
                <div>
                  <span className="text-slate-400">Purpose: </span>
                  <span className="text-slate-200">{feed.purpose}</span>
                </div>
                <div>
                  <span className="text-slate-400">Coverage: </span>
                  <span className="text-slate-200">{feed.coverage}</span>
                </div>
              </div>

              {/* Radar Mitigation Notice if applicable */}
              {feed.mitigationNote && (
                <div className="flex items-start gap-1.5 rounded bg-amber-950/30 border border-amber-500/30 p-2 text-[11px] text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{feed.mitigationNote}</span>
                </div>
              )}

              {/* Expandable Technical Details (Rule 18) */}
              <div className="pt-1">
                <button
                  onClick={() => toggleExpand(feed.id)}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <span>{isExpanded ? "Hide technical parameters" : "Show technical details"}</span>
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {isExpanded && (
                  <div className="mt-2 p-2.5 rounded bg-[#0E1017] border border-[#1E2330] text-[11px] text-slate-400 font-mono leading-relaxed animate-in fade-in duration-150">
                    {feed.technicalDetails}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
