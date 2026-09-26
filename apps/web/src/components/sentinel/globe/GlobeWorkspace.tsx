"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useSentinel } from "@/context/SentinelContext";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { Button } from "@/components/sentinel/Button";
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
    <div className="flex h-full w-full items-center justify-center bg-[#090B10] text-slate-400 font-sans text-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <span className="text-slate-300 tracking-normal font-medium">
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
    <div className="relative flex-1 h-full w-full overflow-hidden bg-[#090B10]">
      {/* 1. Top Floating Navigation Bar (Quiet & Minimal - Rule 11) */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-[#2B3142] bg-[#121520]/90 px-3 py-1.5 text-xs font-sans text-slate-200 backdrop-blur-md shadow-md">
          <Globe className="h-4 w-4 text-indigo-400" />
          <span className="font-semibold text-white">
            Earth View
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Global Satellite Perspective</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<MapIcon className="h-3.5 w-3.5" />}
          onClick={() => setCurrentView("map")}
          className="shadow-sm"
        >
          Open Weather Map
        </Button>
      </div>

      {/* 2. Three.js Interactive Globe */}
      <div className="h-full w-full">
        <GlobeScene
          onSelectStation={handleSelectStation}
          onEnterNowcastGrid={() => setCurrentView("map")}
        />
      </div>

      {/* 3. Subtle Satellite Telemetry Chip */}
      <div className="absolute bottom-20 sm:bottom-4 left-3 z-20 hidden sm:flex items-center gap-2.5 rounded-lg border border-[#2B3142] bg-[#121520]/90 px-3 py-1.5 font-sans text-[11px] text-slate-400 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-1.5">
          <Satellite className="h-3 w-3 text-emerald-400" />
          <span>Satellite: <strong className="text-slate-200 font-medium">INSAT-3D</strong></span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5">
          <Radio className="h-3 w-3 text-indigo-400" />
          <span>Focus: <strong className="text-slate-200 font-medium">Uttarakhand Himalayas</strong></span>
        </div>
      </div>
    </div>
  );
};
