"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { TimelineDock } from "./TimelineDock";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { Button } from "@/components/sentinel/Button";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { Clock, ArrowRight } from "lucide-react";

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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2330] pb-4">
        <div>
          <div className="flex items-center gap-2 font-sans text-xs text-indigo-400 font-medium">
            <Clock className="h-4 w-4" />
            <span>Forecast Evolution: Now to +6 Hours</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans mt-0.5">
            Forecast Timeline
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Synchronized progression of rainfall, convective storm intensity, and flash-flood runoff risk.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          onClick={() => setCurrentView("map")}
        >
          View on Weather Map
        </Button>
      </div>

      {/* Master Timeline Controller Dock */}
      <section aria-label="Forecast Period Controller">
        <TimelineDock
          currentHorizonMinutes={horizonMinutes}
          onHorizonChange={setHorizonMinutes}
          baseTimestampUtc={baseTimestampUtc}
        />
      </section>

      {/* Regional Station Progression Across Selected Lead Time */}
      <section className="space-y-3.5" aria-label="Regional Forecast Timeline">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100 font-sans">
            {horizonMinutes === 0
              ? "Expected Conditions: Now (Current Window)"
              : `Expected Conditions at +${Math.floor(horizonMinutes / 60)}h${horizonMinutes % 60 ? ` ${horizonMinutes % 60}m` : ""}`}
          </h2>
          <span className="text-xs font-sans text-slate-400">
            Click any watershed to inspect on the map
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                  <Badge severity={currentSeverity} size="xs" />
                </CardHeader>

                <CardContent className="space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-400">Flash flood risk:</span>
                    <span className="text-sm font-semibold font-mono text-rose-300">
                      {Math.round(adjustedFlashFlood * 100)}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-[#0E1017] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(adjustedFlashFlood * 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#1E2330]">
                    <div>
                      <span className="text-slate-400">Rain & storm: </span>
                      <span className="text-slate-200 font-medium">{Math.round(adjustedCloudburst * 100)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Slope: </span>
                      <span className="text-slate-200 font-medium">{cell.terrain.slopeDeg.toFixed(1)}°</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="justify-between text-[11px] font-sans">
                  <span className="text-slate-400">Elevation: {cell.terrain.elevationM}m</span>
                  <span className="text-indigo-400 font-medium group-hover:underline flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
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
