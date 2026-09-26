"use client";

import React from "react";
import { Clock, RefreshCw, AlertTriangle } from "lucide-react";

export interface StaleDataBannerProps {
  ageMinutes: number;
  maxThresholdMinutes?: number;
  onRefresh?: () => void;
  className?: string;
}

export const StaleDataBanner: React.FC<StaleDataBannerProps> = ({
  ageMinutes,
  maxThresholdMinutes = 45,
  onRefresh,
  className = "",
}) => {
  if (ageMinutes <= maxThresholdMinutes) return null;

  return (
    <div
      role="alert"
      className={`flex items-center justify-between border-b border-amber-600/80 bg-amber-950/80 px-4 py-2 text-xs font-mono text-amber-200 backdrop-blur ${className}`}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-bold uppercase text-amber-300">
            Weather Data Delayed:
          </span>{" "}
          <span>
            Satellite observations are currently <strong>{ageMinutes} minutes old</strong> (normal update window is within {maxThresholdMinutes} min). Forecast estimates may have wider margins until fresh data arrives.
          </span>
        </div>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 rounded bg-amber-900/80 px-2.5 py-1 text-[11px] font-bold text-amber-100 hover:bg-amber-800 transition border border-amber-700 shrink-0 ml-3"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh Data</span>
        </button>
      )}
    </div>
  );
};
