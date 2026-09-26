"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Activity,
  RefreshCw,
  Globe,
  Map,
  ChevronDown,
  Cpu,
  Search,
  Keyboard,
  Flame,
  FileCode,
  Clock,
  Wifi,
  ExternalLink,
} from "lucide-react";
import { useSentinel } from "@/context/SentinelContext";
import LocationSearch from "@/app/search/LocationSearch";
import { SearchLocation } from "@/app/search/LocationResults";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";

export const SentinelHeader: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cells,
    selectedModel,
    setSelectedModel,
    isBaselineActive,
    isLiveConnected,
    unacknowledgedAlertsCount,
    isTriggeringCycle,
    triggerNowcastCycle,
    activeScenarioId,
    loadScenario,
    openCustomObservation,
    toggleAlertDrawer,
    toggleSystemDrawer,
    setSelectedCell,
    openCommandPalette,
    openShortcutsModal,
    lastGenTime,
  } = useSentinel();

  const [isHealthOpen, setIsHealthOpen] = useState<boolean>(false);
  const healthRef = useRef<HTMLDivElement>(null);

  // Close health popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (healthRef.current && !healthRef.current.contains(e.target as Node)) {
        setIsHealthOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (loc: SearchLocation) => {
    let matching =
      cells.find((c) =>
        c.name.toLowerCase().includes(loc.name.toLowerCase().split(" ")[0])
      ) ||
      GRID_CELLS.find((c) =>
        c.name.toLowerCase().includes(loc.name.toLowerCase().split(" ")[0])
      );

    if (!matching && loc.coordinates) {
      let minDist = Infinity;
      const pool = cells.length > 0 ? cells : GRID_CELLS;
      pool.forEach((c) => {
        const dx = c.coordinates[0] - loc.coordinates[0];
        const dy = c.coordinates[1] - loc.coordinates[1];
        const dist = Math.hypot(dx, dy);
        if (dist < minDist) {
          minDist = dist;
          matching = c;
        }
      });
    }

    if (matching) {
      setSelectedCell(matching);
      setCurrentView("map");
    }
  };

  const latencyMs = isBaselineActive ? 120 : 3.7;

  return (
    <header className="z-30 flex h-14 items-center justify-between border-b border-[#1E2330] bg-[#0E1119] px-3 sm:px-5 select-none text-slate-200 font-sans">
      {/* 1. Left: Brand & Scenario Switcher */}
      <div className="flex items-center gap-3">
        {/* Brand Icon & Name */}
        <div
          onClick={() => setCurrentView("overview")}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Go to Overview"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold text-xs">
            T3
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-slate-100 group-hover:text-white transition-colors">
                TRINETRA
              </span>
              <span className="hidden sm:inline-block rounded px-1.5 py-0.2 text-[10px] font-medium bg-[#181C28] text-slate-400 border border-[#2B3142]">
                India
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden xl:block leading-none mt-0.5">
              Weather Intelligence & Early Warning
            </span>
          </div>
        </div>

        {/* Disaster Scenario Selector (Historical Scenarios) */}
        <div className="hidden lg:flex items-center ml-2 pl-3 border-l border-[#1E2330]">
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/20 px-2.5 h-8 text-xs">
            <Flame className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-normal hidden xl:inline">Scenario:</span>
            <div className="relative flex items-center">
              <select
                value={activeScenarioId}
                onChange={(e) => loadScenario(e.target.value)}
                aria-label="Select Weather Scenario"
                className="appearance-none bg-transparent pr-4 text-xs font-medium text-amber-300 focus:outline-none cursor-pointer max-w-[150px] xl:max-w-[210px] truncate"
              >
                <option value="kedarnath_2013" className="bg-[#121520] text-amber-300">
                  2013 Kedarnath (Severe)
                </option>
                <option value="chamoli_2021" className="bg-[#121520] text-orange-300">
                  2021 Chamoli (Flash Flood)
                </option>
                <option value="fair_weather_nominal" className="bg-[#121520] text-emerald-300">
                  Clear Weather (Normal)
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 h-3 w-3 text-amber-400/70" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Center: Location Search */}
      <div className="hidden md:flex flex-1 max-w-[200px] lg:max-w-[260px] xl:max-w-[320px] mx-3 items-center">
        <LocationSearch onLocationSelect={handleLocationSelect} className="w-full" />
      </div>

      {/* 3. Right: Controls & Diagnostics */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Search Button (minimum 44x44 touch target) */}
        <button
          onClick={openCommandPalette}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-[#232736] bg-[#141722] text-slate-300 hover:text-white transition"
          title="Search locations and alerts"
          aria-label="Search locations and alerts"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Model Engine Selector */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-lg border border-[#232736] bg-[#141722] px-2.5 h-8 text-xs">
          <Cpu className="h-3.5 w-3.5 text-indigo-400 shrink-0 hidden 2xl:block" />
          <span className="text-slate-400 text-[11px] hidden 2xl:inline">Model:</span>
          <div className="relative flex items-center">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none bg-transparent pr-4 text-xs font-medium text-slate-200 focus:outline-none cursor-pointer max-w-[140px] xl:max-w-[180px] truncate"
              aria-label="Select Weather Forecasting Model"
            >
              <option value="spatiotemporal_v1" className="bg-[#121520] text-slate-200">
                AI Deep Model (Neural)
              </option>
              <option value="tree_baseline" className="bg-[#121520] text-slate-200">
                Standard Baseline
              </option>
              <option value="persistence" className="bg-[#121520] text-slate-200">
                Persistence Model
              </option>
              <option value="climatology" className="bg-[#121520] text-slate-200">
                Climatology Average
              </option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 h-3 w-3 text-slate-400" />
          </div>
        </div>

        {/* Upload Custom Observation */}
        <button
          onClick={openCustomObservation}
          className="hidden 2xl:flex items-center gap-1.5 rounded-lg border border-[#232736] bg-[#141722] px-2.5 h-8 text-xs font-medium text-slate-300 hover:text-white transition"
          title="Upload or inspect custom weather observation"
          aria-label="Upload custom weather observation"
        >
          <FileCode className="h-3.5 w-3.5 text-slate-400" />
          <span>Upload Data</span>
        </button>

        {/* Map vs Globe Switcher */}
        <div className="hidden sm:flex items-center rounded-lg border border-[#232736] bg-[#0E1017] p-0.5 h-8 text-xs">
          <button
            onClick={() => setCurrentView("map")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors h-full ${
              currentView === "map"
                ? "bg-[#181C28] text-slate-100 font-medium shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Switch to Weather Map"
          >
            <Map className="h-3.5 w-3.5" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setCurrentView("globe")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors h-full ${
              currentView === "globe"
                ? "bg-[#181C28] text-slate-100 font-medium shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Switch to 3D Earth View"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Earth View</span>
          </button>
        </div>

        {/* System Health Diagnostics */}
        <div className="relative" ref={healthRef}>
          <button
            onClick={() => setIsHealthOpen(!isHealthOpen)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 h-8 text-xs font-medium transition ${
              isHealthOpen
                ? "border-indigo-500/50 bg-indigo-950/40 text-indigo-300"
                : "border-[#232736] bg-[#141722] text-slate-300 hover:border-slate-600"
            }`}
            title="System & Data Health Diagnostics"
            aria-expanded={isHealthOpen}
          >
            <span className="flex h-2 w-2">
              <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="hidden sm:inline font-mono text-[11px] text-emerald-400">
              {latencyMs}ms
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {/* Telemetry Dropdown Card */}
          {isHealthOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#2B3142] bg-[#141722] p-4 shadow-xl z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#232736] pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-medium text-white">System & Data Status</span>
                </div>
                <span className="rounded bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  {isLiveConnected ? "All Systems Operational" : "Historical Data Replay"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#1E2330]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Wifi className="h-3.5 w-3.5 text-slate-400" />
                    <span>Indian Satellite (INSAT-3D)</span>
                  </div>
                  <span className="font-mono text-slate-200">12m ago</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#1E2330]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Numerical Weather Models</span>
                  </div>
                  <span className="font-mono text-slate-200">45m ago</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#1E2330]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Inference Latency</span>
                  </div>
                  <span className="font-mono font-medium text-emerald-400">{latencyMs} ms</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#1E2330]">
                  <span className="text-slate-400">Active Model</span>
                  <span className="font-mono text-[11px] text-slate-200">
                    {isBaselineActive ? `Baseline (${selectedModel})` : "Deep Neural Model"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Last Forecast</span>
                  <span className="font-mono text-[11px] text-slate-300">{lastGenTime}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1E2330] flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsHealthOpen(false);
                    toggleSystemDrawer();
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <span>Detailed Telemetry</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Update Forecast Button */}
        <button
          onClick={triggerNowcastCycle}
          disabled={isTriggeringCycle}
          className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 px-3 h-8 text-xs font-medium text-indigo-300 hover:bg-indigo-900/50 transition disabled:opacity-50 shrink-0 min-h-[32px]"
          title="Update Weather Forecast"
          aria-label="Update Weather Forecast"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isTriggeringCycle ? "animate-spin" : ""}`} />
          <span className="hidden xl:inline">{isTriggeringCycle ? "Updating..." : "Update"}</span>
        </button>

        {/* Alerts Button */}
        <button
          onClick={toggleAlertDrawer}
          className={`relative flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 h-8 text-xs font-medium transition shrink-0 min-h-[32px] sm:min-h-[34px] ${
            unacknowledgedAlertsCount > 0
              ? "border-rose-500/50 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50"
              : "border-[#232736] bg-[#141722] text-slate-300 hover:border-slate-600"
          }`}
          title="Open Alerts Drawer"
          aria-label={`Open Alerts Drawer${unacknowledgedAlertsCount > 0 ? `, ${unacknowledgedAlertsCount} active alerts` : ""}`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Alerts</span>
          {unacknowledgedAlertsCount > 0 && (
            <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
              {unacknowledgedAlertsCount}
            </span>
          )}
        </button>

        {/* Keyboard Shortcuts Button */}
        <button
          onClick={openShortcutsModal}
          className="hidden xl:flex items-center justify-center h-8 w-8 rounded-lg border border-[#232736] bg-[#141722] text-slate-400 hover:text-slate-200 transition"
          title="Keyboard Shortcuts Reference (?)"
          aria-label="Keyboard Shortcuts Reference (?)"
        >
          <Keyboard className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};
