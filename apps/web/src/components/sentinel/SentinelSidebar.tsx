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

  // Functional Group 1: Operations
  const operationsNavItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: Compass },
    { id: "map", label: "Weather Map", icon: Map },
    { id: "timeline", label: "Forecast", icon: Clock },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      badge: unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : undefined,
      badgeColor: "bg-rose-500 text-white",
    },
  ];

  // Functional Group 2: Intelligence & Data
  const intelligenceNavItems: NavItem[] = [
    { id: "insights", label: "AI Analysis", icon: Activity },
    { id: "provenance", label: "Data Sources", icon: Database },
    { id: "globe", label: "Earth View", icon: Globe },
  ];

  const handleItemClick = (id: SentinelView) => {
    setCurrentView(id);
    // Auto-close on mobile
    if (typeof window !== "undefined" && window.innerWidth < 768 && !isSidebarCollapsed) {
      toggleSidebar();
    }
  };

  const renderNavGroup = (items: NavItem[], groupTitle?: string) => (
    <div className="flex flex-col gap-0.5">
      {!isSidebarCollapsed && groupTitle && (
        <div className="px-3 pt-2 pb-1 text-[10px] font-sans font-semibold tracking-wider text-slate-500 uppercase select-none">
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
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-sans transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                isActive
                  ? "bg-[#16233B] text-sky-400 font-semibold border border-sky-500/30 shadow-sm"
                  : "text-slate-400 hover:bg-[#16233B]/50 hover:text-slate-200 border border-transparent font-medium"
              } ${isSidebarCollapsed ? "justify-center px-0" : "justify-between"}`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Collapsed Active Indicator Bar */}
              {isSidebarCollapsed && isActive && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-sky-400"
                  aria-hidden="true"
                />
              )}

              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-sky-400" : "text-slate-400 group-hover/btn:text-slate-200"
                  }`}
                />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isSidebarCollapsed && item.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold font-mono ${
                    item.badgeColor || "bg-sky-950 text-sky-300 border border-sky-800/50"
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
                className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 items-center rounded-md border border-sky-500/20 bg-[#0d1726] px-2.5 py-1 text-xs font-sans font-medium text-slate-200 shadow-xl opacity-0 transition-opacity duration-150 md:group-hover/btn:flex group-hover/btn:opacity-100 whitespace-nowrap"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1.5 rounded-full bg-rose-500 px-1 py-0.1 text-[9px] font-bold text-white">
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
    <>
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`z-40 md:z-20 flex flex-col justify-between border-r border-[#1F3350] bg-[#090E1A]/95 backdrop-blur-md transition-all duration-200 select-none ${
          isSidebarCollapsed
            ? "hidden md:flex md:w-16"
            : "fixed inset-y-0 left-0 w-64 md:static md:w-56 shadow-2xl md:shadow-none animate-in slide-in-from-left duration-200"
        }`}
        aria-label="Sentinel Navigation Sidebar"
      >
        {/* Navigation Sections */}
        <div className="flex flex-col gap-2 p-2">
          {renderNavGroup(operationsNavItems, "Operations")}

          {/* Group Divider */}
          <div className="my-1 border-t border-[#1F3350]/60" />

          {renderNavGroup(intelligenceNavItems, "Intelligence")}
        </div>

        {/* Bottom Section: Shortcuts, Design System, Legacy Console, Collapse Toggle */}
        <div className="flex flex-col gap-1 border-t border-[#1E2E48] p-2">
          {!isSidebarCollapsed && (
            <div className="px-3 pt-1 pb-0.5 text-[10px] font-sans font-semibold tracking-wider text-slate-500 uppercase select-none">
              Reference
            </div>
          )}

          <button
            onClick={openShortcutsModal}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-sans font-medium text-slate-400 hover:bg-[#16233B]/60 hover:text-sky-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
              isSidebarCollapsed ? "justify-center px-0" : ""
            }`}
            title="Keyboard Shortcuts Reference (?)"
            aria-label="Keyboard Shortcuts Reference (?)"
          >
            <HelpCircle className="h-4 w-4 shrink-0 text-sky-400" />
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span className="truncate">Shortcuts</span>
                <kbd className="rounded border border-[#1E2E48] bg-[#0B1322] px-1 py-0.2 text-[9px] font-mono text-slate-400">
                  ?
                </kbd>
              </div>
            )}
          </button>

          <Link
            href="/design-system"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-sans font-medium text-slate-400 hover:bg-[#16233B]/60 hover:text-sky-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
              isSidebarCollapsed ? "justify-center px-0" : ""
            }`}
            title="Open Design System Showcase"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-sky-400" />
            {!isSidebarCollapsed && <span className="truncate">Design System</span>}
          </Link>

          <Link
            href="/legacy"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-sans font-medium text-slate-400 hover:bg-[#16233B]/60 hover:text-amber-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
              isSidebarCollapsed ? "justify-center px-0" : ""
            }`}
            title="Open Legacy Console Baseline"
          >
            <RotateCcw className="h-4 w-4 shrink-0 text-amber-400" />
            {!isSidebarCollapsed && <span className="truncate">Legacy Console</span>}
          </Link>

          <button
            onClick={toggleSidebar}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-sans font-medium text-slate-400 hover:bg-[#16233B]/60 hover:text-slate-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
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
    </>
  );
};
