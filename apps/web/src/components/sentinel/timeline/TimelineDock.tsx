"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { HORIZONS } from "@/app/forecast/Timeline";

export interface TimelineDockProps {
  currentHorizonMinutes: number;
  onHorizonChange: (minutes: number) => void;
  baseTimestampUtc?: string;
  className?: string;
}

// Relative convective intensity index per lead time
const HAZARD_INTENSITY_CURVE: Record<number, { level: number; label: string; color: string; dotColor: string }> = {
  0: { level: 45, label: "Storm Developing", color: "bg-amber-500", dotColor: "#f59e0b" },
  30: { level: 65, label: "Storm Growing", color: "bg-orange-500", dotColor: "#f97316" },
  60: { level: 82, label: "Heavy Rain Forming", color: "bg-orange-600", dotColor: "#ea580c" },
  90: { level: 92, label: "Severe Storm Peak", color: "bg-rose-500", dotColor: "#f43f5e" },
  120: { level: 98, label: "Highest Flash Flood Risk", color: "bg-rose-600", dotColor: "#e11d48" },
  150: { level: 94, label: "Peak Runoff in Valleys", color: "bg-rose-600", dotColor: "#e11d48" },
  180: { level: 86, label: "Water Draining Downhill", color: "bg-orange-600", dotColor: "#ea580c" },
  210: { level: 74, label: "Rain Easing", color: "bg-amber-500", dotColor: "#f59e0b" },
  240: { level: 60, label: "Water Flowing Downstream", color: "bg-amber-500", dotColor: "#f59e0b" },
  270: { level: 48, label: "Storm Weakening", color: "bg-emerald-500", dotColor: "#10b981" },
  300: { level: 38, label: "Light Rain Remaining", color: "bg-emerald-500", dotColor: "#10b981" },
  330: { level: 28, label: "Conditions Stabilizing", color: "bg-emerald-500", dotColor: "#10b981" },
  360: { level: 20, label: "Normal Water Flow Returning", color: "bg-emerald-500", dotColor: "#10b981" },
};

export const TimelineDock: React.FC<TimelineDockProps> = ({
  currentHorizonMinutes,
  onHorizonChange,
  baseTimestampUtc = "2026-09-11T08:30:00Z",
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // ms per step

  // Format valid timestamp: base + horizon minutes
  const validTimeStr = useMemo(() => {
    const base = new Date(baseTimestampUtc);
    const valid = new Date(base.getTime() + currentHorizonMinutes * 60000);
    return valid.toUTCString().slice(17, 22) + " UTC";
  }, [baseTimestampUtc, currentHorizonMinutes]);

  // Current intensity profile
  const currentIntensity = HAZARD_INTENSITY_CURVE[currentHorizonMinutes] || HAZARD_INTENSITY_CURVE[120];

  // Playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentIndex = HORIZONS.indexOf(currentHorizonMinutes);
        const nextIndex = (currentIndex + 1) % HORIZONS.length;
        onHorizonChange(HORIZONS[nextIndex]);
      }, playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentHorizonMinutes, playbackSpeed, onHorizonChange]);

  const handleStepPrev = () => {
    const currentIndex = HORIZONS.indexOf(currentHorizonMinutes);
    if (currentIndex > 0) {
      onHorizonChange(HORIZONS[currentIndex - 1]);
    }
  };

  const handleStepNext = () => {
    const currentIndex = HORIZONS.indexOf(currentHorizonMinutes);
    if (currentIndex < HORIZONS.length - 1) {
      onHorizonChange(HORIZONS[currentIndex + 1]);
    }
  };

  return (
    <div
      role="region"
      aria-label="Forecast Lead Time Controller"
      className={`rounded-xl border border-[#2B3142] bg-[#121520]/95 px-3 py-2 sm:px-4 sm:py-2.5 shadow-xl backdrop-blur-md select-none text-slate-200 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* 1. Playback Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={handleStepPrev}
            disabled={currentHorizonMinutes === HORIZONS[0]}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2B3142] bg-[#181C28] text-slate-300 hover:text-white disabled:opacity-30 transition"
            title="Previous lead time step"
            aria-label="Previous step"
          >
            <SkipBack className="h-3 w-3" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition ${
              isPlaying
                ? "border border-amber-500/50 bg-amber-950/40 text-amber-300"
                : "border border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50"
            }`}
            title={isPlaying ? "Pause automated playback" : "Play forecast sequence"}
            aria-label={isPlaying ? "Pause playback" : "Play forecast"}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3 w-3" />
                <span className="hidden md:inline text-[11px]">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                <span className="hidden md:inline text-[11px]">Play</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepNext}
            disabled={currentHorizonMinutes === HORIZONS[HORIZONS.length - 1]}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2B3142] bg-[#181C28] text-slate-300 hover:text-white disabled:opacity-30 transition"
            title="Next lead time step"
            aria-label="Next step"
          >
            <SkipForward className="h-3 w-3" />
          </button>

          {/* Speed selector */}
          <button
            onClick={() => setPlaybackSpeed(playbackSpeed === 1500 ? 750 : playbackSpeed === 750 ? 350 : 1500)}
            className="hidden sm:flex h-7 items-center justify-center rounded-lg border border-[#2B3142] bg-[#181C28] px-2 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition"
            title="Toggle playback speed"
          >
            {playbackSpeed === 1500 ? "1x" : playbackSpeed === 750 ? "2x" : "4x"}
          </button>
        </div>

        {/* 2. Horizontal Lead Time Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1 justify-center">
          {HORIZONS.map((min) => {
            const isSelected = currentHorizonMinutes === min;
            const isNow = min === 0;
            const intensity = HAZARD_INTENSITY_CURVE[min];

            let label = "";
            if (isNow) label = "Now";
            else if (min % 60 === 0) label = `+${min / 60}h`;
            else label = `+${Math.floor(min / 60)}h ${min % 60}m`;

            return (
              <button
                key={min}
                onClick={() => onHorizonChange(min)}
                className={`relative flex flex-col items-center justify-center rounded-lg px-2 py-1 text-xs transition-colors shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white font-medium shadow-sm"
                    : "bg-[#181C28] text-slate-400 hover:text-slate-200 hover:bg-[#202534] border border-[#2B3142]"
                }`}
                title={`${label} (${intensity.label})`}
              >
                <span className="text-[11px] leading-none whitespace-nowrap">{label}</span>
                <span
                  className="mt-1 h-1 w-3 rounded-full"
                  style={{ backgroundColor: intensity.dotColor }}
                />
              </button>
            );
          })}
        </div>

        {/* 3. Valid Time & Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#1E2330] shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-mono font-medium text-indigo-300 leading-none">
              {validTimeStr}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
              {currentIntensity.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
