"use client";

import React from "react";

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  className = "",
}) => {
  return (
    <div
      aria-hidden="true"
      className={`rounded-xl border border-[#1F3350] bg-[#0E1726]/60 p-4 animate-pulse overflow-x-auto ${className}`}
    >
      <div className="flex justify-between border-b border-[#1F3350] pb-3 mb-3">
        {Array.from({ length: columns }).map((_, c) => (
          <div key={c} className="h-3.5 w-20 rounded bg-[#1A293E]" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex justify-between items-center py-2 border-b border-[#1F3350]/30">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-3 rounded bg-[#142235]"
                style={{ width: `${60 + ((r * 13 + c * 17) % 30)}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
