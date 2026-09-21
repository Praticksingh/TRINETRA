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
  cells: SelectedCellData[];
  selectedCell: SelectedCellData | null;
  setSelectedCell: (cell: SelectedCellData | null) => void;
  focusLocationByCellId: (cellId: string) => void;

  // Historical & Operational Disaster Scenarios
  activeScenarioId: string;
  loadScenario: (scenarioId: string) => Promise<void>;

  // Custom File / Observation Ingestion Modal
  isCustomObservationOpen: boolean;
  openCustomObservation: () => void;
  closeCustomObservation: () => void;

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

function transformBackendCellToCellData(backendCell: any, validTime: string): SelectedCellData {
  const h2 = backendCell.horizons?.["2h"] || {};
  return {
    cellId: backendCell.cell_id,
    name: backendCell.basin_name || backendCell.name,
    coordinates: backendCell.centroid,
    severity: (backendCell.severity?.toLowerCase() as any) || "watch",
    horizonMinutes: 120,
    validTime: validTime,
    probabilities: {
      thunderstorm: h2.thunderstorm_prob ?? backendCell.probabilities?.thunderstorm ?? 0.72,
      cloudburst: h2.cloudburst_prob ?? backendCell.probabilities?.cloudburst ?? 0.54,
      flashFlood: backendCell.flash_flood_risk ?? backendCell.probabilities?.flashFlood ?? 0.68,
    },
    terrain: {
      slopeDeg: backendCell.terrain?.slope_deg ?? 36.0,
      elevationM: backendCell.terrain?.elevation_m ?? 1450,
      twi: backendCell.terrain?.twi ?? 11.2,
      catchmentVuln: backendCell.terrain_susceptibility ?? 0.75,
    },
    xaiAttribution: [
      {
        feature: "cloudburst",
        label: "Convective Updraft & CTT Drop",
        contribution: Math.round((backendCell.meteorological_forcing || 0.44) * 100) / 100,
        observedValue: -18.5,
        unit: "K/hr",
      },
      {
        feature: "slope",
        label: "Steep Gorge Channeling",
        contribution: Math.round((backendCell.terrain_susceptibility || 0.36) * 100) / 100,
        observedValue: backendCell.terrain?.slope_deg ?? 38.4,
        unit: "°",
      },
      {
        feature: "tpw",
        label: "Integrated Water Vapor (IWV)",
        contribution: 0.20,
        observedValue: 58.2,
        unit: "mm",
      },
    ],
  };
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
  const [isCustomObservationOpen, setIsCustomObservationOpen] = useState<boolean>(false);

  const openCustomObservation = () => setIsCustomObservationOpen(true);
  const closeCustomObservation = () => setIsCustomObservationOpen(false);

  // Dynamic Grid Cells
  const [cells, setCells] = useState<SelectedCellData[]>(GRID_CELLS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("kedarnath_2013");

  // Modal actions
  const toggleCommandPalette = () => setIsCommandPaletteOpen((prev) => !prev);
  const openCommandPalette = () => setIsCommandPaletteOpen(true);
  const closeCommandPalette = () => setIsCommandPaletteOpen(false);

  const toggleShortcutsModal = () => setIsShortcutsModalOpen((prev) => !prev);
  const openShortcutsModal = () => setIsShortcutsModalOpen(true);
  const closeShortcutsModal = () => setIsShortcutsModalOpen(false);

  const toggleCustomObservation = () => setIsCustomObservationOpen((prev) => !prev);

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
    const matching = cells.find((c) => c.cellId === cellId) || GRID_CELLS.find((c) => c.cellId === cellId);
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

  const loadScenario = async (scenarioId: string) => {
    setIsTriggeringCycle(true);
    setActiveScenarioId(scenarioId);
    try {
      const res = await fetch(`/api/py/ingestion/scenarios/${scenarioId}/trigger`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setActiveJobId(data.job_id || `job_scenario_${scenarioId}`);
        setLastGenTime(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
        if (data.cells && data.cells.length > 0) {
          const transformed = data.cells.map((c: any) => transformBackendCellToCellData(c, data.generated_at));
          setCells(transformed);
          const targetId = data.scenario?.target_cell_id;
          const matching = transformed.find((c: any) => c.cellId === targetId);
          if (matching) setSelectedCell(matching);
        }
      } else {
        throw new Error("Scenario trigger failed");
      }
    } catch {
      // Offline fallback: update selected cell based on scenario
      if (scenarioId === "kedarnath_2013") {
        const ked = cells.find((c) => c.cellId === "3073_7906") || GRID_CELLS[2];
        setSelectedCell(ked);
      } else if (scenarioId === "chamoli_2021") {
        const cham = cells.find((c) => c.cellId === "3055_7935") || GRID_CELLS[4];
        setSelectedCell(cham);
      } else {
        const har = cells.find((c) => c.cellId === "2994_7816") || GRID_CELLS[5];
        setSelectedCell(har);
      }
    } finally {
      setIsTriggeringCycle(false);
    }
  };

  const triggerNowcastCycle = async () => {
    setIsTriggeringCycle(true);
    try {
      const res = await fetch("/api/py/orchestration/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_synthetic_replay: true, source: "sentinel_console_trigger" }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveJobId(data.job_id || "job_nowcast_active");
        setLastGenTime(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
        if (data.cells && data.cells.length > 0) {
          const transformed = data.cells.map((c: any) => transformBackendCellToCellData(c, data.generated_at));
          setCells(transformed);
          if (selectedCell) {
            const updated = transformed.find((c: any) => c.cellId === selectedCell.cellId);
            if (updated) setSelectedCell(updated);
          }
        }
      }
    } catch {
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
        isCustomObservationOpen,
        openCustomObservation,
        closeCustomObservation,
        cells,
        selectedCell,
        setSelectedCell,
        focusLocationByCellId,
        activeScenarioId,
        loadScenario,
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
