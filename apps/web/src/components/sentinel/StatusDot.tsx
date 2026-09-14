"use client";

import React from "react";

export type SystemStatusType =
  | "nominal"
  | "delayed"
  | "stale"
  | "degraded"
  | "offline"
  | "replay";

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: SystemStatusType;
  label?: string;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  label,
  pulse = false,
  size = "md",
  className = "",
  ...props
}) => {
  const statusConfig: Record<
    SystemStatusType,
    { color: string; bgPing: string; text: string; label: string }
  > = {
    nominal: {
      color: "bg-emerald-400",
      bgPing: "bg-emerald-400/75",
      text: "text-emerald-400",
      label: "NOMINAL",
    },
    delayed: {
      color: "bg-amber-400",
      bgPing: "bg-amber-400/75",
      text: "text-amber-400",
      label: "DELAYED",
    },
    stale: {
      color: "bg-orange-500",
      bgPing: "bg-orange-500/75",
      text: "text-orange-400",
      label: "STALE",
    },
    degraded: {
      color: "bg-rose-500",
      bgPing: "bg-rose-500/75",
      text: "text-rose-400",
      label: "DEGRADED",
    },
    offline: {
      color: "bg-red-600",
      bgPing: "bg-red-600/75",
      text: "text-red-500",
      label: "OFFLINE",
    },
    replay: {
      color: "bg-purple-400",
      bgPing: "bg-purple-400/75",
      text: "text-purple-300",
      label: "SYNTHETIC REPLAY",
    },
  };

  const sizeClasses = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  const current = statusConfig[status] || statusConfig.nominal;

  return (
    <span
      className={`inline-flex items-center gap-1.5 select-none font-mono text-xs ${className}`}
      title={label || current.label}
      {...props}
    >
      <span className="relative flex items-center justify-center">
        {pulse && status !== "offline" && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.bgPing}`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${sizeClasses[size]} ${current.color}`} />
      </span>

      {label && <span className={current.text}>{label}</span>}
    </span>
  );
};
