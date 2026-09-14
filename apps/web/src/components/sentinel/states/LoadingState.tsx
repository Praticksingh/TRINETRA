"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  label?: string;
  description?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = "LOADING TELEMETRY DATA...",
  description = "Synchronizing high-resolution atmospheric grids with PostGIS",
  className = "",
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex flex-col items-center justify-center p-8 text-center font-mono ${className}`}
    >
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute h-10 w-10 animate-ping rounded-full bg-[#36D9E8]/20" />
        <Loader2 className="h-6 w-6 animate-spin text-[#36D9E8]" />
      </div>
      <span className="mt-3 text-xs font-bold text-slate-200 tracking-wider uppercase">
        {label}
      </span>
      {description && (
        <span className="mt-1 text-[11px] text-[#91A5BB] max-w-sm font-sans">
          {description}
        </span>
      )}
      <span className="sr-only">Content is loading, please wait.</span>
    </div>
  );
};
