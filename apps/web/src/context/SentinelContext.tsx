"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SelectedCellData } from "@/app/forecast/RiskPanel";
import { GRID_CELLS, FilterMode } from "@/app/forecast/ForecastMap";
import { ActiveLayers } from "@/app/forecast/RiskLayers";
import { AlertItem, AlertLifecycleStatus } from "@/app/alerts/AlertPanel";
import { useRealtimeAlerts } from "@/lib/supabase/hooks";

export type SentinelView =
  | "overview"
  | "map"
  | "timeline"
  | "alerts"
  | "insights"
  | "provenance"
  | "globe";

export const INITIAL_SENTINEL_ALERTS: AlertItem[] = [
  {
    id: "alt_kedarnath_001",
    hazardType: "flash_flood",
    severity: "critical",
    regionName: "Upper Mandakini / Kedarnath Valley",
    headline: "FLASH FLOOD CRITICAL RISK: Rapid Cirque Inundation Likely",
    description:
      "Deep convective cloud cluster exhibiting -21.4 K/hr TIR1 cooling rate coupled with 46.2° steep slope drainage. High probability of flash flood in next 2–3 hours.",
    issuedAt: "2026-09-11T08:32:00Z",
    validFrom: "2026-09-11T10:00:00Z",
    validTo: "2026-09-11T13:30:00Z",
    isOfficialWarning: false,
    isAcknowledged: false,
    status: "GENERATED",
    affectedCells: ["3073_7906"],
  },
  {
    id: "alt_rishikesh_002",
    hazardType: "cloudburst",
    severity: "warning",
    regionName: "Shivpuri-Rishikesh Ganga Corridor",
    headline: "CLOUDBURST WARNING: Intense Convective Rainfall Band",
    description:
      "CAPE exceeding 3,100 J/kg with moisture convergence. Rainfall rates projected ≥90 mm/h. Precautionary monitoring advised along riverfront campsites.",
    issuedAt: "2026-09-11T08:25:00Z",
    validFrom: "2026-09-11T09:30:00Z",
    validTo: "2026-09-11T12:00:00Z",
    isOfficialWarning: false,
    isAcknowledged: false,
    status: "UNDER_REVIEW",
    affectedCells: ["3012_7824"],
  },
  {
    id: "alt_chamoli_003",
    hazardType: "thunderstorm",
    severity: "watch",
    regionName: "Alaknanda Basin / Chamoli",
    headline: "THUNDERSTORM WATCH: Moderate to Severe Hail Potential",
    description:
      "Doppler radar reflectivity cores reaching 45 dBZ with strong updraft signature. Wind gusts up to 55 km/h expected.",
    issuedAt: "2026-09-11T08:10:00Z",
    validFrom: "2026-09-11T10:30:00Z",
    validTo: "2026-09-11T14:00:00Z",
    isOfficialWarning: false,
    isAcknowledged: true,
    status: "ACKNOWLEDGED",
    affectedCells: ["3055_7935"],
  },
];

interface SentinelContextType {
  // Navigation & Shell State
  currentView: SentinelView;
  setCurrentView: (view: SentinelView) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  // Operational Drawers & Modals
  isSystemDrawerOpen: boolean;
  toggleSystemDrawer: () => void;
  isAlertDrawerOpen: boolean;
  toggleAlertDrawer: () => void;
  isCommandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  isShortcutsModalOpen: boolean;
  toggleShortcutsModal: () => void;
  openShortcutsModal: () => void;
  closeShortcutsModal: () => void;

  // Selected Location & Grid Focus
  selectedCell: SelectedCellData | null;
  setSelectedCell: (cell: SelectedCellData | null) => void;
  focusLocationByCellId: (cellId: string) => void;

  // Forecast Time Evolution
  horizonMinutes: number;
  setHorizonMinutes: (minutes: number) => void;
  baseTimestampUtc: string;

  // Model Engine
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isBaselineActive: boolean;

  // GIS Overlays & Filters
  layers: ActiveLayers;
  toggleLayer: (key: keyof ActiveLayers) => void;
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;

  // Operational Alerts State Machine
  alerts: AlertItem[];
  acknowledgeAlert: (alertId: string) => void;
  updateAlertStatus: (alertId: string, status: AlertLifecycleStatus) => void;
  unacknowledgedAlertsCount: number;
  isLiveConnected: boolean;

  // Orchestration & Telemetry
  activeJobId: string;
  lastGenTime: string;
  isTriggeringCycle: boolean;
  triggerNowcastCycle: () => Promise<void>;
}

const SentinelContext = createContext<SentinelContextType | null>(null);

