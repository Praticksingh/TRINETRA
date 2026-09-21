"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useSentinel } from "@/context/SentinelContext";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { Button } from "@/components/sentinel/Button";
import { Badge } from "@/components/sentinel/Badge";
import {
  Globe,
  Map as MapIcon,
  Radio,
  Satellite,
} from "lucide-react";

// Dynamic import for Three.js GlobeScene to prevent SSR window issues
const GlobeScene = dynamic(() => import("@/app/globe/GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0B0C10] text-slate-400 font-sans text-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
        <span className="text-slate-300 tracking-wide font-medium">
          Loading Photoreal Earth...
        </span>
      </div>
    </div>
  ),
});

export const GlobeWorkspace: React.FC = () => {
  const { setCurrentView, setSelectedCell } = useSentinel();

  const handleSelectStation = (stationName: string) => {
    const matched = GRID_CELLS.find((c) =>
      stationName.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])
    );
    if (matched) {
      setSelectedCell(matched);
      setCurrentView("map");
    }
  };

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden bg-[#0B0C10]">
      {/* 1. Top Header Strip */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-[#161820]/90 px-4 py-2.5 text-xs font-sans text-slate-200 backdrop-blur-xl shadow-clay-card">
          <Globe className="h-4 w-4 text-indigo-400" />
          <span className="font-semibold tracking-wide text-white">
            Earth View
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-indigo-300">INSAT-3DR Geostationary Orbit</span>
          <Badge variant="cyan" size="xs">
            WebGL Photoreal
          </Badge>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<MapIcon className="h-3.5 w-3.5" />}
          onClick={() => setCurrentView("map")}
          className="shadow-clay-btn-primary"
        >
          Switch to Weather Map
        </Button>
      </div>

      {/* 2. Three.js Interactive Globe */}
      <div className="h-full w-full">
        <GlobeScene
          onSelectStation={handleSelectStation}
          onEnterNowcastGrid={() => setCurrentView("map")}
        />
      </div>

      {/* 3. Bottom Operational Bar */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#161820]/90 px-4 py-2.5 font-sans text-xs text-slate-300 backdrop-blur-xl shadow-clay-card">
        <div className="flex items-center gap-2">
          <Satellite className="h-3.5 w-3.5 text-emerald-400" />
          <span>Sub-satellite Position: <strong className="font-mono text-slate-200">74.0°E</strong></span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-indigo-400" />
          <span>Observation Corridor: <strong className="font-mono text-slate-200">28.5°N – 31.5°N</strong></span>
        </div>
      </div>
    </div>
  );
};
