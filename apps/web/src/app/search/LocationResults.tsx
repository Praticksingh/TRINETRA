import React from "react";
import { MapPin, Navigation2, Mountain, Waves, Crosshair, Loader2 } from "lucide-react";
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
  onUseCurrentLocation?: () => void;
  isLocating?: boolean;
}

export default function LocationResults({
  results,
  onSelectLocation,
  onUseCurrentLocation,
  isLocating = false,
}: LocationResultsProps) {
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#1D202B]/98 shadow-clay-card-elevated backdrop-blur-xl divide-y divide-white/[0.05] p-1.5 space-y-1">
      {/* 1. GPS Quick Locate Action */}
      {onUseCurrentLocation && (
        <div className="p-0.5 pb-1">
          <button
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="flex w-full items-center justify-between p-2 rounded-xl text-left transition bg-[#161820] hover:bg-[#252937] border border-indigo-500/30 shadow-clay-btn active:translate-y-0.5 group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4F46E5] text-white shadow-clay-btn-primary">
                {isLocating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Crosshair className="h-3.5 w-3.5" />
                )}
              </div>
              <div>
                <div className="font-semibold text-xs text-indigo-300 group-hover:text-indigo-200">
                  {isLocating ? "Acquiring GPS Satellite Signal..." : "Use My Current Location"}
                </div>
                <div className="text-[10px] text-zinc-400">
                  Detect coordinates & sync nearest catchment
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 bg-[#111217] px-2 py-0.5 rounded-md border border-white/[0.06]">
              GPS
            </span>
          </button>
        </div>
      )}

      {results.length === 0 ? (
        <div className="p-4 text-center font-mono text-xs text-zinc-400">
          No catchment or monitoring station found matching query.
        </div>
      ) : (
        results.map((loc) => (
          <button
            key={loc.id}
            onClick={() => onSelectLocation(loc)}
            className="flex w-full items-center justify-between p-2.5 rounded-xl text-left transition hover:bg-[#252937] hover:shadow-clay-btn focus:bg-[#252937] focus:outline-none active:translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111217] text-indigo-400 shadow-clay-btn">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100 text-xs sm:text-sm">
                    {loc.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {loc.district}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono mt-0.5">
                  <span className="flex items-center gap-1">
                    <Waves className="h-3 w-3 text-indigo-400" />
                    {loc.basin}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mountain className="h-3 w-3 text-zinc-400" />
                    {loc.elevationM}m MSL
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RiskBadge severity={loc.currentRisk} size="sm" />
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#111217] text-indigo-400 shadow-clay-btn hover:text-indigo-300 transition">
                <Navigation2 className="h-3 w-3" />
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
