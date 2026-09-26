"use client";

import React, { useState } from "react";
import {
  Compass,
  Map,
  Clock,
  Bell,
  MoreHorizontal,
  X,
  Activity,
  Database,
  Globe,
  RefreshCw,
  HelpCircle,
  Flame,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useSentinel, SentinelView } from "@/context/SentinelContext";

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    unacknowledgedAlertsCount,
    isTriggeringCycle,
    triggerNowcastCycle,
    openShortcutsModal,
    toggleSystemDrawer,
    activeScenarioId,
    loadScenario,
  } = useSentinel();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navItems: { id: SentinelView; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: Compass },
    { id: "map", label: "Map", icon: Map },
    { id: "timeline", label: "Forecast", icon: Clock },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      badge: unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : undefined,
    },
  ];

  const secondaryNavItems = [
    {
      id: "insights" as SentinelView,
      label: "Forecast Analysis",
      desc: "Model reasoning, factors, and limitations",
      icon: Activity,
    },
    {
      id: "provenance" as SentinelView,
      label: "Data Sources",
      desc: "Satellite, weather models & radar status",
      icon: Database,
    },
    {
      id: "globe" as SentinelView,
      label: "3D Earth View",
      desc: "Cinematic planetary weather perspective",
      icon: Globe,
    },
  ];

  const handleNavClick = (viewId: SentinelView) => {
    setCurrentView(viewId);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* "More" Sheet Backdrop */}
      {isMoreOpen && (
        <div
          onClick={() => setIsMoreOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* "More" Bottom Sheet for Secondary Navigation */}
      {isMoreOpen && (
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="More Navigation Options"
          className="fixed inset-x-0 bottom-16 z-50 rounded-t-2xl border-t border-[#252A3A] bg-[#121520] p-4 shadow-2xl md:hidden animate-in slide-in-from-bottom duration-200 text-slate-100 max-h-[75vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2330]">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Weather Intelligence</h2>
              <p className="text-[11px] text-slate-400">Additional tools, data sources and scenarios</p>
            </div>
            <button
              onClick={() => setIsMoreOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#181C28] text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Secondary views */}
          <div className="py-3 space-y-1.5 border-b border-[#1E2330]">
            <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Analysis & Data
            </div>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center justify-between p-2.5 rounded-xl transition text-left min-h-[48px] ${
                    isActive
                      ? "bg-indigo-950/70 border border-indigo-500/40 text-indigo-300"
                      : "bg-[#161A26] border border-[#222736] text-slate-200 hover:bg-[#1C2130]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-slate-100">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Scenario Selector on Mobile */}
          <div className="py-3 border-b border-[#1E2330]">
            <div className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Flame className="h-3 w-3 text-amber-400" />
              <span>Historical Weather Scenario</span>
            </div>
            <select
              value={activeScenarioId}
              onChange={(e) => {
                loadScenario(e.target.value);
                setIsMoreOpen(false);
              }}
              className="w-full bg-[#161A26] border border-[#262C3E] rounded-lg px-3 py-2 text-xs text-amber-300 font-medium focus:outline-none"
              aria-label="Select Weather Scenario"
            >
              <option value="kedarnath_2013">2013 Kedarnath (Historical Severe)</option>
              <option value="chamoli_2021">2021 Chamoli (Historical Flash Flood)</option>
              <option value="fair_weather_nominal">Clear Weather (Nominal Conditions)</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="pt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                triggerNowcastCycle();
                setIsMoreOpen(false);
              }}
              disabled={isTriggeringCycle}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-medium text-white shadow-sm min-h-[44px]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTriggeringCycle ? "animate-spin" : ""}`} />
              <span>{isTriggeringCycle ? "Updating..." : "Update Forecast"}</span>
            </button>

            <button
              onClick={() => {
                toggleSystemDrawer();
                setIsMoreOpen(false);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#181C28] border border-[#2B3142] px-3 py-2.5 text-xs font-medium text-slate-200 hover:text-white min-h-[44px]"
            >
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
              <span>System Status</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[#1E2330] bg-[#0E1119]/95 px-2 backdrop-blur-xl md:hidden select-none"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id && !isMoreOpen;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-all rounded-lg ${
                isActive ? "text-indigo-400 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0.5 h-1 w-6 rounded-full bg-indigo-500" aria-hidden="true" />
              )}
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-all rounded-lg ${
            isMoreOpen ? "text-indigo-400 font-semibold" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-expanded={isMoreOpen}
          aria-label="More navigation options"
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          {isMoreOpen && (
            <span className="absolute bottom-0.5 h-1 w-6 rounded-full bg-indigo-500" aria-hidden="true" />
          )}
        </button>
      </nav>
    </>
  );
};
