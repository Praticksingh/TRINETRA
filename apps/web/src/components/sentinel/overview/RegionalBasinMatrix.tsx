"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { MapPin, ArrowRight, Mountain, Droplets, Waves } from "lucide-react";

export const RegionalBasinMatrix: React.FC = () => {
  const { cells, setSelectedCell, setCurrentView } = useSentinel();

  return (
    <Card variant="base">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sky-400" />
          <CardTitle>Regional Catchment Risk Matrix</CardTitle>
        </div>
        <span className="text-xs font-sans text-slate-400">
          {cells.length} Key Himalayan Watersheds Monitored
        </span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs text-slate-200">
            <thead className="border-b border-[#1F3350] bg-[#0c1424]/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Catchment Basin</th>
                <th className="px-3 py-3">Slope & Topography</th>
                <th className="px-3 py-3">Thunderstorm</th>
                <th className="px-3 py-3">Cloudburst</th>
                <th className="px-3 py-3">Flash Flood</th>
                <th className="px-3 py-3">Advisory Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F3350]/60">
              {cells.map((cell) => {
                const isCritical = cell.severity === "critical";
                const isWarning = cell.severity === "warning";

                return (
                  <tr
                    key={cell.cellId}
                    onClick={() => {
                      setSelectedCell(cell);
                      setCurrentView("map");
                    }}
                    className={`group hover:bg-[#16233B]/70 cursor-pointer transition-colors duration-150 ${
                      isCritical ? "bg-rose-950/20" : isWarning ? "bg-amber-950/10" : ""
                    }`}
                  >
                    {/* Basin / Location Name */}
                    <td className="px-4 py-3 font-sans font-semibold text-slate-100">
                      <div>{cell.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Cell #{cell.cellId} • {cell.terrain.elevationM}m MSL
                      </div>
                    </td>

                    {/* Slope & Topography */}
                    <td className="px-3 py-3 text-slate-400 font-mono text-xs">
                      <div className="text-slate-200 font-medium">{cell.terrain.slopeDeg.toFixed(1)}° slope</div>
                      <div className="text-[10px] text-slate-500">TWI {cell.terrain.twi.toFixed(1)}</div>
                    </td>

                    {/* Thunderstorm Prob */}
                    <td className="px-3 py-3 text-amber-300 font-mono font-bold">
                      {Math.round(cell.probabilities.thunderstorm * 100)}%
                    </td>

                    {/* Cloudburst Prob */}
                    <td className="px-3 py-3 text-amber-400 font-mono font-bold">
                      {Math.round(cell.probabilities.cloudburst * 100)}%
                    </td>

                    {/* Flash Flood Prob */}
                    <td className="px-3 py-3 font-bold font-mono text-rose-400">
                      {Math.round(cell.probabilities.flashFlood * 100)}%
                    </td>

                    {/* Severity Badge */}
                    <td className="px-3 py-3">
                      <Badge severity={cell.severity} size="sm">
                        {cell.severity.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Quick Link Action */}
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-sky-400 font-medium group-hover:text-sky-300 transition-colors">
                        <span>Inspect</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
