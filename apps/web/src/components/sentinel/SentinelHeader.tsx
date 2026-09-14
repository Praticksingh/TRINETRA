"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  Activity,
  RefreshCw,
  Globe,
  Map,
  Layers,
  ChevronDown,
  Cpu,
  ShieldAlert,
  Menu,
  Search,
  Keyboard,
} from "lucide-react";
import { useSentinel } from "@/context/SentinelContext";
import LocationSearch from "@/app/search/LocationSearch";
import { SearchLocation } from "@/app/search/LocationResults";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { StatusDot } from "@/components/sentinel/StatusDot";
import { Button } from "@/components/sentinel/Button";
import { Badge } from "@/components/sentinel/Badge";

export const SentinelHeader: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    selectedModel,
    setSelectedModel,
    isBaselineActive,
    isLiveConnected,
    unacknowledgedAlertsCount,
    isTriggeringCycle,
    triggerNowcastCycle,
    toggleAlertDrawer,
    toggleSystemDrawer,
    toggleSidebar,
    setSelectedCell,
    openCommandPalette,
    openShortcutsModal,
  } = useSentinel();

  const handleLocationSelect = (loc: SearchLocation) => {
    const matching = GRID_CELLS.find((c) =>
      c.name.toLowerCase().includes(loc.name.toLowerCase().split(" ")[0])
    );
    if (matching) {
      setSelectedCell(matching);
      setCurrentView("map");
    }
  };

  return (
    <header className="z-30 flex h-13 items-center justify-between border-b border-[#1E2E48] bg-[#080E1A]/95 px-3 sm:px-4 backdrop-blur-md select-none text-slate-200 font-sans">
      {/* Left: Brand, Model Advisory disclaimer, Pilot Tag */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={toggleSidebar}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E2E48] bg-[#111A2C] text-slate-300 hover:text-sky-300 hover:border-sky-500/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-[#16233B] font-sans font-bold text-sky-400 text-xs shadow-sm">
          T3
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wider text-slate-100 font-sans">
              TRINETRA
            </span>
            <span className="rounded bg-sky-950/60 px-1.5 py-0.2 text-[9px] font-sans font-bold text-sky-300 border border-sky-800/40">
              SENTINEL
            </span>

            {/* Mandatory MODEL ADVISORY Safety Label */}
            <span className="hidden sm:inline-block rounded bg-amber-950/60 px-1.5 py-0.2 text-[9px] font-sans font-bold text-amber-300 border border-amber-700/50">
              MODEL ADVISORY
            </span>

            {/* Live Connection State */}
            {isLiveConnected ? (
              <span className="hidden md:inline-flex items-center gap-1 rounded bg-emerald-950/70 px-1.5 py-0.2 text-[9px] font-sans text-emerald-300 border border-emerald-700/60" title="Connected to live PostGIS / real-time sensors">
                <StatusDot status="nominal" size="sm" />
                Systems Live
              </span>
            ) : (
              <span className="hidden md:inline-block rounded bg-purple-950/60 px-1.5 py-0.2 text-[9px] font-sans text-purple-300 border border-purple-800/40" title="Offline replay / synthetic storm dataset">
                SYNTHETIC REPLAY
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 hidden sm:block font-sans">
            Hyper-Local Convective Weather Intelligence
          </p>
        </div>
      </div>

      {/* Center: Global Catchment & Station Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 items-center gap-2">
        <div className="flex-1">
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </div>
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-1 rounded-lg border border-[#1E2E48] bg-[#111A2C] px-2 h-8 text-xs text-slate-400 hover:text-slate-200 hover:border-sky-500/40 transition shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          title="Open Command Palette (⌘K / Ctrl+K)"
          aria-label="Open Command Palette (⌘K / Ctrl+K)"
        >
          <kbd className="font-mono text-[10px] text-sky-400">⌘K</kbd>
        </button>
      </div>

      {/* Right: Controls & Shortcuts */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={openCommandPalette}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E2E48] bg-[#111A2C] text-slate-300 hover:text-sky-300 hover:border-sky-500/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          title="Search catchments and actions"
          aria-label="Search catchments and actions"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Model Engine Selector */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-[#1E2E48] bg-[#111A2C] px-2.5 h-8 font-sans text-xs shadow-sm">
          <span className="text-slate-400 text-[11px] font-medium">Model:</span>
          <div className="relative flex items-center">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none bg-transparent pr-5 text-sky-400 font-medium focus:outline-none cursor-pointer text-xs"
              aria-label="Select Machine Learning Inference Model"
            >
              <option value="spatiotemporal_v1" className="bg-[#0c1322] text-slate-200">
                Spatiotemporal Conv3D (Candidate)
              </option>
              <option value="tree_baseline" className="bg-[#0c1322] text-slate-200">
                Tree Baseline (v0.1.0)
              </option>
              <option value="persistence" className="bg-[#0c1322] text-slate-200">
                Persistence Decay (v0.1.0)
              </option>
              <option value="climatology" className="bg-[#0c1322] text-slate-200">
                Climatology Prior (v0.1.0)
              </option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 h-3 w-3 text-slate-400" />
          </div>
        </div>

        {/* Map vs Globe Segmented Switcher */}
        <div className="hidden sm:flex items-center rounded-lg border border-[#1E2E48] bg-[#0c1424] p-0.5 h-8 font-sans text-xs">
          <button
            onClick={() => setCurrentView("map")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
              currentView === "map"
                ? "bg-[#16233B] text-sky-400 font-semibold border border-sky-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
            title="Switch to 2D Weather Map"
            aria-label="Switch to 2D Weather Map"
          >
            <Map className="h-3.5 w-3.5" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setCurrentView("globe")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
              currentView === "globe"
                ? "bg-[#16233B] text-sky-400 font-semibold border border-sky-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
            title="Switch to 3D Earth View"
            aria-label="Switch to 3D Earth View"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Globe</span>
          </button>
        </div>

        {/* Systems Drawer Button */}
        <button
          onClick={toggleSystemDrawer}
          className="flex items-center gap-1.5 rounded-lg border border-[#1E2E48] bg-[#111A2C] px-2.5 h-8 text-xs font-sans font-medium text-slate-300 hover:text-sky-400 hover:border-sky-500/40 transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          title="Open System Telemetry & Provenance Health"
          aria-label="Open System Telemetry & Provenance Health"
        >
          <Activity className="h-3.5 w-3.5 text-sky-400" />
          <span className="hidden xl:inline">Systems</span>
        </button>

        {/* Run Forecast Cycle Button */}
        <button
          onClick={triggerNowcastCycle}
          disabled={isTriggeringCycle}
          className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-950/40 px-3 h-8 font-sans text-xs font-medium text-sky-300 hover:bg-sky-900/40 transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          title="Run Automated Forecast Cycle"
          aria-label="Run Automated Forecast Cycle"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isTriggeringCycle ? "animate-spin" : ""}`} />
          <span className="hidden xl:inline">{isTriggeringCycle ? "Running forecast..." : "Run forecast"}</span>
        </button>

        {/* Alerts Drawer Button */}
        <button
          onClick={toggleAlertDrawer}
          className={`relative flex items-center gap-1.5 rounded-lg border px-2.5 h-8 text-xs font-sans font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
            unacknowledgedAlertsCount > 0
              ? "border-rose-700/80 bg-rose-950/70 text-rose-300 hover:bg-rose-900 shadow-sm"
              : "border-[#1E2E48] bg-[#111A2C] text-slate-300 hover:bg-[#16233B]"
          }`}
          title="Open Alerts Drawer"
          aria-label={`Open Alerts Drawer${unacknowledgedAlertsCount > 0 ? `, ${unacknowledgedAlertsCount} active alerts` : ""}`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Alerts</span>
          {unacknowledgedAlertsCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unacknowledgedAlertsCount}
            </span>
          )}
        </button>

        {/* Keyboard Shortcuts Help Button */}
        <button
          onClick={openShortcutsModal}
          className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg border border-[#1E2E48] bg-[#111A2C] text-slate-400 hover:text-sky-300 hover:border-sky-500/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          title="Keyboard Shortcuts Reference (?)"
          aria-label="Keyboard Shortcuts Reference (?)"
        >
          <Keyboard className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};
