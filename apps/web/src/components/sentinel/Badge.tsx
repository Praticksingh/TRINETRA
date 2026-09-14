"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, AlertCircle, Flame, Info, Sparkles } from "lucide-react";
import { sentinelTokens, SeverityType } from "@/styles/tokens";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity?: SeverityType | "advisory" | "none";
  variant?: "severity" | "cyan" | "neutral" | "purple" | "emerald" | "outline";
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
  shapeIndicator?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  severity,
  variant = severity ? "severity" : "neutral",
  size = "sm",
  showIcon = true,
  shapeIndicator = true,
  pulse = false,
  className = "",
  ...props
}) => {
  // Normalize severity
  const normalizedSeverity: SeverityType =
    severity === "critical"
      ? "critical"
      : severity === "warning"
      ? "warning"
      : severity === "watch" || severity === "advisory"
      ? "watch"
      : "low";

  const sizeClasses = {
    xs: "px-1.5 py-0.2 text-[9px] gap-1 font-mono",
    sm: "px-2 py-0.5 text-[10px] gap-1.5 font-mono",
    md: "px-2.5 py-1 text-xs gap-1.5 font-mono font-medium",
  };

  const iconSizes = {
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
  };

  // Severity styling configuration
  if (variant === "severity" && severity) {
    const config = sentinelTokens.colors.severity[normalizedSeverity];
    const Icon =
      normalizedSeverity === "critical"
        ? Flame
        : normalizedSeverity === "warning"
        ? AlertCircle
        : normalizedSeverity === "watch"
        ? AlertTriangle
        : ShieldCheck;

    const isCritical = normalizedSeverity === "critical";

    return (
      <span
        role="status"
        aria-label={`${config.label}: ${config.shapeDesc}`}
        className={`inline-flex items-center rounded border tracking-wider uppercase font-semibold select-none ${sizeClasses[size]} ${className}`}
        style={{
          backgroundColor: config.bg,
          borderColor: config.border,
          color: config.text,
        }}
        {...props}
      >
        {/* Geometric Shape Cue */}
        {shapeIndicator && (
          <span
            className={`font-bold text-[11px] leading-none ${isCritical || pulse ? "animate-pulse" : ""}`}
            aria-hidden="true"
          >
            {config.shapeSymbol}
          </span>
        )}

        {/* Icon */}
        {showIcon && !shapeIndicator && (
          <Icon className={`${iconSizes[size]} ${isCritical || pulse ? "animate-pulse" : ""}`} aria-hidden="true" />
        )}

        {/* Text Content */}
        <span>{children || config.label}</span>

        {/* Hidden screen-reader description */}
        <span className="sr-only">({config.shapeDesc})</span>
      </span>
    );
  }

  // Non-severity utility variants (Sentinel Aurora)
  const variantStyles = {
    cyan: "bg-[#0C2438] border-[#38BDF8]/40 text-[#38BDF8]",
    neutral: "bg-[#111A2C] border-[#1E2E48] text-slate-300",
    purple: "bg-purple-950/60 border-purple-800/40 text-purple-300",
    emerald: "bg-emerald-950/60 border-emerald-800/40 text-emerald-300",
    outline: "bg-transparent border-[#1E2E48] text-slate-400",
    severity: "bg-[#111A2C] border-[#1E2E48] text-slate-300",
  };

  return (
    <span
      role="status"
      className={`inline-flex items-center rounded border font-semibold select-none ${variantStyles[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {pulse && <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />}
      <span>{children}</span>
    </span>
  );
};
