"use client";

import React from "react";

export interface MetricsRibbonSkeletonProps {
  items?: number;
  className?: string;
}

export const MetricsRibbonSkeleton: React.FC<MetricsRibbonSkeletonProps> = ({
  items = 6,
  className = "",
}) => {
  return (
    <div
      aria-hidden="true"
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse ${className}`}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-[#1F3350] bg-[#0E1726]/60 p-3.5 space-y-2 text-center"
        >
          <div className="h-2.5 w-16 mx-auto rounded bg-[#1A293E]" />
          <div className="h-5 w-20 mx-auto rounded bg-[#142235]" />
          <div className="h-2 w-12 mx-auto rounded bg-[#1A293E]/60" />
        </div>
      ))}
    </div>
  );
};
