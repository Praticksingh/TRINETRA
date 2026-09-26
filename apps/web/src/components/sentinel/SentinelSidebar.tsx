"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  Map,
  Clock,
  Bell,
  Activity,
  Database,
  Globe,
  Sparkles,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
} from "lucide-react";
import { useSentinel, SentinelView } from "@/context/SentinelContext";

interface NavItem {
  id: SentinelView;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const SentinelSidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isSidebarCollapsed,
    toggleSidebar,
    unacknowledgedAlertsCount,
    openShortcutsModal,
  } = useSentinel();

  // Primary navigation (the core 4 weather questions)
  const primaryNavItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: Compass },
    { id: "map", label: "Weather Map", icon: Map },
    { id: "timeline", label: "Forecast", icon: Clock },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      badge: unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : undefined,
      badgeColor: "bg-rose-950/80 text-rose-300 border border-rose-500/40",
    },
  ];

  // Secondary intelligence views
  const secondaryNavItems: NavItem[] = [
    { id: "insights", label: "Forecast Analysis", icon: Activity },
    { id: "provenance", label: "Data Sources", icon: Database },
    { id: "globe", label: "Earth View", icon: Globe },
  ];

  const handleItemClick = (id: SentinelView) => {
    setCurrentView(id);
  };

  const renderNavGroup = (items: NavItem[], groupTitle?: string) => (
    <div className="flex flex-col gap-1">
      {!isSidebarCollapsed && groupTitle && (
        <div className="px-3 pt-2 pb-1 text-[11px] font-sans font-medium text-slate-500 select-none">
          {groupTitle}
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <div key={item.id} className="relative group/btn">
            <button
              onClick={() => handleItemClick(item.id)}
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-sans transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isActive
                  ? "bg-indigo-950/60 text-indigo-300 font-medium border border-indigo-500/40"
                  : "text-slate-400 hover:bg-[#161A26] hover:text-slate-200 border border-transparent font-normal"
              } ${isSidebarCollapsed ? "justify-center px-0" : "justify-between"}`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Collapsed Active Indicator Bar */}
              {isSidebarCollapsed && isActive && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-indigo-500"
                  aria-hidden="true"
                />
              )}

              <div className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover/btn:text-slate-200"
                  }`}
                />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isSidebarCollapsed && item.badge && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium font-mono ${
                    item.badgeColor || "bg-indigo-950 text-indigo-300 border border-indigo-500/40"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>

            {/* Collapsed Tooltip Flyout */}
            {isSidebarCollapsed && (
              <div
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 items-center rounded-lg border border-[#2B3142] bg-[#161A26] px-2.5 py-1 text-xs font-sans font-medium text-slate-200 shadow-lg opacity-0 transition-opacity duration-150 md:group-hover/btn:flex group-hover/btn:opacity-100 whitespace-nowrap"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1.5 rounded bg-rose-600 px-1 py-0.2 text-[9px] font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-[#1E2330] bg-[#0E1119] transition-all duration-200 select-none ${
        isSidebarCollapsed ? "w-16" : "w-56"
      }`}
      aria-label="Weather Platform Navigation"
    >
      {/* Navigation Sections */}
      <div className="flex flex-col gap-2 p-2">
        {renderNavGroup(primaryNavItems, "Weather Monitoring")}

        {/* Group Divider */}
        <div className="my-1 border-t border-[#1E2330]" />

        {renderNavGroup(secondaryNavItems, "Analysis & Data")}
      </div>

      {/* Bottom Section: Shortcuts, Design System, Legacy, Collapse Toggle */}
      <div className="flex flex-col gap-1 border-t border-[#1E2330] p-2">
        {!isSidebarCollapsed && (
          <div className="px-3 pt-1 pb-0.5 text-[11px] font-sans font-medium text-slate-500 select-none">
            Help & Tools
          </div>
        )}

        <button
          onClick={openShortcutsModal}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-sans text-slate-400 hover:bg-[#161A26] hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            isSidebarCollapsed ? "justify-center px-0" : ""
          }`}
          title="Keyboard Shortcuts Reference (?)"
          aria-label="Keyboard Shortcuts Reference (?)"
        >
          <HelpCircle className="h-4 w-4 shrink-0 text-slate-400" />
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">Shortcuts</span>
              <kbd className="rounded border border-[#2B3142] bg-[#141722] px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                ?
              </kbd>
            </div>
          )}
        </button>

        <Link
          href="/design-system"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-sans text-slate-400 hover:bg-[#161A26] hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            isSidebarCollapsed ? "justify-center px-0" : ""
          }`}
          title="Open Design System Showcase"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
          {!isSidebarCollapsed && <span className="truncate">Design System</span>}
        </Link>

        <Link
          href="/legacy"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-sans text-slate-400 hover:bg-[#161A26] hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            isSidebarCollapsed ? "justify-center px-0" : ""
          }`}
          title="Open Legacy Console Baseline"
        >
          <RotateCcw className="h-4 w-4 shrink-0 text-slate-400" />
          {!isSidebarCollapsed && <span className="truncate">Legacy View</span>}
        </Link>

        <button
          onClick={toggleSidebar}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-sans text-slate-400 hover:bg-[#161A26] hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            isSidebarCollapsed ? "justify-center px-0" : ""
          }`}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
