import React from "react";
import { CloudLightning, CloudRain, Waves, Mountain, Radio, Eye, EyeOff, Layers } from "lucide-react";

export interface ActiveLayers {
  thunderstorm: boolean;
  cloudburst: boolean;
  flashFlood: boolean;
  terrainSusceptibility: boolean;
  radarReflectivity: boolean;
}

interface RiskLayersProps {
  layers: ActiveLayers;
  onToggleLayer: (layerKey: keyof ActiveLayers) => void;
  className?: string;
}

export default function RiskLayers({
  layers,
  onToggleLayer,
  className = "",
}: RiskLayersProps) {
  const layerOptions = [
    {
      key: "thunderstorm" as keyof ActiveLayers,
      label: "Thunderstorm Risk",
      icon: CloudLightning,
      color: "text-amber-400",
      activeBg: "bg-amber-950/40 border-amber-800/60",
      description: "Storm activity & lightning risk",
    },
    {
      key: "cloudburst" as keyof ActiveLayers,
      label: "Heavy Rain Risk",
      icon: CloudRain,
      color: "text-orange-400",
      activeBg: "bg-orange-950/40 border-orange-800/60",
      description: "Extremely heavy downpours (≥100mm/h)",
    },
    {
      key: "flashFlood" as keyof ActiveLayers,
      label: "Flash Flood Risk",
      icon: Waves,
      color: "text-rose-400",
      activeBg: "bg-rose-950/40 border-rose-800/60",
      description: "Water runoff & flooding in valleys",
    },
    {
      key: "terrainSusceptibility" as keyof ActiveLayers,
      label: "Terrain Vulnerability",
      icon: Mountain,
      color: "text-cyan-400",
      activeBg: "bg-cyan-950/40 border-cyan-800/60",
      description: "Steep slopes and water collection areas",
    },
    {
      key: "radarReflectivity" as keyof ActiveLayers,
      label: "Weather Radar",
      icon: Radio,
      color: "text-purple-400",
      activeBg: "bg-purple-950/40 border-purple-800/60",
      description: "Radar reflectivity showing rain cores",
    },
  ];

  return (
    <div className={`rounded-lg border border-slate-800 bg-[#0c1220]/90 p-3 shadow-lg backdrop-blur ${className}`}>
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 mb-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
        <Layers className="h-3.5 w-3.5 text-cyan-400" />
        Map Weather Layers
      </div>

      <div className="space-y-1.5">
        {layerOptions.map((opt) => {
          const isActive = layers[opt.key];
          const Icon = opt.icon;

          return (
            <button
              key={opt.key}
              onClick={() => onToggleLayer(opt.key)}
              className={`flex w-full items-center justify-between rounded border p-2 text-left transition-all ${
                isActive
                  ? `${opt.activeBg} text-slate-100`
                  : "border-slate-800/50 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${opt.color}`} />
                <div>
                  <div className="text-xs font-medium">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {opt.description}
                  </div>
                </div>
              </div>

              <div className="ml-2">
                {isActive ? (
                  <Eye className="h-3.5 w-3.5 text-slate-300" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-slate-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
