"use client";

import React, { useEffect } from "react";
import { X, Keyboard, Command, Sparkles } from "lucide-react";

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const groups: ShortcutGroup[] = [
    {
      title: "Workspace Navigation",
      items: [
        { keys: ["1"], description: "Switch to Operational Overview" },
        { keys: ["2"], description: "Switch to Weather Map" },
        { keys: ["3"], description: "Switch to Forecast Timeline" },
        { keys: ["4"], description: "Switch to Alerts Center" },
        { keys: ["5"], description: "Switch to AI Analysis" },
        { keys: ["6"], description: "Switch to Data Sources" },
        { keys: ["7"], description: "Switch to Earth View (3D Globe)" },
        { keys: ["["], description: "Expand / Collapse Navigation Sidebar" },
      ],
    },
    {
      title: "Command & Search",
      items: [
        { keys: ["⌘", "K"], description: "Open Command Palette & Station Search" },
        { keys: ["Ctrl", "K"], description: "Open Command Palette (Windows / Linux)" },
        { keys: ["?"], description: "Open this Keyboard Shortcuts sheet" },
        { keys: ["Esc"], description: "Close active drawer, modal, or selection" },
      ],
    },
    {
      title: "Operations & Accessibility",
      items: [
        { keys: ["R"], description: "Run Automated Forecast Cycle" },
        { keys: ["Tab"], description: "Navigate forward through interactive controls" },
        { keys: ["Shift", "Tab"], description: "Navigate backward through interactive controls" },
        { keys: ["Enter"], description: "Activate selected control or confirmation" },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts Reference"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#080E1A]/80 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-[#1E2E48] bg-[#0D1524] shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-slate-200 overflow-hidden font-sans animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2E48] px-5 py-3.5 bg-[#111A2C]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-sky-500/30 bg-[#16233B] text-sky-400">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 font-sans">
                Keyboard Shortcuts Reference
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Full accessibility and hands-on operational hotkeys
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-slate-200 hover:bg-[#16233B] transition"
            aria-label="Close Keyboard Shortcuts Modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {groups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider font-sans">
                {group.title}
              </h3>

              <div className="rounded-lg border border-[#1E2E48]/80 bg-[#080E1A]/60 divide-y divide-[#1E2E48]/50">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 text-xs"
                  >
                    <span className="text-slate-300 font-sans text-[11px]">
                      {item.description}
                    </span>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="min-w-[20px] text-center rounded border border-[#1E2E48] bg-[#16233B] px-1.5 py-0.5 text-[10px] font-mono text-slate-300 shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1E2E48] bg-[#0B1322] px-5 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-sky-400" />
            <span>WCAG 2.1 AA Compliant Keyboard Navigation</span>
          </span>

          <button
            onClick={onClose}
            className="rounded px-2.5 py-1 text-xs font-sans text-slate-300 hover:text-white hover:bg-[#16233B] border border-[#1E2E48] transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
