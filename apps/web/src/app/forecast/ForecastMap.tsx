"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Layers,
  Map as MapIcon,
  Satellite,
  Mountain,
} from "lucide-react";
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

export type FilterMode = "all" | "critical" | "flash_flood" | "steep_gorges" | "foothills";
export type BasemapMode = "dark" | "satellite" | "topo";

interface ForecastMapProps {
  layers: ActiveLayers;
  selectedCell: SelectedCellData | null;
  onSelectCell: (cell: SelectedCellData) => void;
  horizonMinutes: number;
  className?: string;
  filterMode?: FilterMode;
}

export default function ForecastMap({
  layers,
  selectedCell,
  onSelectCell,
  horizonMinutes,
  className = "",
  filterMode = "all",
}: ForecastMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerGroupRef = useRef<any>(null);
  const radarLayerGroupRef = useRef<any>(null);
  const [basemap, setBasemap] = useState<BasemapMode>("dark");
  const [isMapReady, setIsMapReady] = useState(false);

  const isCellMatch = (cell: SelectedCellData) => {
    if (!filterMode || filterMode === "all") return true;
    if (filterMode === "critical") return cell.severity === "critical" || cell.severity === "warning";
    if (filterMode === "flash_flood") return cell.probabilities.flashFlood >= 0.70;
    if (filterMode === "steep_gorges") return cell.terrain.slopeDeg >= 35.0;
    if (filterMode === "foothills") return cell.terrain.elevationM < 800;
    return true;
  };

  const matchingCellsCount = useMemo(() => GRID_CELLS.filter(isCellMatch).length, [filterMode]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return; // Already initialized

      // Center around Uttarakhand Himalayan corridor
      const map = L.map(mapContainerRef.current, {
        center: [30.35, 78.75],
        zoom: 9,
        minZoom: 6,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: true,
      });

      // CartoDB Dark Matter base layer
      const darkTile = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      tileLayerRef.current = darkTile;

      // Add zoom controls at top right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Operational boundary outline for Uttarakhand pilot domain
      const boundaryCoords: [number, number][] = [
        [31.45, 77.65],
        [31.42, 78.45],
        [31.25, 79.25],
        [30.95, 80.35],
        [30.45, 80.85],
        [29.85, 80.55],
        [29.35, 79.95],
        [29.25, 79.15],
        [29.45, 78.45],
        [30.15, 77.75],
        [30.85, 77.55],
        [31.45, 77.65],
      ];

      L.polygon(boundaryCoords, {
        color: "#0284c7",
        weight: 1.5,
        dashArray: "6, 4",
        fillColor: "#0369a1",
        fillOpacity: 0.04,
      }).addTo(map);

      // Create Layer Groups
      const markersGroup = L.layerGroup().addTo(map);
      const radarGroup = L.layerGroup().addTo(map);

      markersLayerGroupRef.current = markersGroup;
      radarLayerGroupRef.current = radarGroup;
      mapInstanceRef.current = map;
      setIsMapReady(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Basemap Switcher
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      map.removeLayer(tileLayerRef.current);

      let url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      let options: any = {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        subdomains: "abcd",
        maxZoom: 19,
      };

      if (basemap === "satellite") {
        url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        options = {
          attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP",
          maxZoom: 18,
        };
      } else if (basemap === "topo") {
        url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
        options = {
          attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
          maxZoom: 18,
        };
      }

      const newTile = L.tileLayer(url, options).addTo(map);
      tileLayerRef.current = newTile;
    });
  }, [basemap]);

  // 3. Render Grid Cell Markers & Radar Reflectivity
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current || !isMapReady) return;

    import("leaflet").then((L) => {
      const markersGroup = markersLayerGroupRef.current;
      const radarGroup = radarLayerGroupRef.current;
      markersGroup.clearLayers();
      radarGroup.clearLayers();

      // Draw Doppler Radar Wave if enabled
      if (layers.radarReflectivity) {
        // DWR Stations: Dehradun & Mukteshwar
        const radarStations = [
          { name: "DWR Dehradun", lat: 30.316, lon: 78.032, color: "#a855f7" },
          { name: "DWR Mukteshwar / Chamoli", lat: 30.45, lon: 79.35, color: "#ec4899" },
        ];

        radarStations.forEach((stn) => {
          [20000, 45000, 75000].forEach((radius, idx) => {
            L.circle([stn.lat, stn.lon], {
              radius,
              color: stn.color,
              weight: 1,
              dashArray: "4, 6",
              fillColor: stn.color,
              fillOpacity: 0.03 + idx * 0.02,
            }).addTo(radarGroup);
          });
        });
      }

      // Draw Grid Cells
      GRID_CELLS.forEach((cell) => {
        const matches = isCellMatch(cell);
        const isSelected = selectedCell?.cellId === cell.cellId;
        const lat = cell.coordinates[1];
        const lon = cell.coordinates[0];

        // Colors & Shape cue according to constitution standard
        let bgHex = "#10b981";
        let borderHex = "#34d399";
        let shapeSymbol = "●";
        let isCritical = cell.severity === "critical";

        if (cell.severity === "critical") {
          bgHex = "#ef4444";
          borderHex = "#fca5a5";
          shapeSymbol = "▲";
        } else if (cell.severity === "warning") {
          bgHex = "#f97316";
          borderHex = "#fdba74";
          shapeSymbol = "▲";
        } else if (cell.severity === "watch") {
          bgHex = "#f59e0b";
          borderHex = "#fde68a";
          shapeSymbol = "◆";
        }

        // Catchment catchment bounds (0.04° grid box)
        const dLat = 0.02;
        const dLon = 0.02;
        const cellBounds: [number, number][] = [
          [lat - dLat, lon - dLon],
          [lat - dLat, lon + dLon],
          [lat + dLat, lon + dLon],
          [lat + dLat, lon - dLon],
        ];

        const polygon = L.polygon(cellBounds, {
          color: isSelected ? "#38bdf8" : borderHex,
          weight: isSelected ? 2.5 : 1.2,
          fillColor: bgHex,
          fillOpacity: matches ? (isSelected ? 0.45 : 0.25) : 0.05,
        });

        polygon.on("click", () => onSelectCell(cell));
        polygon.addTo(markersGroup);

        // Custom HTML Marker with shape cue & calm halo
        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition transform hover:scale-105">
            ${
              isCritical
                ? `<span class="absolute h-9 w-9 rounded-full bg-rose-500/30 animate-pulse pointer-events-none"></span>`
                : ""
            }
            <div class="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 shadow-lg font-sans text-[11px] font-semibold text-white border ${
              isSelected ? "ring-2 ring-sky-400 ring-offset-1 ring-offset-[#080E1A] scale-105" : ""
            }" style="background-color: ${bgHex}; border-color: ${borderHex};">
              <span class="text-xs leading-none">${shapeSymbol}</span>
              <span>${cell.name.split("-")[0].trim()}</span>
              <span class="opacity-85 text-[10px]">(${Math.round(cell.probabilities.flashFlood * 100)}%)</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-div-icon",
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([lat, lon], { icon: customIcon });

        // Tooltip Popup
        const tooltipHtml = `
          <div class="p-1.5 font-sans text-xs min-w-[200px]">
            <div class="flex items-center justify-between gap-3 border-b border-slate-700/80 pb-1.5 mb-1.5 font-semibold">
              <span class="text-slate-100">${cell.name}</span>
              <span class="uppercase text-[10px] px-1.5 py-0.5 rounded font-bold" style="background:${bgHex}; color:#fff;">${cell.severity} ${shapeSymbol}</span>
            </div>
            <div class="space-y-1.5 text-slate-300">
              <div class="flex justify-between">
                <span class="text-slate-400">Surge Risk (R_surge):</span>
                <span class="font-bold text-rose-400">${Math.round(cell.probabilities.flashFlood * 100)}%</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-sky-400">Atmospheric Severity (P_meteo):</span>
                <span class="font-semibold text-slate-200">${Math.round((cell.probabilities.cloudburst * 0.75 + cell.probabilities.thunderstorm * 0.25) * 100)}%</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-amber-400">Terrain Incline & Height:</span>
                <span class="font-semibold text-slate-200">${cell.terrain.slopeDeg}° / ${cell.terrain.elevationM}m</span>
              </div>
            </div>
            <div class="mt-2 text-[10px] text-sky-400/90 border-t border-slate-800/80 pt-1 flex items-center justify-between">
              <span>Click to inspect details</span>
              <span>●</span>
            </div>
          </div>
        `;

        marker.bindTooltip(tooltipHtml, {
          direction: "top",
          offset: [0, -10],
          opacity: 0.95,
          className: "custom-leaflet-tooltip",
        });

        marker.on("click", () => onSelectCell(cell));
        marker.addTo(markersGroup);
      });
    });
  }, [layers, selectedCell, filterMode, isMapReady, onSelectCell]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => {
    mapInstanceRef.current?.setView([30.35, 78.75], 9);
  };

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#080E1A] ${className}`}>
      {/* Real Interactive Leaflet Container */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Top Left: Pilot Domain Status */}
      <div className="absolute top-3 left-3 z-10 hidden sm:flex items-center gap-2 font-sans text-xs">
        <div className="flex items-center gap-2 rounded-lg border border-[#1E2D4A] bg-[#111A2C]/90 px-3 py-1.5 text-slate-200 backdrop-blur shadow-lg">
          <Compass className="h-4 w-4 text-[#38BDF8]" />
          <span className="font-semibold tracking-wide">UTTARAKHAND CONVECTIVE CORRIDOR</span>
        </div>
        <div className="rounded-lg border border-[#1E2D4A] bg-[#111A2C]/80 px-2.5 py-1.5 text-slate-400 backdrop-blur text-[11px]">
          EPSG:4326 • 0.04° (~4km)
        </div>
      </div>

      {/* Top Right: Basemap Switcher & Zoom Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {/* Basemap Toggle Pills */}
        <div className="flex items-center rounded-lg border border-[#1E2D4A] bg-[#111A2C]/90 p-1 backdrop-blur shadow-lg font-sans text-xs">
          <button
            onClick={() => setBasemap("dark")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition font-medium ${
              basemap === "dark"
                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#16233B]"
            }`}
            title="Dark Matter Tactical GIS Basemap"
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Dark</span>
          </button>
          <button
            onClick={() => setBasemap("satellite")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition font-medium ${
              basemap === "satellite"
                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#16233B]"
            }`}
            title="Orbital Satellite Basemap"
          >
            <Satellite className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Satellite</span>
          </button>
          <button
            onClick={() => setBasemap("topo")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition font-medium ${
              basemap === "topo"
                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#16233B]"
            }`}
            title="Shaded Relief Topography Basemap"
          >
            <Mountain className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Terrain</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center rounded-lg border border-[#1E2D4A] bg-[#111A2C]/90 p-1 backdrop-blur shadow-lg">
          <button
            onClick={handleZoomIn}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 hover:bg-[#16233B] hover:text-[#38BDF8] transition"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 hover:bg-[#16233B] hover:text-[#38BDF8] transition"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 hover:bg-[#16233B] hover:text-[#38BDF8] transition"
            title="Reset to Uttarakhand Corridor"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Right: Accessible Geometric Shape Cue Legend */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-3 rounded-lg border border-[#1E2D4A] bg-[#111A2C]/95 px-3 py-1.5 font-sans text-xs text-slate-300 backdrop-blur shadow-xl">
        <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Severity:</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span>Low (●)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 bg-amber-400 transform rotate-45" />
          <span>Watch (◆)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block text-orange-400 font-bold leading-none">▲</span>
          <span>Warning (▲)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block text-rose-400 font-bold leading-none animate-pulse">▲</span>
          <span>Critical (▲)</span>
        </div>
      </div>
    </div>
  );
}
