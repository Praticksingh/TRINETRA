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
  Eye,
  EyeOff,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/sentinel/Button";

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
      label: "Thunderstorms",
      description: "Severe convective updrafts, lightning & hail potential",
      icon: CloudLightning,
      color: "text-amber-400",
    },
    {
      key: "cloudburst",
      label: "Cloudburst Risk",
      description: "Intense localized rain rate (forecast ≥100 mm/h)",
      icon: CloudRain,
      color: "text-amber-500",
    },
    {
      key: "flashFlood",
      label: "Flash Flood Risk",
      description: "Atmospheric rainfall combined with steep gorge runoff surge",
      icon: Waves,
      color: "text-rose-400",
    },
    {
      key: "terrainSusceptibility",
      label: "Mountain Terrain & Slopes",
      description: "ALOS 30m terrain slope & Topographic Wetness Index (TWI)",
      icon: Mountain,
      color: "text-sky-400",
    },
    {
      key: "radarReflectivity",
      label: "Weather Radar (DWR)",
      description: "Composite Doppler radar sweeps (dBZ reflectivity cores)",
      icon: Radio,
      color: "text-purple-400",
    },
  ];

  const activeCount = Object.values(layers).filter(Boolean).length;

  return (
    <div
      className="absolute top-14 left-3 z-30 w-80 rounded-xl border border-[#1F3350] bg-[#0C1322]/95 p-3.5 shadow-2xl backdrop-blur-md text-slate-200 animate-in fade-in slide-in-from-left-2 duration-150 font-sans"
      role="region"
      aria-label="Weather Map Layers"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1F3350]/80 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">
            Weather Map Layers
          </span>
          <span className="rounded bg-sky-950/70 px-1.5 py-0.2 text-[10px] font-bold text-sky-300 border border-sky-800/50 font-mono">
            {activeCount} Active
          </span>
        </div>

        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:text-slate-200 hover:bg-[#1F3350]/60 transition"
          aria-label="Close Layers Menu"
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
              className={`flex w-full items-start justify-between rounded-lg border p-2 text-left transition-all duration-150 ${
                isActive
                  ? "border-[#1F3350] bg-[#142235]/90 text-slate-100 shadow-sm"
                  : "border-transparent bg-transparent text-[#91A5BB] hover:bg-[#142235]/40 hover:text-slate-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isActive ? item.color : "text-slate-500"}`} />
                <div>
                  <div className="text-xs font-medium font-sans">{item.label}</div>
                  <div className="text-[10px] text-[#91A5BB] font-mono leading-tight mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="ml-2 mt-0.5 shrink-0">
                {isActive ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-sky-950 text-sky-400 border border-sky-600/50">
                    <Check className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-[#1F3350] bg-[#0F1A2A]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-[#1F3350]/80 flex justify-between text-[10px] font-mono text-[#91A5BB]">
        <span>Projection: EPSG:4326</span>
        <span>Resolution: 0.04° (~4km)</span>
      </div>
    </div>
  );
};
