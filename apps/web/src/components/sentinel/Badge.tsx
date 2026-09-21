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
    xs: "px-2 py-0.5 text-[9px] gap-1 font-sans rounded-full shadow-clay-badge border border-white/[0.08]",
    sm: "px-2.5 py-0.5 text-[10px] gap-1.5 font-sans rounded-full shadow-clay-badge border border-white/[0.08]",
    md: "px-3 py-1 text-xs gap-1.5 font-sans font-medium rounded-full shadow-clay-badge border border-white/[0.08]",
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
        className={`inline-flex items-center tracking-wider uppercase font-semibold select-none ${sizeClasses[size]} ${className}`}
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

  // Non-severity utility variants (Obsidian Titanium Claymorphism)
  const variantStyles = {
    cyan: "bg-[#1C1F30] text-indigo-300 border-indigo-500/40 shadow-clay-badge",
    neutral: "bg-[#1D202B] text-slate-200 border-white/[0.08] shadow-clay-badge",
    purple: "bg-[#201633] text-purple-300 border-purple-500/40 shadow-clay-badge",
    emerald: "bg-[#11221A] text-emerald-300 border-emerald-500/40 shadow-clay-badge",
    outline: "bg-transparent border-[#272A38] text-slate-300 shadow-sm",
    severity: "bg-[#1D202B] text-slate-200 border-white/[0.08] shadow-clay-badge",
  };

  return (
    <span
      role="status"
      className={`inline-flex items-center font-semibold select-none ${variantStyles[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {pulse && <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />}
      <span>{children}</span>
    </span>
  );
};
