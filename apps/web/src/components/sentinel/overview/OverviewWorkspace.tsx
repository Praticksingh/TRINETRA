"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { OverviewSummaryMetrics } from "./OverviewSummaryMetrics";
import { PriorityRiskCard } from "./PriorityRiskCard";
import { RegionalBasinMatrix } from "./RegionalBasinMatrix";
import { RecentActivityStrip } from "./RecentActivityStrip";
import { Button } from "@/components/sentinel/Button";
import { ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";

export const OverviewWorkspace: React.FC = () => {
  const { setCurrentView, triggerNowcastCycle, isTriggeringCycle } = useSentinel();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Title & Operational Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 font-sans text-xs text-sky-400 font-semibold tracking-wider uppercase">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <span>Operational Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans mt-1">
            Uttarakhand Convective Hazard Corridor
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            2–6 Hour Lead Window • Mandakini, Alaknanda & Ganga Headwaters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isTriggeringCycle ? "animate-spin text-sky-400" : ""}`} />}
            onClick={triggerNowcastCycle}
            disabled={isTriggeringCycle}
          >
            {isTriggeringCycle ? "Running forecast..." : "Run Forecast Update"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            onClick={() => setCurrentView("map")}
          >
            View on Weather Map
          </Button>
        </div>
      </div>

      {/* 1. Summary Metrics Strip */}
      <section aria-label="Key Operational Metrics">
        <OverviewSummaryMetrics />
      </section>

      {/* 2. Priority Active Risk Threat */}
      <section aria-label="Highest Priority Modeled Threat">
        <PriorityRiskCard />
      </section>

      {/* 3. Regional Basin Risk Matrix */}
      <section aria-label="Regional Catchment Risk Matrix">
        <RegionalBasinMatrix />
      </section>

      {/* 4. Recent Alert Lifecycle Audit Activity */}
      <section aria-label="Advisory Lifecycle Activity">
        <RecentActivityStrip />
      </section>
    </div>
  );
};
