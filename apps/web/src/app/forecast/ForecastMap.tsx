import React, { useState, useMemo } from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Compass, MapPin, Layers } from "lucide-react";
import { ActiveLayers } from "./RiskLayers";
import { SelectedCellData } from "./RiskPanel";
import RiskBadge, { SeverityLevel } from "../components/RiskBadge";

// Pilot grid cells over Uttarakhand Convective Corridor
export const GRID_CELLS: SelectedCellData[] = [
  {
    cellId: "3012_7824",
    name: "Rishikesh - Shivpuri River Gorge",
    coordinates: [78.267, 30.086],
    severity: "warning",
    horizonMinutes: 120,
    validTime: "2026-09-11 10:30 UTC",
    probabilities: { thunderstorm: 0.78, cloudburst: 0.56, flashFlood: 0.82 },
    terrain: { slopeDeg: 38.4, elevationM: 372, twi: 12.1, catchmentVuln: 0.85 },
    xaiAttribution: [
      { feature: "cape", label: "Convective Instability (CAPE)", contribution: 0.38, observedValue: 3150, unit: "J/kg" },
      { feature: "cooling", label: "TIR1 Cloud Cooling Rate", contribution: 0.28, observedValue: -16.5, unit: "K/hr" },
      { feature: "slope", label: "Steep Valley Slope", contribution: 0.22, observedValue: 38.4, unit: "°" },
      { feature: "tpw", label: "Total Column Moisture", contribution: 0.12, observedValue: 58.2, unit: "mm" },
    ],
  },
  {
    cellId: "3031_7803",
    name: "Dehradun - Rajpur Foothill",
    coordinates: [78.032, 30.316],
    severity: "watch",
    horizonMinutes: 120,
    validTime: "2026-09-11 10:30 UTC",
    probabilities: { thunderstorm: 0.64, cloudburst: 0.32, flashFlood: 0.51 },
    terrain: { slopeDeg: 22.5, elevationM: 640, twi: 9.4, catchmentVuln: 0.65 },
    xaiAttribution: [
      { feature: "cape", label: "Convective Instability (CAPE)", contribution: 0.42, observedValue: 2650, unit: "J/kg" },
      { feature: "cin", label: "Cap Inversion Break", contribution: -0.15, observedValue: -18, unit: "J/kg" },
      { feature: "tpw", label: "Precipitable Water", contribution: 0.25, observedValue: 51.0, unit: "mm" },
    ],
  },
  {
    cellId: "3073_7906",
    name: "Kedarnath - Mandakini Watershed",
    coordinates: [79.066, 30.735],
    severity: "critical",
    horizonMinutes: 120,
    validTime: "2026-09-11 10:30 UTC",
    probabilities: { thunderstorm: 0.88, cloudburst: 0.82, flashFlood: 0.94 },
    terrain: { slopeDeg: 46.2, elevationM: 3583, twi: 14.8, catchmentVuln: 0.96 },
    xaiAttribution: [
      { feature: "cloudburst", label: "Extreme Convective Updraft", contribution: 0.45, observedValue: 120, unit: "mm/h" },
      { feature: "slope", label: "Severe Cirque Slope", contribution: 0.31, observedValue: 46.2, unit: "°" },
      { feature: "cooling", label: "Rapid Ice Core Ascent", contribution: 0.24, observedValue: -21.4, unit: "K/hr" },
    ],
  },
  {
    cellId: "3072_7843",
    name: "Uttarkashi - Bhagirathi Canyon",
    coordinates: [78.435, 30.726],
    severity: "watch",
    horizonMinutes: 120,
    validTime: "2026-09-11 10:30 UTC",
    probabilities: { thunderstorm: 0.58, cloudburst: 0.39, flashFlood: 0.62 },
    terrain: { slopeDeg: 34.0, elevationM: 1158, twi: 10.2, catchmentVuln: 0.74 },
    xaiAttribution: [
      { feature: "cape", label: "Orographic Lift & CAPE", contribution: 0.39, observedValue: 2400, unit: "J/kg" },
      { feature: "radar", label: "Upstream Reflectivity", contribution: 0.35, observedValue: 44, unit: "dBZ" },
    ],
  },
  {
    cellId: "3055_7935",
    name: "Chamoli - Alaknanda Valley",
    coordinates: [79.350, 30.558],
    severity: "warning",
    horizonMinutes: 120,
    validTime: "2026-09-11 10:30 UTC",
    probabilities: { thunderstorm: 0.74, cloudburst: 0.68, flashFlood: 0.86 },
    terrain: { slopeDeg: 41.5, elevationM: 1890, twi: 11.7, catchmentVuln: 0.89 },
    xaiAttribution: [
      { feature: "slope", label: "Gorge Channeling & Slope", contribution: 0.40, observedValue: 41.5, unit: "°" },
      { feature: "cooling", label: "TIR1 Cloud Deepening", contribution: 0.32, observedValue: -17.8, unit: "K/hr" },
      { feature: "tpw", label: "Precipitable Water", contribution: 0.28, observedValue: 56.4, unit: "mm" },
    ],
  },
  {
    cellId: "2994_7816",
    name: "Haridwar - Upper Gangetic Plain",
    coordinates: [78.164, 29.945],
    severity: "advisory",
    horizonMinutes: 120,
    validTime: "2026-09-11 10:30 UTC",
    probabilities: { thunderstorm: 0.38, cloudburst: 0.12, flashFlood: 0.25 },
    terrain: { slopeDeg: 4.2, elevationM: 250, twi: 6.8, catchmentVuln: 0.38 },
    xaiAttribution: [
      { feature: "cape", label: "Surface Inflow CAPE", contribution: 0.52, observedValue: 2100, unit: "J/kg" },
      { feature: "cin", label: "Strong Boundary Inversion", contribution: -0.30, observedValue: -48, unit: "J/kg" },
    ],
  },
];

