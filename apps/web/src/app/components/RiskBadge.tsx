import React from "react";
import { ShieldCheck, AlertCircle, AlertTriangle, Flame, Info } from "lucide-react";

export type SeverityLevel = "none" | "advisory" | "watch" | "warning" | "critical";

interface RiskBadgeProps {
  severity: SeverityLevel;
  label?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const SEVERITY_CONFIG: Record<
  SeverityLevel,
  {
    bg: string;
    text: string;
    border: string;
    label: string;
    shapeIcon: React.ElementType;
    shapeDesc: string; // Accessible text for screen readers / color-blindness
  }
> = {
  none: {
    bg: "bg-emerald-950/70",
    text: "text-emerald-400",
    border: "border-emerald-700/60",
    label: "LOW / NOMINAL",
    shapeIcon: ShieldCheck,
    shapeDesc: "[CIRCLE: Low Risk]",
  },
  advisory: {
    bg: "bg-amber-950/70",
    text: "text-amber-400",
    border: "border-amber-700/60",
    label: "ADVISORY",
    shapeIcon: Info,
    shapeDesc: "[SQUARE: Advisory - Be Aware]",
  },
  watch: {
    bg: "bg-orange-950/70",
    text: "text-orange-400",
    border: "border-orange-700/60",
    label: "WATCH",
    shapeIcon: AlertTriangle,
    shapeDesc: "[TRIANGLE: Watch - Prepare]",
  },
  warning: {
    bg: "bg-rose-950/80",
    text: "text-rose-400",
    border: "border-rose-600/70",
    label: "WARNING",
    shapeIcon: AlertCircle,
    shapeDesc: "[OCTAGON: Warning - Imminent]",
  },
  critical: {
    bg: "bg-red-950/90",
    text: "text-red-300",
    border: "border-red-500",
    label: "CRITICAL",
    shapeIcon: Flame,
    shapeDesc: "[DIAMOND: Critical - Evacuate]",
  },
};

export default function RiskBadge({
  severity,
  label,
  size = "md",
  showIcon = true,
  className = "",
}: RiskBadgeProps) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.none;
  const Icon = config.shapeIcon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2 font-medium",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={`inline-flex items-center rounded border font-mono uppercase tracking-wider ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
      title={`${config.label} - ${config.shapeDesc}`}
      role="status"
      aria-label={`${config.label}: ${config.shapeDesc}`}
    >
      {showIcon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      <span>{label || config.label}</span>
      <span className="sr-only">{config.shapeDesc}</span>
    </span>
  );
}
