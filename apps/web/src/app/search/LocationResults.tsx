import React from "react";
import { MapPin, Navigation2, Mountain, Waves } from "lucide-react";
import RiskBadge, { SeverityLevel } from "../components/RiskBadge";

export interface SearchLocation {
  id: string;
  name: string;
  basin: string;
  district: string;
  coordinates: [number, number]; // [lng, lat]
  currentRisk: SeverityLevel;
  elevationM: number;
  catchmentVuln: number;
}

interface LocationResultsProps {
  results: SearchLocation[];
  onSelectLocation: (location: SearchLocation) => void;
}

export default function LocationResults({
  results,
  onSelectLocation,
}: LocationResultsProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-b-lg border-x border-b border-slate-800 bg-[#0d1424] p-4 text-center font-mono text-xs text-slate-500 shadow-2xl">
        No catchment or monitoring station found matching query.
      </div>
    );
  }

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-slate-800 bg-[#0c1322] shadow-2xl backdrop-blur-md divide-y divide-slate-800/80">
      {results.map((loc) => (
        <button
          key={loc.id}
          onClick={() => onSelectLocation(loc)}
          className="flex w-full items-center justify-between p-3 text-left transition hover:bg-slate-800/70 focus:bg-slate-800/90 focus:outline-none"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded border border-slate-700 bg-slate-800/80 text-cyan-400">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 text-xs sm:text-sm">
                  {loc.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {loc.district}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                <span className="flex items-center gap-1">
                  <Waves className="h-3 w-3 text-blue-400" />
                  {loc.basin}
                </span>
                <span className="flex items-center gap-1">
                  <Mountain className="h-3 w-3 text-slate-400" />
                  {loc.elevationM}m MSL
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RiskBadge severity={loc.currentRisk} size="sm" />
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-cyan-400 hover:bg-cyan-950 transition">
              <Navigation2 className="h-3 w-3" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
