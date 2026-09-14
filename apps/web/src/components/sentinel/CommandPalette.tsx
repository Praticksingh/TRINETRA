"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSentinel, SentinelView } from "@/context/SentinelContext";
import { PILOT_LOCATIONS } from "@/app/search/LocationSearch";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { Badge } from "@/components/sentinel/Badge";
import {
  Search,
  Compass,
  Map,
  Clock,
  Bell,
  Activity,
  Database,
  Globe,
  RefreshCw,
  Sliders,
  X,
  ArrowRight,
  Mountain,
  HelpCircle,
} from "lucide-react";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShortcuts?: () => void;
}

interface PaletteAction {
  id: string;
  category: "views" | "locations" | "actions";
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  shortcut?: string;
  badge?: React.ReactNode;
  perform: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenShortcuts,
}) => {
  const {
    setCurrentView,
    setSelectedCell,
    triggerNowcastCycle,
    toggleAlertDrawer,
    toggleSystemDrawer,
    toggleSidebar,
    isTriggeringCycle,
  } = useSentinel();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build items list
  const actions: PaletteAction[] = [
    // 1. Navigation Views
    {
      id: "view-overview",
      category: "views",
      title: "Overview",
      subtitle: "Operational dashboard & catchment corridor status",
      icon: Compass,
      shortcut: "1",
      perform: () => {
        setCurrentView("overview");
        onClose();
      },
    },
    {
      id: "view-map",
      category: "views",
      title: "Weather Map",
      subtitle: "High-resolution convective hazard GIS grid",
      icon: Map,
      shortcut: "2",
      perform: () => {
        setCurrentView("map");
        onClose();
      },
    },
    {
      id: "view-timeline",
      category: "views",
      title: "Forecast",
      subtitle: "6-hour lead time convective surge progression",
      icon: Clock,
      shortcut: "3",
      perform: () => {
        setCurrentView("timeline");
        onClose();
      },
    },
    {
      id: "view-alerts",
      category: "views",
      title: "Alerts",
      subtitle: "Standardized CAP v1.2 warning dispatch queue",
      icon: Bell,
      shortcut: "4",
      perform: () => {
        setCurrentView("alerts");
        onClose();
      },
    },
    {
      id: "view-insights",
      category: "views",
      title: "AI Analysis",
      subtitle: "Deep learning model cards, XAI attribution & limits",
      icon: Activity,
      shortcut: "5",
      perform: () => {
        setCurrentView("insights");
        onClose();
      },
    },
    {
      id: "view-provenance",
      category: "views",
      title: "Data Sources",
      subtitle: "Sensor freshness, radar telemetry & pipeline latency",
      icon: Database,
      shortcut: "6",
      perform: () => {
        setCurrentView("provenance");
        onClose();
      },
    },
    {
      id: "view-globe",
      category: "views",
      title: "Earth View",
      subtitle: "Planetary 3D Earth perspective & storm footprints",
      icon: Globe,
      shortcut: "7",
      perform: () => {
        setCurrentView("globe");
        onClose();
      },
    },

    // 2. Operational Actions
    {
      id: "action-trigger",
      category: "actions",
      title: "Run Forecast Update",
      subtitle: "Trigger automated FastAPI inference cycle",
      icon: RefreshCw,
      shortcut: "R",
      perform: () => {
        triggerNowcastCycle();
        onClose();
      },
    },
    {
      id: "action-alerts",
      category: "actions",
      title: "Open Alerts Center Drawer",
      subtitle: "Slide out CAP v1.2 alert management panel",
      icon: Bell,
      perform: () => {
        toggleAlertDrawer();
        onClose();
      },
    },
    {
      id: "action-systems",
      category: "actions",
      title: "Open Systems Telemetry Drawer",
      subtitle: "Inspect pipeline health & sensor synchronization",
      icon: Activity,
      perform: () => {
        toggleSystemDrawer();
        onClose();
      },
    },
    {
      id: "action-sidebar",
      category: "actions",
      title: "Toggle Sidebar",
      subtitle: "Expand or collapse navigation sidebar",
      icon: Sliders,
      shortcut: "[",
      perform: () => {
        toggleSidebar();
        onClose();
      },
    },
    {
      id: "action-shortcuts",
      category: "actions",
      title: "Keyboard Shortcuts Reference",
      subtitle: "View full list of keyboard commands & hotkeys",
      icon: HelpCircle,
      shortcut: "?",
      perform: () => {
        onClose();
        if (onOpenShortcuts) onOpenShortcuts();
      },
    },

    // 3. Catchment Locations
    ...PILOT_LOCATIONS.map((loc) => {
      const matchingCell = GRID_CELLS.find((c) =>
        c.name.toLowerCase().includes(loc.name.toLowerCase().split(" ")[0])
      );
      return {
        id: `loc-${loc.id}`,
        category: "locations" as const,
        title: loc.name,
        subtitle: `${loc.basin} • ${loc.elevationM}m elevation • ${loc.district}`,
        icon: Mountain,
        badge: (
          <Badge
            severity={
              loc.currentRisk === "critical"
                ? "critical"
                : loc.currentRisk === "warning"
                ? "warning"
                : loc.currentRisk === "watch"
                ? "watch"
                : "low"
            }
            size="xs"
          />
        ),
        perform: () => {
          if (matchingCell) {
            setSelectedCell(matchingCell);
          }
          setCurrentView("map");
          onClose();
        },
      };
    }),
  ];

  // Filter actions by query
  const filteredActions = query.trim()
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          (a.subtitle && a.subtitle.toLowerCase().includes(query.toLowerCase())) ||
          (a.shortcut && a.shortcut.toLowerCase() === query.toLowerCase().trim())
      )
    : actions;

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].perform();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-20 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#080E1A]/80 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Modal Box */}
      <div className="relative z-50 w-full max-w-xl rounded-xl border border-[#1E2E48] bg-[#0D1524] shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-slate-200 overflow-hidden font-sans animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[#1E2E48] px-4 py-3 bg-[#111A2C]">
          <Search className="h-4 w-4 text-[#38BDF8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a station, view, or command (e.g. Kedarnath, Map, Run Forecast)..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
            aria-autocomplete="list"
            aria-controls="command-palette-results"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-200 transition"
              aria-label="Clear search input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-slate-200 transition"
            aria-label="Close command palette"
          >
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-[#16233B] border border-[#1E2E48] rounded">
              Esc
            </kbd>
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-palette-results"
          role="listbox"
          className="max-h-80 overflow-y-auto p-2 divide-y divide-[#1E2E48]/40"
        >
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-sans">
              No matching stations, views, or commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={action.id}
                  data-index={idx}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => action.perform()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-100 ${
                    isSelected
                      ? "bg-[#16233B] text-white border border-[#38BDF8]/30 shadow-sm"
                      : "text-slate-300 hover:bg-[#111A2C] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                        isSelected
                          ? "border-[#38BDF8]/40 bg-[#0C2438] text-[#38BDF8]"
                          : "border-[#1E2E48] bg-[#0B1322] text-slate-400"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-sans">{action.title}</span>
                        {action.badge}
                      </div>
                      {action.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                          {action.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {action.shortcut && (
                      <kbd className="rounded border border-[#1E2E48] bg-[#0B1322] px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                        {action.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="h-3.5 w-3.5 text-[#38BDF8]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between border-t border-[#1E2E48] bg-[#0B1322] px-3.5 py-2 text-[10px] font-sans text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[#1E2E48] bg-[#111A2C] px-1 py-0.2 font-mono text-[9px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[#1E2E48] bg-[#111A2C] px-1 py-0.2 font-mono text-[9px]">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[#1E2E48] bg-[#111A2C] px-1 py-0.2 font-mono text-[9px]">Esc</kbd> Close
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Press</span>
            <kbd className="rounded border border-[#1E2E48] bg-[#111A2C] px-1 py-0.2 font-mono text-[9px] text-sky-400">?</kbd>
            <span>for keyboard shortcuts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
