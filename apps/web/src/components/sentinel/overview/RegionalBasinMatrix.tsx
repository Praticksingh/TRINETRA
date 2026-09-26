"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { MapPin, ArrowRight } from "lucide-react";

export const RegionalBasinMatrix: React.FC = () => {
  const { cells, setSelectedCell, setCurrentView } = useSentinel();

  const handleCellClick = (cell: any) => {
    setSelectedCell(cell);
    setCurrentView("map");
  };

  return (
    <Card variant="base">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-indigo-400" />
          <CardTitle>Regional Watershed Conditions</CardTitle>
        </div>
        <span className="text-xs font-sans text-slate-400">
          {cells.length} monitored river basins
        </span>
      </CardHeader>

      <CardContent className="p-0">
        {/* Desktop View: Clean Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left font-sans text-xs text-slate-200">
            <thead className="border-b border-[#1E2330] bg-[#0E1017] text-[11px] font-medium text-slate-400">
              <tr>
                <th className="px-4 py-3">River Basin</th>
                <th className="px-3 py-3">Terrain</th>
                <th className="px-3 py-3">Thunderstorm</th>
                <th className="px-3 py-3">Heavy Rain</th>
                <th className="px-3 py-3">Flash Flood</th>
                <th className="px-3 py-3">Risk Level</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2330]">
              {cells.map((cell) => {
                const isCritical = cell.severity === "critical";
                const isWarning = cell.severity === "warning";

                return (
                  <tr
                    key={cell.cellId}
                    onClick={() => handleCellClick(cell)}
                    className={`group hover:bg-[#161A26] cursor-pointer transition-colors duration-150 ${
                      isCritical ? "bg-rose-950/20" : isWarning ? "bg-amber-950/10" : ""
                    }`}
                  >
                    {/* Basin / Location Name */}
                    <td className="px-4 py-3 font-sans font-medium text-slate-100">
                      <div>{cell.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Elevation: {cell.terrain.elevationM}m
                      </div>
                    </td>

                    {/* Slope & Topography */}
                    <td className="px-3 py-3 text-slate-400 text-xs">
                      <div className="text-slate-200">{cell.terrain.slopeDeg.toFixed(1)}° slope</div>
                      <div className="text-[10px] text-slate-500">
                        {cell.terrain.slopeDeg >= 35 ? "Steep gorge" : "Valley basin"}
                      </div>
                    </td>

                    {/* Thunderstorm Prob */}
                    <td className="px-3 py-3 font-mono text-slate-300">
                      {Math.round(cell.probabilities.thunderstorm * 100)}%
                    </td>

                    {/* Cloudburst / Heavy Rain Prob */}
                    <td className="px-3 py-3 font-mono text-slate-300">
                      {Math.round(cell.probabilities.cloudburst * 100)}%
                    </td>

                    {/* Flash Flood Prob */}
                    <td className="px-3 py-3 font-mono font-medium text-rose-300">
                      {Math.round(cell.probabilities.flashFlood * 100)}%
                    </td>

                    {/* Severity Badge */}
                    <td className="px-3 py-3">
                      <Badge severity={cell.severity} size="xs" />
                    </td>

                    {/* Quick Link Action */}
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-indigo-400 font-medium group-hover:text-indigo-300 transition-colors">
                        <span>View map</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Stacked Cards (Rule 22: Responsive Tables) */}
        <div className="md:hidden divide-y divide-[#1E2330]">
          {cells.map((cell) => {
            const isCritical = cell.severity === "critical";

            return (
              <div
                key={cell.cellId}
                onClick={() => handleCellClick(cell)}
                className={`p-3.5 space-y-2.5 active:bg-[#181C28] transition-colors cursor-pointer ${
                  isCritical ? "bg-rose-950/20" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-100">{cell.name}</div>
                    <div className="text-[11px] text-slate-400">{cell.terrain.elevationM}m elevation • {cell.terrain.slopeDeg.toFixed(0)}° slope</div>
                  </div>
                  <Badge severity={cell.severity} size="xs" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center border-t border-[#1E2330]/60">
                  <div className="bg-[#141722] p-1.5 rounded-lg border border-[#232736]">
                    <div className="text-[10px] text-slate-400">Thunderstorm</div>
                    <div className="text-xs font-mono font-medium text-slate-200 mt-0.5">
                      {Math.round(cell.probabilities.thunderstorm * 100)}%
                    </div>
                  </div>
                  <div className="bg-[#141722] p-1.5 rounded-lg border border-[#232736]">
                    <div className="text-[10px] text-slate-400">Heavy Rain</div>
                    <div className="text-xs font-mono font-medium text-slate-200 mt-0.5">
                      {Math.round(cell.probabilities.cloudburst * 100)}%
                    </div>
                  </div>
                  <div className="bg-[#141722] p-1.5 rounded-lg border border-[#232736]">
                    <div className="text-[10px] text-rose-400">Flood Risk</div>
                    <div className="text-xs font-mono font-medium text-rose-300 mt-0.5">
                      {Math.round(cell.probabilities.flashFlood * 100)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end text-xs text-indigo-400 font-medium pt-0.5">
                  <span className="flex items-center gap-1">
                    <span>Inspect location</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
