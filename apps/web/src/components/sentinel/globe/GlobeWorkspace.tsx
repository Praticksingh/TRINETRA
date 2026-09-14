"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useSentinel } from "@/context/SentinelContext";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { Button } from "@/components/sentinel/Button";
import { Badge } from "@/components/sentinel/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import {
  Globe,
  Map as MapIcon,
  Navigation,
  Layers,
  Radio,
  Satellite,
  Compass,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

// Dynamic import for Three.js GlobeScene to prevent SSR window issues
const GlobeScene = dynamic(() => import("@/app/globe/GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#060913] text-slate-400 font-sans text-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
        <span className="text-slate-300 tracking-wide font-medium">
          Loading Earth View...
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
    <div className="relative flex-1 h-full w-full overflow-hidden bg-[#080E1A]">
      {/* 1. Top Header Strip */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-[#1E2D4A] bg-[#111A2C]/95 px-3.5 py-2 text-xs font-sans text-slate-200 backdrop-blur shadow-xl">
          <Globe className="h-4 w-4 text-[#38BDF8]" />
          <span className="font-semibold tracking-wide text-slate-100">
            Earth View
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-sky-300">INSAT-3DR Geostationary Orbit</span>
          <Badge variant="cyan" size="xs">
            WebGL 2.0
          </Badge>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<MapIcon className="h-3.5 w-3.5 text-[#080E1A]" />}
          onClick={() => setCurrentView("map")}
          className="shadow-xl"
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
      <div className="absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-3 rounded-lg border border-[#1E2D4A] bg-[#111A2C]/95 px-4 py-2 font-sans text-xs text-slate-300 backdrop-blur shadow-xl">
        <div className="flex items-center gap-2">
          <Satellite className="h-3.5 w-3.5 text-emerald-400" />
          <span>Sub-satellite Position: <strong className="font-mono text-slate-200">74.0°E</strong></span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-[#38BDF8]" />
          <span>Observation Corridor: <strong className="font-mono text-slate-200">28.5°N – 31.5°N</strong></span>
        </div>
      </div>
    </div>
  );
};
