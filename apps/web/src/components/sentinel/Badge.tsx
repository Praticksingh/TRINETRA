"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, AlertCircle, Flame } from "lucide-react";
import { SeverityType } from "@/styles/tokens";

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
    xs: "px-1.5 py-0.5 text-[10px] gap-1 font-sans rounded-md border",
    sm: "px-2 py-0.5 text-xs gap-1.5 font-sans font-medium rounded-md border",
    md: "px-2.5 py-1 text-xs gap-1.5 font-sans font-medium rounded-md border",
  };

  const iconSizes = {
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
  };

  // Severity styling configuration - calm, semantic, and high-contrast
  const severityConfigs = {
    low: {
      label: "Low Risk",
      bg: "rgba(6, 78, 59, 0.35)",
      border: "rgba(16, 185, 129, 0.4)",
      text: "#34D399",
      shapeSymbol: "●",
      shapeDesc: "Circle (Low)",
    },
    watch: {
      label: "Watch",
      bg: "rgba(120, 53, 15, 0.35)",
      border: "rgba(245, 158, 11, 0.45)",
      text: "#FCD34D",
      shapeSymbol: "◆",
      shapeDesc: "Diamond (Watch)",
    },
    warning: {
      label: "Warning",
      bg: "rgba(124, 45, 18, 0.35)",
      border: "rgba(249, 115, 22, 0.45)",
      text: "#FB923C",
      shapeSymbol: "▲",
      shapeDesc: "Triangle (Warning)",
    },
    critical: {
      label: "Critical",
      bg: "rgba(136, 19, 55, 0.4)",
      border: "rgba(244, 63, 94, 0.5)",
      text: "#FDA4AF",
      shapeSymbol: "▲",
      shapeDesc: "Critical Risk Indicator",
    },
  };

  if (variant === "severity" && severity) {
    const config = severityConfigs[normalizedSeverity];
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
        className={`inline-flex items-center font-medium select-none ${sizeClasses[size]} ${className}`}
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
            className={`font-bold text-[10px] leading-none ${isCritical || pulse ? "animate-pulse" : ""}`}
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

  // Non-severity utility variants
  const variantStyles = {
    cyan: "bg-indigo-950/40 text-indigo-300 border-indigo-500/30",
    neutral: "bg-[#181C28] text-slate-300 border-[#2B3142]",
    purple: "bg-purple-950/40 text-purple-300 border-purple-500/30",
    emerald: "bg-emerald-950/40 text-emerald-300 border-emerald-500/30",
    outline: "bg-transparent border-[#2B3142] text-slate-300",
    severity: "bg-[#181C28] text-slate-300 border-[#2B3142]",
  };

  return (
    <span
      role="status"
      className={`inline-flex items-center font-medium select-none ${variantStyles[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {pulse && <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />}
      <span>{children}</span>
    </span>
  );
};
