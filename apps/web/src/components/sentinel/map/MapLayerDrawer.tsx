"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { ActiveLayers } from "@/app/forecast/RiskLayers";
import {
  Layers,
  CloudLightning,
  CloudRain,
  Waves,
  Mountain,
  Radio,
  X,
  Check,
} from "lucide-react";

interface MapLayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MapLayerDrawer: React.FC<MapLayerDrawerProps> = ({ isOpen, onClose }) => {
  const { layers, toggleLayer } = useSentinel();

  if (!isOpen) return null;

  const layerItems: Array<{
    key: keyof ActiveLayers;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }> = [
    {
      key: "thunderstorm",
      label: "Thunderstorms & Lightning",
      description: "Convective storm cells and lightning potential",
      icon: CloudLightning,
      color: "text-amber-400",
    },
    {
      key: "cloudburst",
      label: "Extreme Rainfall",
      description: "Intense downpours (estimated ≥50 mm/h)",
      icon: CloudRain,
      color: "text-indigo-400",
    },
    {
      key: "flashFlood",
      label: "Flash Flood Risk",
      description: "Rapid water runoff combining rain with steep terrain",
      icon: Waves,
      color: "text-rose-400",
    },
    {
      key: "terrainSusceptibility",
      label: "Mountain Slopes & Drainage",
      description: "Slope steepness and natural runoff channels",
      icon: Mountain,
      color: "text-sky-400",
    },
    {
      key: "radarReflectivity",
      label: "Weather Radar",
      description: "Doppler radar rain and cloud density scans",
      icon: Radio,
      color: "text-purple-400",
    },
  ];

  const activeCount = Object.values(layers).filter(Boolean).length;

  return (
    <div
      className="absolute top-12 left-0 sm:left-3 z-30 w-72 sm:w-80 rounded-xl border border-[#2B3142] bg-[#121520]/98 p-3.5 shadow-xl backdrop-blur-xl text-slate-200 animate-in fade-in slide-in-from-left-2 duration-150 font-sans"
      role="region"
      aria-label="Weather Map Layers"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2330] pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-100">
            Map Layers
          </span>
          <span className="rounded bg-indigo-950/70 px-1.5 py-0.2 text-[10px] font-medium text-indigo-300 border border-indigo-500/30 font-mono">
            {activeCount} active
          </span>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-[#181C28] transition"
          aria-label="Close layers menu"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Layer Toggles */}
      <div className="space-y-1.5">
        {layerItems.map((item) => {
          const isActive = layers[item.key];
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => toggleLayer(item.key)}
              className={`flex w-full items-start justify-between rounded-lg border p-2 text-left transition-colors duration-150 ${
                isActive
                  ? "border-indigo-500/40 bg-[#1A1F2E] text-slate-100"
                  : "border-transparent bg-[#141722] text-slate-400 hover:bg-[#181C28] hover:text-slate-200"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isActive ? item.color : "text-slate-500"}`} />
                <div>
                  <div className="text-xs font-medium">{item.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="ml-2 mt-0.5 shrink-0">
                {isActive ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-600 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-[#2B3142] bg-[#0E1017]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-2.5 pt-2 border-t border-[#1E2330] flex justify-between text-[10px] font-mono text-slate-500">
        <span>Coverage: Uttarakhand</span>
        <span>Grid: ~4 km</span>
      </div>
    </div>
  );
};
