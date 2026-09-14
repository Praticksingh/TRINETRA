"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Calendar,
  Activity,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { HORIZONS } from "@/app/forecast/Timeline";

export interface TimelineDockProps {
  currentHorizonMinutes: number;
  onHorizonChange: (minutes: number) => void;
  baseTimestampUtc?: string;
  className?: string;
}

// Relative convective intensity index per lead time (simulated physics curve)
const HAZARD_INTENSITY_CURVE: Record<number, { level: number; label: string; color: string }> = {
  0: { level: 45, label: "Developing Inflow", color: "bg-amber-500" },
  30: { level: 65, label: "Updraft Intensification", color: "bg-orange-500" },
  60: { level: 82, label: "Pre-Peak Convection", color: "bg-orange-600" },
  90: { level: 92, label: "Severe Core Formation", color: "bg-red-500" },
  120: { level: 98, label: "Peak Surge & Flash Flood", color: "bg-red-600" },
  150: { level: 94, label: "Peak Inundation Window", color: "bg-red-600" },
  180: { level: 86, label: "Sustained Valley Drainage", color: "bg-orange-600" },
  210: { level: 74, label: "Rainfall Decay Commencing", color: "bg-amber-500" },
  240: { level: 60, label: "Downstream Propagation", color: "bg-amber-500" },
  270: { level: 48, label: "Orographic Dissipation", color: "bg-emerald-500" },
  300: { level: 38, label: "Weak Inflow Residual", color: "bg-emerald-500" },
  330: { level: 28, label: "Post-Event Stabilization", color: "bg-emerald-500" },
  360: { level: 20, label: "Stabilized Valley Runoff", color: "bg-emerald-500" },
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

  // Lead time plain label
  const leadTimeLabel = useMemo(() => {
    const hours = Math.floor(currentHorizonMinutes / 60);
    const mins = currentHorizonMinutes % 60;
    if (hours === 0 && mins === 0) return "Now (Observed)";
    return `Forecast in ${hours}h${mins ? ` ${mins}m` : ""}`;
  }, [currentHorizonMinutes]);

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
      className={`rounded-xl border border-[#1E2D4A] bg-[#111A2C]/95 p-3.5 shadow-xl backdrop-blur-md select-none text-slate-200 ${className}`}
    >
      <div className="flex flex-col gap-2.5">
        {/* Top Header: Lead Time, Valid Time, Playback Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2D4A] pb-2.5">
          {/* Left: Lead Time & Valid Time */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-sans text-xs font-semibold text-slate-100">
              <Clock className="h-4 w-4 text-[#38BDF8]" />
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Forecast:</span>
              <span className="rounded-md bg-[#16233B] px-2.5 py-0.5 text-[#38BDF8] border border-sky-500/30 font-semibold font-sans tracking-wide text-xs">
                {leadTimeLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-sans text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Valid at:</span>
              <span className="text-slate-200 font-medium font-sans text-xs">{validTimeStr}</span>
            </div>

            {/* Intensity Callout */}
            <div className="hidden lg:flex items-center gap-1.5 font-sans text-xs text-slate-300">
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-medium">{currentIntensity.label}</span>
            </div>
          </div>

          {/* Right: Controls (Speed, Prev, Play/Pause, Next) */}
          <div className="flex items-center gap-2 font-sans">
            {isPlaying && (
              <div className="flex items-center gap-1.5 rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-300 border border-sky-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                <span>PLAYING FORECAST</span>
              </div>
            )}

            {/* Playback speed selector */}
            <div className="flex items-center rounded-lg border border-[#1E2D4A] bg-[#080E1A] p-0.5 text-xs">
              <button
                onClick={() => setPlaybackSpeed(1500)}
                className={`px-2 py-0.5 rounded transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8] ${
                  playbackSpeed === 1500
                    ? "bg-[#16233B] text-[#38BDF8] font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="1x speed (1.5s per step)"
                aria-label="1x playback speed"
              >
                1x
              </button>
              <button
                onClick={() => setPlaybackSpeed(750)}
                className={`px-2 py-0.5 rounded transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8] ${
                  playbackSpeed === 750
                    ? "bg-[#16233B] text-[#38BDF8] font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="2x speed (0.75s per step)"
                aria-label="2x playback speed"
              >
                2x
              </button>
              <button
                onClick={() => setPlaybackSpeed(350)}
                className={`px-2 py-0.5 rounded transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8] ${
                  playbackSpeed === 350
                    ? "bg-[#16233B] text-[#38BDF8] font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="4x speed (0.35s per step)"
                aria-label="4x playback speed"
              >
                4x
              </button>
            </div>

            {/* Step Backward */}
            <button
              onClick={handleStepPrev}
              disabled={currentHorizonMinutes === HORIZONS[0]}
              className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-1.5 text-slate-300 hover:text-white hover:border-[#38BDF8]/50 disabled:opacity-30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
              aria-label="Previous forecast lead-time slice"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold font-sans transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                isPlaying
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                  : "border-sky-500/40 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25"
              }`}
              aria-label={isPlaying ? "Pause forecast animation" : "Play forecast animation"}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>PLAY FORECAST</span>
                </>
              )}
            </button>

            {/* Step Forward */}
            <button
              onClick={handleStepNext}
              disabled={currentHorizonMinutes === HORIZONS[HORIZONS.length - 1]}
              className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-1.5 text-slate-300 hover:text-white hover:border-[#38BDF8]/40 disabled:opacity-30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
              aria-label="Next forecast lead-time slice"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Middle: Discrete Stops with Subtle "Now" Accent & Selected Highlight */}
        <div className="relative pt-1 pb-1">
          <div className="flex sm:grid sm:grid-cols-13 gap-1 sm:gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
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
                  className={`flex flex-col items-center justify-between min-w-[50px] sm:min-w-0 shrink-0 sm:shrink rounded-lg p-1.5 transition-all duration-150 border font-sans text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                    isSelected
                      ? "border-sky-400 bg-[#16233B] text-sky-200 ring-2 ring-sky-400/30 font-semibold shadow-sm scale-105"
                      : "border-[#1E2D4A] bg-[#080E1A]/80 text-slate-400 hover:bg-[#16233B] hover:text-slate-200"
                  }`}
                  aria-pressed={isSelected}
                  title={`Select ${label} (${intensity.label})`}
                >
                  <span className="tracking-tight text-[11px] font-medium">{label}</span>
                  {/* Miniature Intensity Indicator Bar */}
                  <span
                    className={`mt-1.5 h-1 w-full rounded-full transition-all ${
                      isSelected ? "bg-[#38BDF8]" : intensity.color + " opacity-60"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom: Hazard Trend Progression & Uncertainty Bounds */}
        <div className="flex flex-wrap items-center justify-between text-xs font-sans text-slate-400 border-t border-[#1E2D4A] pt-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[#38BDF8] font-semibold uppercase text-[10px] tracking-wider">Advisory Window:</span>
            <span>Peak orographic surge threat window: +2h to +2.5h</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>
              Peak Risk: <strong className="text-rose-400 font-semibold">+2h to +2.5h (98%)</strong>
            </span>
            <span className="text-slate-700">|</span>
            <span>
              Uncertainty Margin: <strong className="text-slate-300 font-medium">±{Math.round(15 + (currentHorizonMinutes / 60) * 8)}%</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