interface ForecastMapProps {
  layers: ActiveLayers;
  selectedCell: SelectedCellData | null;
  onSelectCell: (cell: SelectedCellData) => void;
  horizonMinutes: number;
  className?: string;
}

export default function ForecastMap({
  layers,
  selectedCell,
  onSelectCell,
  horizonMinutes,
  className = "",
}: ForecastMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState<SelectedCellData | null>(null);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));
  const handleReset = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Convert lat/lng to SVG percentage position relative to Uttarakhand bounding box
  // [77.5 - 80.5 E, 29.5 - 31.5 N]
  const getCoordinatesPct = (coords: [number, number]) => {
    const minLon = 77.5;
    const maxLon = 80.5;
    const minLat = 29.5;
    const maxLat = 31.5;

    const x = ((coords[0] - minLon) / (maxLon - minLon)) * 100;
    const y = 100 - ((coords[1] - minLat) / (maxLat - minLat)) * 100;
    return { x, y };
  };

  return (
    <div
      className={`relative flex flex-col h-full w-full overflow-hidden rounded-lg border border-slate-800 bg-[#070b14] shadow-2xl ${className}`}
    >
      {/* Top Map Status Bar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 rounded-md border border-slate-700/80 bg-[#0b1220]/90 px-2.5 py-1 text-slate-200 backdrop-blur shadow-md">
          <Compass className="h-3.5 w-3.5 text-cyan-400" />
          <span>PILOT DOMAIN: UTTARAKHAND (HIMALAYAS)</span>
        </div>
        <div className="rounded-md border border-slate-800 bg-[#0b1220]/80 px-2 py-1 text-slate-400 backdrop-blur">
          CRS: EPSG:4326 • GRID: 0.04° (~4km)
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="flex h-7 w-7 items-center justify-center rounded border border-slate-700/80 bg-[#0c1322]/90 text-slate-200 hover:bg-slate-800 hover:text-cyan-400 shadow backdrop-blur transition"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-7 w-7 items-center justify-center rounded border border-slate-700/80 bg-[#0c1322]/90 text-slate-200 hover:bg-slate-800 hover:text-cyan-400 shadow backdrop-blur transition"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          className="flex h-7 w-7 items-center justify-center rounded border border-slate-700/80 bg-[#0c1322]/90 text-slate-200 hover:bg-slate-800 hover:text-cyan-400 shadow backdrop-blur transition"
          title="Reset Map View"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Interactive GIS SVG Canvas */}
      <div className="relative flex-1 w-full h-full cursor-crosshair overflow-hidden">
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full select-none"
          style={{
            transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "center center",
            transition: "transform 0.3s ease-out",
          }}
        >
          <defs>
            {/* Background topographic contour pattern */}
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#131e33" strokeWidth="0.75" />
            </pattern>
            {/* Mountain terrain contour filter */}
            <radialGradient id="himalayan-elevation" cx="60%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#1a2744" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#10192e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#070b14" stopOpacity="0.1" />
            </radialGradient>
            {/* Flash flood warning pulse */}
            <radialGradient id="pulse-gradient-critical" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base GIS Grid Background */}
          <rect width="1000" height="650" fill="#070b14" />
          <rect width="1000" height="650" fill="url(#grid-pattern)" />

          {/* Himalayan Mountain Range Massif (Elevation Contour Representation) */}
          {layers.terrainSusceptibility && (
            <path
              d="M 150 120 Q 350 80, 550 90 T 950 140 L 980 400 Q 750 480, 450 500 T 50 450 Z"
              fill="url(#himalayan-elevation)"
              stroke="#223659"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {/* Primary River Drainage Channels (Ganga, Alaknanda, Bhagirathi, Mandakini) */}
          <g stroke="#1e3a8a" strokeWidth="2" fill="none" opacity="0.65">
            {/* Bhagirathi / Ganga */}
            <path d="M 380 180 Q 320 280, 250 420 T 220 600" />
            {/* Alaknanda */}
            <path d="M 720 220 Q 550 320, 360 380 L 250 420" />
            {/* Mandakini */}
            <path d="M 520 160 Q 480 260, 440 340 L 410 370" />
          </g>

          {/* Radar Reflectivity Overlay Wave/Beams */}
          {layers.radarReflectivity && (
            <g opacity="0.35">
              <circle cx="280" cy="400" r="140" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="280" cy="400" r="260" fill="none" stroke="#a855f7" strokeWidth="0.75" strokeDasharray="4 4" />
              <circle cx="700" cy="240" r="160" fill="none" stroke="#ec4899" strokeWidth="1" strokeDasharray="3 3" />
            </g>
          )}

          {/* Grid Cells & Nowcast Convective Hazard Heatmap */}
          {GRID_CELLS.map((cell) => {
            const { x, y } = getCoordinatesPct(cell.coordinates);
            const svgX = (x / 100) * 1000;
            const svgY = (y / 100) * 650;
            const isSelected = selectedCell?.cellId === cell.cellId;
            const isHovered = hoveredCell?.cellId === cell.cellId;

            // Determine color and radius based on active layer
            let fillColor = "#10b981"; // Low/none
            let strokeColor = "#34d399";
            let radius = 28;

            if (cell.severity === "critical") {
              fillColor = "#ef4444";
              strokeColor = "#fca5a5";
              radius = 38;
            } else if (cell.severity === "warning") {
              fillColor = "#f97316";
              strokeColor = "#fdba74";
              radius = 34;
            } else if (cell.severity === "watch") {
              fillColor = "#f59e0b";
              strokeColor = "#fde68a";
              radius = 30;
            }

            return (
              <g
                key={cell.cellId}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectCell(cell)}
                onMouseEnter={() => setHoveredCell(cell)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {/* Convective risk zone heat aura */}
                <circle
                  cx={svgX}
                  cy={svgY}
                  r={radius * (isSelected ? 1.6 : 1.2)}
                  fill={fillColor}
                  opacity={isSelected ? 0.35 : 0.2}
                  className={cell.severity === "critical" ? "animate-pulse" : ""}
                />

                {/* Watershed Catchment Grid Box */}
                <rect
                  x={svgX - 22}
                  y={svgY - 22}
                  width={44}
                  height={44}
                  rx={6}
                  fill={isSelected ? "#172554" : "#0d172b"}
                  stroke={isSelected ? "#38bdf8" : strokeColor}
                  strokeWidth={isSelected ? 2.5 : 1.2}
                  opacity={0.9}
                />

                {/* Center marker / severity icon */}
                <circle cx={svgX} cy={svgY} r={5} fill={fillColor} />

                {/* Cell label */}
                <text
                  x={svgX}
                  y={svgY + 34}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="600"
                >
                  {cell.name.split("-")[0].trim()}
                </text>
                <text
                  x={svgX}
                  y={svgY + 46}
                  textAnchor="middle"
                  fill={fillColor}
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="700"
                >
                  {cell.severity.toUpperCase()} (T+{horizonMinutes / 60}h)
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Inspector Tooltip */}
        {hoveredCell && (
          <div
            className="pointer-events-none absolute bottom-4 left-4 z-30 rounded-lg border border-slate-700 bg-[#0c1322]/95 p-3 shadow-2xl backdrop-blur font-mono text-xs max-w-xs"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <span className="font-semibold text-slate-100">{hoveredCell.name}</span>
              <RiskBadge severity={hoveredCell.severity} size="sm" />
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Flash Flood Probability:</span>
                <span className="font-bold text-rose-400">
                  {Math.round(hoveredCell.probabilities.flashFlood * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thunderstorm Convection:</span>
                <span className="font-bold text-amber-400">
                  {Math.round(hoveredCell.probabilities.thunderstorm * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Catchment Slope:</span>
                <span>{hoveredCell.terrain.slopeDeg}°</span>
              </div>
            </div>
            <div className="mt-2 text-[9px] text-cyan-400">
              Click cell to open detailed Explainable AI factors
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-3 rounded-md border border-slate-800/90 bg-[#090e1a]/95 px-3 py-1.5 font-mono text-[10px] text-slate-300 backdrop-blur shadow-lg">
        <span className="text-slate-400 font-semibold uppercase">Severity:</span>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Advisory</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span>Watch</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Warning / Crit</span>
        </div>
      </div>
    </div>
  );
}
