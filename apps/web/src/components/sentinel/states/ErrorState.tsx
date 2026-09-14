"use client";

import React from "react";
import { Button } from "@/components/sentinel/Button";
import { AlertTriangle, RefreshCw, HelpCircle } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  errorMessage?: string;
  errorCode?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "DATA TRANSMISSION OR INFERENCE ERROR",
  errorMessage = "Unable to complete nowcasting cycle. Upstream satellite telemetry channel timed out.",
  errorCode = "ERR_UPSTREAM_TIMEOUT_504",
  onRetry,
  className = "",
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center p-8 text-center font-mono border border-rose-800/60 rounded-xl bg-rose-950/20 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-400 mb-3">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider font-sans">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-300 max-w-md leading-relaxed font-sans">
        {errorMessage}
      </p>
      <span className="mt-2 text-[10px] text-slate-400 font-mono">
        CODE: <strong className="text-rose-400">{errorCode}</strong>
      </span>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={onRetry}
          >
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
};
