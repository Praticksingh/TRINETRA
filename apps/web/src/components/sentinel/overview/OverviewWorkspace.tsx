"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { OverviewSummaryMetrics } from "./OverviewSummaryMetrics";
import { OverviewStoryCard } from "./OverviewStoryCard";
import { OverviewTimelineStrip } from "./OverviewTimelineStrip";
import { RegionalBasinMatrix } from "./RegionalBasinMatrix";
import { RecentActivityStrip } from "./RecentActivityStrip";
import { Button } from "@/components/sentinel/Button";
import { ArrowRight, RefreshCw, MapPin } from "lucide-react";

export const OverviewWorkspace: React.FC = () => {
  const { setCurrentView, triggerNowcastCycle, isTriggeringCycle, lastGenTime, isLiveConnected } = useSentinel();

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 space-y-5 max-w-7xl mx-auto w-full">
      {/* 1. Location & Context Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2330] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
            <MapPin className="h-3.5 w-3.5" />
            <span>Uttarakhand, India • Mandakini & Alaknanda River Valleys</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans mt-0.5">
            Current Weather Risk Overview
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Last updated {lastGenTime}</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">
              {isLiveConnected ? "Live data active" : "Historical simulation active"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isTriggeringCycle ? "animate-spin text-indigo-400" : ""}`} />}
            onClick={triggerNowcastCycle}
            disabled={isTriggeringCycle}
          >
            {isTriggeringCycle ? "Updating..." : "Update Forecast"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            onClick={() => setCurrentView("map")}
          >
            Open Weather Map
          </Button>
        </div>
      </div>

      {/* 2. Current Weather Story & Key Hazards */}
      <section aria-label="Current Weather Story">
        <OverviewStoryCard />
      </section>

      {/* 3. Top-Level Scannable Metrics Strip */}
      <section aria-label="Primary Weather Indicators">
        <OverviewSummaryMetrics />
      </section>

      {/* 4. Forecast Timeline (Next 6 Hours) */}
      <section aria-label="Forecast Timeline">
        <OverviewTimelineStrip />
      </section>

      {/* 5. Regional River Basins Matrix (Responsive table/cards) */}
      <section aria-label="Monitored River Basins">
        <RegionalBasinMatrix />
      </section>

      {/* 6. Recent Weather Alert Updates */}
      <section aria-label="Recent Weather Alert Activity">
        <RecentActivityStrip />
      </section>
    </div>
  );
};
