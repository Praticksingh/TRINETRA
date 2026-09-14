"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { TimelineDock } from "./TimelineDock";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { Button } from "@/components/sentinel/Button";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { Clock, ArrowRight, Droplets, Mountain, Waves, Compass } from "lucide-react";

export const TimelineWorkspace: React.FC = () => {
  const {
    horizonMinutes,
    setHorizonMinutes,
    baseTimestampUtc,
    setSelectedCell,
    setCurrentView,
  } = useSentinel();

  // Decay or surge multiplier based on lead time
  const getHorizonMultiplier = (min: number) => {
    // Peak at 120-150m, then gentle decay
    if (min <= 120) return 0.7 + (min / 120) * 0.3;
    return 1.0 - ((min - 120) / 240) * 0.45;
  };

  const mult = getHorizonMultiplier(horizonMinutes);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2D4A] pb-4">
        <div>
          <div className="flex items-center gap-2 font-sans text-xs text-[#38BDF8] font-semibold uppercase tracking-wider">
            <Clock className="h-4 w-4" />
            <span>Forecast Evolution Engine (Now to +6 Hours)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans mt-1">
            Convective Progression & Drainage Timeline
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Evaluate lead-time evolution, peak inundation timing, and downstream surge propagation across all catchments.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          onClick={() => setCurrentView("map")}
        >
          View Selected Slice on Weather Map
        </Button>
      </div>

      {/* Master Timeline Controller Dock */}
      <section aria-label="Lead Time Controller">
        <TimelineDock
          currentHorizonMinutes={horizonMinutes}
          onHorizonChange={setHorizonMinutes}
          baseTimestampUtc={baseTimestampUtc}
        />
      </section>

      {/* Regional Station Progression Across Selected Lead Time */}
      <section className="space-y-4" aria-label="Catchment Forecast Progression">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100 font-sans">
            Catchment Forecast Progression at {horizonMinutes === 0 ? "Now (Observed)" : `+${Math.floor(horizonMinutes / 60)}h${horizonMinutes % 60 ? ` ${horizonMinutes % 60}m` : ""}`}
          </h2>
          <span className="text-xs font-sans text-slate-400">
            Click any catchment to focus on the Weather Map
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GRID_CELLS.map((cell) => {
            const adjustedFlashFlood = Math.min(0.99, cell.probabilities.flashFlood * mult);
            const adjustedCloudburst = Math.min(0.99, cell.probabilities.cloudburst * mult);

            // Compute dynamic severity based on adjusted probability
            const currentSeverity =
              adjustedFlashFlood >= 0.85
                ? "critical"
                : adjustedFlashFlood >= 0.7
                ? "warning"
                : adjustedFlashFlood >= 0.45
                ? "watch"
                : "none";

            return (
              <Card
                key={cell.cellId}
                variant="interactive"
                borderAccent={currentSeverity === "critical" ? "critical" : currentSeverity === "warning" ? "warning" : "none"}
                onClick={() => {
                  setSelectedCell(cell);
                  setCurrentView("map");
                }}
              >
                <CardHeader>
                  <CardTitle className="text-sm font-semibold font-sans">{cell.name}</CardTitle>
                  <Badge severity={currentSeverity}>
                    {currentSeverity.toUpperCase()}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3 text-xs font-sans">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-400">Flash Flood Threat:</span>
                    <span className="text-base font-bold text-rose-400 font-sans">
                      {Math.round(adjustedFlashFlood * 100)}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 via-amber-500 to-rose-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(adjustedFlashFlood * 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#1E2D4A]/60">
                    <div>
                      <span className="text-slate-400">Atmospheric Risk: </span>
                      <span className="text-sky-300 font-semibold">{Math.round(adjustedCloudburst * 100)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Slope Incline: </span>
                      <span className="text-slate-200 font-semibold">{cell.terrain.slopeDeg.toFixed(1)}°</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="justify-between text-[11px] font-sans">
                  <span>Elevation: {cell.terrain.elevationM}m MSL</span>
                  <span className="text-[#38BDF8] font-semibold group-hover:underline flex items-center gap-1">
                    <span>Inspect Cell</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
