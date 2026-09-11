import React, { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Clock, Calendar } from "lucide-react";

interface TimelineProps {
  currentHorizonMinutes: number;
  onHorizonChange: (minutes: number) => void;
  baseTimestampUtc?: string; // Base observation time (e.g. 2026-09-11 08:30)
  className?: string;
}

export const HORIZONS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]; // 0 to 6 hours

export default function Timeline({
  currentHorizonMinutes,
  onHorizonChange,
  baseTimestampUtc = "2026-09-11T08:30:00Z",
  className = "",
}: TimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // ms per step

  // Format valid timestamp: base + horizon minutes
  const getValidTime = (minutes: number) => {
    const base = new Date(baseTimestampUtc);
    const valid = new Date(base.getTime() + minutes * 60000);
    return valid.toUTCString().slice(17, 22) + " UTC";
  };

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
      className={`rounded-lg border border-slate-800 bg-[#0c1322]/95 p-3.5 shadow-xl backdrop-blur-md ${className}`}
    >
      <div className="flex flex-col gap-3">
        {/* Header Row: Current Horizon, Valid Time, Playback Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-200">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>LEAD TIME:</span>
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-cyan-300 border border-cyan-800/60 font-bold">
                T + {Math.floor(currentHorizonMinutes / 60)}h {currentHorizonMinutes % 60 ? `${currentHorizonMinutes % 60}m` : ""}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>VALID TIME:</span>
              <span className="text-slate-100 font-semibold">{getValidTime(currentHorizonMinutes)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 font-mono">
            {isPlaying && (
              <div className="flex items-center gap-1.5 rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-600/60 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                <span>TIMELAPSE ACTIVE</span>
              </div>
            )}

            {/* Playback speed selector */}
            <div className="flex items-center rounded border border-slate-700 bg-slate-800/80 p-0.5 text-[10px]">
              <button
                onClick={() => setPlaybackSpeed(1500)}
                className={`px-1.5 py-0.5 rounded transition ${playbackSpeed === 1500 ? "bg-cyan-900 text-cyan-200 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                title="1x speed (1.5s per step)"
              >
                1x
              </button>
              <button
                onClick={() => setPlaybackSpeed(750)}
                className={`px-1.5 py-0.5 rounded transition ${playbackSpeed === 750 ? "bg-cyan-900 text-cyan-200 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                title="2x speed (0.75s per step)"
              >
                2x
              </button>
              <button
                onClick={() => setPlaybackSpeed(350)}
                className={`px-1.5 py-0.5 rounded transition ${playbackSpeed === 350 ? "bg-cyan-900 text-cyan-200 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                title="4x speed (0.35s per step)"
              >
                4x
              </button>
            </div>

            <button
              onClick={handleStepPrev}
              disabled={currentHorizonMinutes === HORIZONS[0]}
              className="rounded border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition"
              aria-label="Previous forecast horizon step"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1 rounded border px-3 py-1 text-xs font-semibold transition ${
                isPlaying
                  ? "border-amber-600 bg-amber-950 text-amber-300 shadow-md shadow-amber-900/30"
                  : "border-cyan-600 bg-cyan-950 text-cyan-300 hover:bg-cyan-900"
              }`}
              aria-label={isPlaying ? "Pause automated playback" : "Play nowcast animation sequence"}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>PLAY NOWCAST</span>
                </>
              )}
            </button>

            <button
              onClick={handleStepNext}
              disabled={currentHorizonMinutes === HORIZONS[HORIZONS.length - 1]}
              className="rounded border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition"
              aria-label="Next forecast horizon step"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Range Slider & Horizon Notches */}
        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min={0}
            max={HORIZONS.length - 1}
            step={1}
            value={HORIZONS.indexOf(currentHorizonMinutes)}
            onChange={(e) => onHorizonChange(HORIZONS[Number(e.target.value)])}
            className="w-full accent-cyan-400 bg-slate-800 cursor-pointer h-1.5 rounded-lg appearance-none"
          />

          {/* Notches */}
          <div className="flex justify-between px-1 mt-2 text-[10px] font-mono text-slate-400 select-none">
            {HORIZONS.filter((_, idx) => idx % 2 === 0).map((min) => (
              <button
                key={min}
                onClick={() => onHorizonChange(min)}
                className={`hover:text-cyan-300 transition ${
                  currentHorizonMinutes === min
                    ? "font-bold text-cyan-400 scale-110"
                    : ""
                }`}
              >
                +{min / 60}h
              </button>
            ))}
          </div>
        </div>

        {/* Uncertainty notice */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/60 pt-2">
          <span>Actionable decision window: 2 to 6 hours lead time</span>
          <span className="text-slate-400">
            Uncertainty spread: ±{Math.round(15 + (currentHorizonMinutes / 60) * 10)}% at T+{Math.floor(currentHorizonMinutes / 60)}h
          </span>
        </div>
      </div>
    </div>
  );
}
