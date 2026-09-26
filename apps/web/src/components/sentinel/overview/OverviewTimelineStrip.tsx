"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Clock, ArrowRight, Play, Pause } from "lucide-react";

interface ForecastStep {
  hours: number;
  minutes: number;
  label: string;
  icon: string;
  condition: string;
  rainMm: string;
  riskSeverity: "low" | "watch" | "warning" | "critical";
  riskLabel: string;
}

const FORECAST_STEPS: ForecastStep[] = [
  { hours: 0, minutes: 0, label: "Now", icon: "🌧", condition: "Moderate Rain", rainMm: "8–12 mm/h", riskSeverity: "watch", riskLabel: "Watch" },
  { hours: 1, minutes: 60, label: "+1h", icon: "🌧", condition: "Heavy Rain", rainMm: "18–25 mm/h", riskSeverity: "warning", riskLabel: "Warning" },
  { hours: 2, minutes: 120, label: "+2h", icon: "⛈", condition: "Severe Convection", rainMm: "35–50 mm/h", riskSeverity: "critical", riskLabel: "Critical" },
  { hours: 3, minutes: 180, label: "+3h", icon: "⛈", condition: "Peak Runoff", rainMm: "30–45 mm/h", riskSeverity: "critical", riskLabel: "Peak Flood" },
  { hours: 4, minutes: 240, label: "+4h", icon: "🌧", condition: "Rain Easing", rainMm: "15–20 mm/h", riskSeverity: "warning", riskLabel: "High Runoff" },
  { hours: 5, minutes: 300, label: "+5h", icon: "🌦", condition: "Scattered Showers", rainMm: "5–8 mm/h", riskSeverity: "watch", riskLabel: "Watch" },
  { hours: 6, minutes: 360, label: "+6h", icon: "⛅", condition: "Stabilizing", rainMm: "< 3 mm/h", riskSeverity: "low", riskLabel: "Low Risk" },
];

export const OverviewTimelineStrip: React.FC = () => {
  const { horizonMinutes, setHorizonMinutes, baseTimestampUtc, setCurrentView } = useSentinel();

  const baseDate = new Date(baseTimestampUtc);

  const getSeverityBadgeClass = (severity: ForecastStep["riskSeverity"]) => {
    switch (severity) {
      case "critical":
        return "text-rose-400 bg-rose-950/60 border-rose-500/40";
      case "warning":
        return "text-orange-400 bg-orange-950/60 border-orange-500/40";
      case "watch":
        return "text-amber-400 bg-amber-950/60 border-amber-500/40";
      default:
        return "text-emerald-400 bg-emerald-950/60 border-emerald-500/40";
    }
  };

  return (
    <Card variant="base">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400" />
          <CardTitle>Forecast Timeline (Next 6 Hours)</CardTitle>
        </div>
        <button
          onClick={() => setCurrentView("timeline")}
          className="text-xs font-sans text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>Detailed timeline</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </CardHeader>

      <CardContent>
        {/* Horizontal Scrollable Timeline Bar */}
        <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 select-none">
          {FORECAST_STEPS.map((step) => {
            const stepDate = new Date(baseDate.getTime() + step.minutes * 60000);
            const timeFormatted = stepDate.toUTCString().slice(17, 22) + " UTC";
            const isSelected = Math.abs(horizonMinutes - step.minutes) < 30;

            return (
              <button
                key={step.minutes}
                onClick={() => setHorizonMinutes(step.minutes)}
                className={`flex-1 min-w-[110px] sm:min-w-[125px] flex flex-col items-center justify-between p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#181D2C] border-indigo-500/60 shadow-md ring-1 ring-indigo-500/50"
                    : "bg-[#141722] border-[#222736] hover:bg-[#181C28] hover:border-[#2C3346]"
                }`}
              >
                {/* Time & Offset */}
                <div className="w-full flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-200">{step.label}</span>
                  <span className="font-mono text-[10px] text-slate-400">{timeFormatted}</span>
                </div>

                {/* Weather Pictogram */}
                <div className="text-2xl my-2" aria-hidden="true">
                  {step.icon}
                </div>

                {/* Condition & Intensity */}
                <div className="text-xs font-medium text-slate-200 truncate w-full">
                  {step.condition}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {step.rainMm}
                </div>

                {/* Severity Chip */}
                <div className="mt-2.5 w-full">
                  <span
                    className={`inline-block w-full py-0.5 rounded text-[10px] font-medium border ${getSeverityBadgeClass(
                      step.riskSeverity
                    )}`}
                  >
                    {step.riskLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
