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
    cells,
    setSelectedCell,
    triggerNowcastCycle,
    loadScenario,
    openCustomObservation,
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
    {
      id: "action-scenario-kedarnath",
      category: "actions",
      title: "Load 2013 Kedarnath Cloudburst Scenario",
      subtitle: "Benchmark convective extreme with critical flash flood surge",
      icon: RefreshCw,
      perform: () => {
        loadScenario("kedarnath_2013");
        onClose();
      },
    },
    {
      id: "action-scenario-chamoli",
      category: "actions",
      title: "Load 2021 Chamoli Gorge Surge Scenario",
      subtitle: "High terrain susceptibility & rapid runoff concentration",
      icon: RefreshCw,
      perform: () => {
        loadScenario("chamoli_2021");
        onClose();
      },
    },
    {
      id: "action-scenario-fair",
      category: "actions",
      title: "Load Nominal Fair Weather Scenario",
      subtitle: "Stable atmospheric boundary layer with strong inversion cap",
      icon: RefreshCw,
      perform: () => {
        loadScenario("fair_weather_nominal");
        onClose();
      },
    },
    {
      id: "action-feed-custom",
      category: "actions",
      title: "Feed Custom Observation Data",
      subtitle: "Paste or edit multi-spectral satellite & thermodynamic vectors",
      icon: Database,
      perform: () => {
        onClose();
        openCustomObservation();
      },
    },

    // 3. Catchment Locations
    ...PILOT_LOCATIONS.map((loc) => {
      const matchingCell = cells.find((c) =>
        c.name.toLowerCase().includes(loc.name.toLowerCase().split(" ")[0])
      ) || GRID_CELLS.find((c) =>
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
        className="fixed inset-0 bg-[#0B0C10]/80 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Modal Box */}
      <div className="relative z-50 w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#161820] shadow-clay-card-elevated text-slate-200 overflow-hidden font-sans animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3 bg-[#111217] shadow-clay-inset">
          <Search className="h-4 w-4 text-indigo-400 shrink-0" />
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
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none font-sans"
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
            className="rounded-lg p-1 text-slate-400 hover:text-slate-200 transition shadow-clay-btn active:translate-y-0.5"
            aria-label="Close command palette"
          >
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-[#1D202B] border border-white/[0.08] rounded-md shadow-clay-badge">
              Esc
            </kbd>
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-palette-results"
          role="listbox"
          className="max-h-80 overflow-y-auto p-2 space-y-1 divide-y divide-white/[0.04]"
        >
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-sans">
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
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-100 active:translate-y-0.5 ${
                    isSelected
                      ? "bg-[#252937] text-white border border-indigo-500/40 shadow-clay-btn"
                      : "text-slate-300 hover:bg-[#1D202B]/80 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                        isSelected
                          ? "border-indigo-500/40 bg-[#1C1F30] text-indigo-300 shadow-clay-btn-primary"
                          : "border-white/[0.08] bg-[#111217] text-slate-400 shadow-clay-btn"
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
                      <kbd className="rounded-md border border-white/[0.08] bg-[#111217] px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-clay-badge">
                        {action.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#111217] px-4 py-2.5 text-[10px] font-sans text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/[0.08] bg-[#1D202B] px-1.5 py-0.2 font-mono text-[9px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/[0.08] bg-[#1D202B] px-1.5 py-0.2 font-mono text-[9px]">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/[0.08] bg-[#1D202B] px-1.5 py-0.2 font-mono text-[9px]">Esc</kbd> Close
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Press</span>
            <kbd className="rounded border border-white/[0.08] bg-[#1D202B] px-1.5 py-0.2 font-mono text-[9px] text-indigo-300">?</kbd>
            <span>for keyboard shortcuts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
