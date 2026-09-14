import React, { useState, useRef, useEffect } from "react";
import { Search, X, Crosshair } from "lucide-react";
import LocationResults, { SearchLocation } from "./LocationResults";

// Baseline monitoring stations & river catchments across Uttarakhand Pilot Region
export const PILOT_LOCATIONS: SearchLocation[] = [
  {
    id: "loc_rishikesh",
    name: "Rishikesh Convective Corridor",
    basin: "Lower Ganga Catchment",
    district: "Dehradun / Tehri",
    coordinates: [78.2676, 30.0869],
    currentRisk: "warning",
    elevationM: 372,
    catchmentVuln: 0.85,
  },
  {
    id: "loc_dehradun",
    name: "Dehradun Urban Basin",
    basin: "Song / Bindal Watershed",
    district: "Dehradun",
    coordinates: [78.0322, 30.3165],
    currentRisk: "watch",
    elevationM: 640,
    catchmentVuln: 0.65,
  },
  {
    id: "loc_kedarnath",
    name: "Kedarnath Valley Catchment",
    basin: "Upper Mandakini Basin",
    district: "Rudraprayag",
    coordinates: [79.0669, 30.7352],
    currentRisk: "critical",
    elevationM: 3583,
    catchmentVuln: 0.94,
  },
  {
    id: "loc_uttarkashi",
    name: "Uttarkashi Gorge Watershed",
    basin: "Bhagirathi River Basin",
    district: "Uttarkashi",
    coordinates: [78.4354, 30.7268],
    currentRisk: "watch",
    elevationM: 1158,
    catchmentVuln: 0.78,
  },
  {
    id: "loc_chamoli",
    name: "Chamoli - Joshimath Zone",
    basin: "Alaknanda / Dhauliganga",
    district: "Chamoli",
    coordinates: [79.3504, 30.5583],
    currentRisk: "warning",
    elevationM: 1890,
    catchmentVuln: 0.88,
  },
  {
    id: "loc_haridwar",
    name: "Haridwar Floodplain",
    basin: "Ganga Alluvial Plain",
    district: "Haridwar",
    coordinates: [78.1642, 29.9457],
    currentRisk: "advisory",
    elevationM: 250,
    catchmentVuln: 0.42,
  },
];

interface LocationSearchProps {
  onLocationSelect: (location: SearchLocation) => void;
  className?: string;
}

export default function LocationSearch({
  onLocationSelect,
  className = "",
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? PILOT_LOCATIONS.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query.toLowerCase()) ||
          loc.basin.toLowerCase().includes(query.toLowerCase()) ||
          loc.district.toLowerCase().includes(query.toLowerCase())
      )
    : PILOT_LOCATIONS;

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (loc: SearchLocation) => {
    setQuery(loc.name);
    setIsOpen(false);
    onLocationSelect(loc);
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-md ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search basin, catchment, or station (e.g., Rishikesh, Kedarnath)..."
          className="w-full h-8 rounded-lg border border-[#1F3350] bg-[#111A2C]/90 pl-9 pr-12 text-xs text-slate-100 placeholder-slate-400 shadow-inner backdrop-blur focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/30 font-sans"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-2.5 text-slate-400 hover:text-slate-200"
            aria-label="Clear search query"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="pointer-events-none absolute right-2.5 hidden sm:inline-block rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 border border-slate-700/50">
            ⌘K
          </span>
        )}
      </div>

      {isOpen && (
        <LocationResults
          results={filtered}
          onSelectLocation={handleSelect}
        />
      )}
    </div>
  );
}
