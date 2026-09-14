"use client";

import React from "react";
import { Button } from "@/components/sentinel/Button";
import { WifiOff, RefreshCw, HardDriveDownload } from "lucide-react";

export interface OfflineStateProps {
  onReconnect?: () => void;
  className?: string;
}

export const OfflineState: React.FC<OfflineStateProps> = ({
  onReconnect,
  className = "",
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 text-center font-mono border border-amber-800/60 rounded-xl bg-amber-950/20 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-950/70 border border-amber-700/60 text-amber-400 mb-3">
        <WifiOff className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-sans">
        NETWORK OFFLINE — LOCAL CACHED TELEMETRY ACTIVE
      </h3>
      <p className="mt-1 text-xs text-slate-300 max-w-md leading-relaxed font-sans">
        Connection to Supabase PostGIS realtime websockets has been interrupted. Operating in local memory fallback mode.
      </p>
      {onReconnect && (
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={onReconnect}
          >
            Attempt Reconnection
          </Button>
        </div>
      )}
    </div>
  );
};