export const SentinelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Shell navigation
  const [currentView, setCurrentView] = useState<SentinelView>("map");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isSystemDrawerOpen, setIsSystemDrawerOpen] = useState<boolean>(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // Modal actions
  const toggleCommandPalette = () => setIsCommandPaletteOpen((prev) => !prev);
  const openCommandPalette = () => setIsCommandPaletteOpen(true);
  const closeCommandPalette = () => setIsCommandPaletteOpen(false);

  const toggleShortcutsModal = () => setIsShortcutsModalOpen((prev) => !prev);
  const openShortcutsModal = () => setIsShortcutsModalOpen(true);
  const closeShortcutsModal = () => setIsShortcutsModalOpen(false);

  // Selected cell
  const [selectedCell, setSelectedCell] = useState<SelectedCellData | null>(null);

  // Forecast Horizon
  const [horizonMinutes, setHorizonMinutes] = useState<number>(120);
  const baseTimestampUtc = "2026-09-11T08:30:00Z";

  // Model Engine
  const [selectedModel, setSelectedModel] = useState<string>("spatiotemporal_v1");
  const isBaselineActive = selectedModel !== "spatiotemporal_v1";

  // GIS Layers
  const [layers, setLayers] = useState<ActiveLayers>({
    thunderstorm: true,
    cloudburst: true,
    flashFlood: true,
    terrainSusceptibility: true,
    radarReflectivity: false,
  });

  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  // Real-time alerts
  const { alerts, isLiveConnected, acknowledgeAlert } = useRealtimeAlerts(INITIAL_SENTINEL_ALERTS);
  const [customAlertStatuses, setCustomAlertStatuses] = useState<Record<string, AlertLifecycleStatus>>({});

  // Orchestration
  const [activeJobId, setActiveJobId] = useState<string>("job_nowcast_0832_f891a2");
  const [lastGenTime, setLastGenTime] = useState<string>("2026-09-11 08:32 UTC");
  const [isTriggeringCycle, setIsTriggeringCycle] = useState<boolean>(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const toggleSystemDrawer = () => setIsSystemDrawerOpen((prev) => !prev);
  const toggleAlertDrawer = () => setIsAlertDrawerOpen((prev) => !prev);

  const toggleLayer = (key: keyof ActiveLayers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const focusLocationByCellId = (cellId: string) => {
    const matching = GRID_CELLS.find((c) => c.cellId === cellId);
    if (matching) {
      setSelectedCell(matching);
      setCurrentView("map");
    }
  };

  const updateAlertStatus = (alertId: string, status: AlertLifecycleStatus) => {
    setCustomAlertStatuses((prev) => ({ ...prev, [alertId]: status }));
    if (status === "ACKNOWLEDGED") {
      acknowledgeAlert(alertId);
    }
  };

  const triggerNowcastCycle = async () => {
    setIsTriggeringCycle(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/orchestration/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_synthetic_replay: true, source: "sentinel_console_trigger" }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveJobId(data.job_id || "job_nowcast_active");
        setLastGenTime(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
      }
    } catch (err) {
      // Graceful offline fallback simulation
      const fakeId = `job_nowcast_${Math.floor(Date.now() / 1000)}_${Math.random().toString(36).substring(2, 8)}`;
      setActiveJobId(fakeId);
      setLastGenTime(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
    } finally {
      setTimeout(() => setIsTriggeringCycle(false), 600);
    }
  };

  // Merged alerts with local statuses
  const effectiveAlerts = alerts.map((a) => ({
    ...a,
    status: customAlertStatuses[a.id] || a.status || (a.isAcknowledged ? "ACKNOWLEDGED" : "GENERATED"),
  }));

  const unacknowledgedAlertsCount = effectiveAlerts.filter(
    (a) => a.status === "GENERATED" || a.status === "UNDER_REVIEW" || !a.isAcknowledged
  ).length;

  return (
    <SentinelContext.Provider
      value={{
        currentView,
        setCurrentView,
        isSidebarCollapsed,
        toggleSidebar,
        isSystemDrawerOpen,
        toggleSystemDrawer,
        isAlertDrawerOpen,
        toggleAlertDrawer,
        isCommandPaletteOpen,
        toggleCommandPalette,
        openCommandPalette,
        closeCommandPalette,
        isShortcutsModalOpen,
        toggleShortcutsModal,
        openShortcutsModal,
        closeShortcutsModal,
        selectedCell,
        setSelectedCell,
        focusLocationByCellId,
        horizonMinutes,
        setHorizonMinutes,
        baseTimestampUtc,
        selectedModel,
        setSelectedModel,
        isBaselineActive,
        layers,
        toggleLayer,
        filterMode,
        setFilterMode,
        alerts: effectiveAlerts,
        acknowledgeAlert,
        updateAlertStatus,
        unacknowledgedAlertsCount,
        isLiveConnected,
        activeJobId,
        lastGenTime,
        isTriggeringCycle,
        triggerNowcastCycle,
      }}
    >
      {children}
    </SentinelContext.Provider>
  );
};

export const useSentinel = () => {
  const context = useContext(SentinelContext);
  if (!context) {
    throw new Error("useSentinel must be used within a SentinelProvider");
  }
  return context;
};
