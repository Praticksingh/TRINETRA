"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  position?: "right" | "left" | "bottom";
  width?: string;
  height?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  position = "right",
  width = "w-96",
  height = "h-80",
  children,
  headerActions,
  className = "",
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
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

  const positionClasses = {
    right: `top-0 right-0 bottom-0 ${width} border-l border-white/[0.08] animate-in slide-in-from-right duration-200`,
    left: `top-0 left-0 bottom-0 ${width} border-r border-white/[0.08] animate-in slide-in-from-left duration-200`,
    bottom: `bottom-0 left-0 right-0 ${height} border-t border-white/[0.08] animate-in slide-in-from-bottom duration-200`,
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0B0C10]/80 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Drawer Panel"}
        className={`relative z-50 flex flex-col bg-[#161820]/98 backdrop-blur-xl shadow-clay-card-elevated text-slate-200 ${positionClasses[position]} ${className}`}
      >
        {/* Header */}
        {(title || headerActions) && (
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#111217] px-4 py-3.5">
            <div>
              {title && (
                <h3 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {headerActions}
              <button
                onClick={onClose}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1D202B] transition shadow-clay-btn active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400"
                aria-label="Close Drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
};
