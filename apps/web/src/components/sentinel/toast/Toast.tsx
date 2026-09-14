"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, durationMs = 4000 }: Omit<ToastMessage, "id">) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newToast: ToastMessage = { id, type, title, message, durationMs };
      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" || t.type === "warning" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "border-emerald-600/70 bg-[#09151B]/95 text-emerald-300 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                : t.type === "warning"
                ? "border-amber-600/70 bg-[#19140B]/95 text-amber-300 shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
                : t.type === "error"
                ? "border-rose-600/70 bg-[#1A0C11]/95 text-rose-300 shadow-[0_10px_30px_rgba(239,68,68,0.2)]"
                : "border-[#36D9E8]/50 bg-[#0A1628]/95 text-cyan-200 shadow-[0_10px_30px_rgba(54,217,232,0.2)]"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {t.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {t.type === "error" && <AlertCircle className="h-4 w-4 text-rose-400" />}
              {t.type === "info" && <Info className="h-4 w-4 text-[#36D9E8]" />}
            </div>

            <div className="flex-1 font-mono text-xs">
              <div className="font-bold font-sans text-slate-100 text-[13px]">{t.title}</div>
              {t.message && (
                <div className="mt-0.5 text-slate-300 font-sans text-xs leading-relaxed">
                  {t.message}
                </div>
              )}
            </div>

            <button
              onClick={() => dismissToast(t.id)}
              className="shrink-0 text-slate-400 hover:text-white transition p-0.5 rounded"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy context if rendered outside provider
    return {
      toasts: [],
      showToast: () => {},
      dismissToast: () => {},
    };
  }
  return context;
};
