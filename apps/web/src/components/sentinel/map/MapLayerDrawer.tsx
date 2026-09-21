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
      className="absolute top-14 left-3 z-30 w-80 rounded-3xl border border-white/[0.08] bg-[#1D202B]/98 p-4 shadow-clay-card-elevated backdrop-blur-xl text-slate-200 animate-in fade-in slide-in-from-left-2 duration-150 font-sans"
      role="region"
      aria-label="Weather Map Layers"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">
            Weather Map Layers
          </span>
          <span className="rounded-full bg-[#1C1F30] px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/40 font-mono shadow-clay-badge">
            {activeCount} Active
          </span>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-1 text-zinc-400 hover:text-slate-200 hover:bg-[#252937] transition shadow-clay-btn active:translate-y-0.5"
          aria-label="Close Layers Menu"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Layer Toggles */}
      <div className="space-y-2">
        {layerItems.map((item) => {
          const isActive = layers[item.key];
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => toggleLayer(item.key)}
              className={`flex w-full items-start justify-between rounded-2xl border p-2.5 text-left transition-all duration-150 active:translate-y-0.5 ${
                isActive
                  ? "border-indigo-500/40 bg-[#252937] text-slate-100 shadow-clay-btn"
                  : "border-white/[0.04] bg-[#111217]/60 text-zinc-400 hover:bg-[#161820] hover:text-slate-200"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isActive ? item.color : "text-zinc-500"}`} />
                <div>
                  <div className="text-xs font-medium font-sans">{item.label}</div>
                  <div className="text-[10px] text-zinc-400 font-mono leading-tight mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="ml-2 mt-0.5 shrink-0">
                {isActive ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1C1F30] text-indigo-400 border border-indigo-400/50 shadow-clay-badge">
                    <Check className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/[0.08] bg-[#0B0C10]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex justify-between text-[10px] font-mono text-zinc-400">
        <span>Projection: EPSG:4326</span>
        <span>Resolution: 0.04° (~4km)</span>
      </div>
    </div>
  );
};
