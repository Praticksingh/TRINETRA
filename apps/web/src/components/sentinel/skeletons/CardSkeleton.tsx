"use client";

import React from "react";

export interface CardSkeletonProps {
  lines?: number;
  hasHeader?: boolean;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  lines = 3,
  hasHeader = true,
  className = "",
}) => {
  return (
    <div
      aria-hidden="true"
      className={`rounded-xl border border-[#1F3350] bg-[#0E1726]/60 p-4 space-y-3 animate-pulse ${className}`}
    >
      {hasHeader && (
        <div className="flex items-center justify-between border-b border-[#1F3350]/60 pb-3">
          <div className="h-4 w-32 rounded bg-[#1A293E]" />
          <div className="h-3 w-16 rounded bg-[#1A293E]" />
        </div>
      )}
      <div className="space-y-2 pt-1">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded bg-[#142235]"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};
