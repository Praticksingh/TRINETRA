"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { SentinelHeader } from "@/components/sentinel/SentinelHeader";
import { SentinelSidebar } from "@/components/sentinel/SentinelSidebar";
import { SentinelSystemDrawer } from "@/components/sentinel/SentinelSystemDrawer";
import { CommandPalette } from "@/components/sentinel/CommandPalette";
import { KeyboardShortcutsModal } from "@/components/sentinel/KeyboardShortcutsModal";
import { CustomObservationModal } from "@/components/sentinel/CustomObservationModal";
import AlertPanel from "@/app/alerts/AlertPanel";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";

export interface SentinelShellProps {
  children: React.ReactNode;
}

export const SentinelShell: React.FC<SentinelShellProps> = ({ children }) => {
  const {
    isAlertDrawerOpen,
    toggleAlertDrawer,
    isSystemDrawerOpen,
    toggleSystemDrawer,
    isCommandPaletteOpen,
    toggleCommandPalette,
    closeCommandPalette,
    isShortcutsModalOpen,
    toggleShortcutsModal,
    openShortcutsModal,
    closeShortcutsModal,
    isSidebarCollapsed,
    toggleSidebar,
    alerts,
    acknowledgeAlert,
    selectedCell,
    setSelectedCell,
    setCurrentView,
    triggerNowcastCycle,
  } = useSentinel();

  const handleFocusAlert = (alert: any) => {
    const matching = GRID_CELLS.find((c) => alert.affectedCells.includes(c.cellId));
    if (matching) {
      setSelectedCell(matching);
      setCurrentView("map");
    }
  };

  // Keyboard Navigation Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      const target = e.target as HTMLElement;
      const isInputActive =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isInputActive) {
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      // Command Palette: ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Shortcuts Help: ?
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleShortcutsModal();
        return;
      }

      // Run Forecast: R
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        triggerNowcastCycle();
        return;
      }

      // Global Escape handling
      if (e.key === "Escape") {
        if (isCommandPaletteOpen) {
          closeCommandPalette();
          return;
        }
        if (isShortcutsModalOpen) {
          closeShortcutsModal();
          return;
        }
        if (isAlertDrawerOpen) {
          toggleAlertDrawer();
          return;
        }
        if (isSystemDrawerOpen) {
          toggleSystemDrawer();
          return;
        }
        if (selectedCell) {
          setSelectedCell(null);
          return;
        }
        return;
      }

      // Quick view switching: 1-7 & sidebar toggle
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === "1") setCurrentView("overview");
        else if (e.key === "2") setCurrentView("map");
        else if (e.key === "3") setCurrentView("timeline");
        else if (e.key === "4") setCurrentView("alerts");
        else if (e.key === "5") setCurrentView("insights");
        else if (e.key === "6") setCurrentView("provenance");
        else if (e.key === "7") setCurrentView("globe");
        else if (e.key === "[") toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isAlertDrawerOpen,
    isSystemDrawerOpen,
    isCommandPaletteOpen,
    isShortcutsModalOpen,
    selectedCell,
    toggleAlertDrawer,
    toggleSystemDrawer,
    toggleCommandPalette,
    closeCommandPalette,
    toggleShortcutsModal,
    closeShortcutsModal,
    setSelectedCell,
    toggleSidebar,
    setCurrentView,
    triggerNowcastCycle,
  ]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0B1220] text-slate-100 font-sans">
      {/* Accessible Skip to Main Content Link for Keyboard Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-sky-600 focus:text-white focus:text-xs focus:font-sans focus:font-semibold focus:rounded-md focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        Skip to main content
      </a>

      {/* Top Fixed Header */}
      <SentinelHeader />

      {/* Center Layout: Collapsible Sidebar + Contextual Workspace */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SentinelSidebar />

        {/* Dynamic Main Workspace */}
        <main id="main-content" tabIndex={-1} className="relative flex flex-1 flex-col overflow-hidden bg-[#070D18] focus:outline-none">
          {children}
        </main>

        {/* Global Slide-Out Alert Center Drawer */}
        {isAlertDrawerOpen && (
          <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in slide-in-from-right duration-200">
            <AlertPanel
              alerts={alerts}
              onAcknowledgeAlert={acknowledgeAlert}
              onFocusRegion={handleFocusAlert}
              onClose={toggleAlertDrawer}
            />
          </div>
        )}

        {/* Global Telemetry & Provenance System Drawer */}
        <SentinelSystemDrawer />

        {/* Command Palette Modal (⌘K / Ctrl+K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={closeCommandPalette}
          onOpenShortcuts={openShortcutsModal}
        />

        {/* Keyboard Shortcuts Reference Modal (?) */}
        <KeyboardShortcutsModal
          isOpen={isShortcutsModalOpen}
          onClose={closeShortcutsModal}
        />

        {/* Custom Observation Ingestion Modal */}
        <CustomObservationModal />
      </div>
    </div>
  );
};
