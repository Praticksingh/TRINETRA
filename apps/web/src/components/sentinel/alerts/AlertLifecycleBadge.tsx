"use client";

import React from "react";
import { AlertLifecycleStatus } from "@/app/alerts/AlertPanel";
import { Sparkles, Eye, Send, CheckCircle2, Archive, XCircle } from "lucide-react";

export interface AlertLifecycleBadgeProps {
  status: AlertLifecycleStatus;
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export const AlertLifecycleBadge: React.FC<AlertLifecycleBadgeProps> = ({
  status,
  size = "sm",
  showIcon = true,
  className = "",
}) => {
  const config: Record<
    AlertLifecycleStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ElementType }
  > = {
    GENERATED: {
      label: "GENERATED",
      bg: "bg-[#0F3847]/80",
      text: "text-[#36D9E8]",
      border: "border-[#36D9E8]/40",
      icon: Sparkles,
    },
    UNDER_REVIEW: {
      label: "UNDER REVIEW",
      bg: "bg-amber-950/70",
      text: "text-amber-300",
      border: "border-amber-700/50",
      icon: Eye,
    },
    DISPATCHED: {
      label: "DISPATCHED",
      bg: "bg-purple-950/70",
      text: "text-purple-300",
      border: "border-purple-700/50",
      icon: Send,
    },
    ACKNOWLEDGED: {
      label: "ACKNOWLEDGED",
      bg: "bg-emerald-950/70",
      text: "text-emerald-300",
      border: "border-emerald-700/50",
      icon: CheckCircle2,
    },
    RESOLVED: {
      label: "RESOLVED",
      bg: "bg-slate-800/80",
      text: "text-slate-300",
      border: "border-slate-700",
      icon: Archive,
    },
    REVOKED: {
      label: "REVOKED",
      bg: "bg-rose-950/40",
      text: "text-rose-400",
      border: "border-rose-800/60",
      icon: XCircle,
    },
  };

  const current = config[status] || config.GENERATED;
  const Icon = current.icon;

  const sizeClasses = {
    xs: "px-1.5 py-0.2 text-[9px] gap-1 font-mono",
    sm: "px-2 py-0.5 text-[10px] gap-1.5 font-mono",
    md: "px-2.5 py-1 text-xs gap-1.5 font-mono",
  };

  return (
    <span
      className={`inline-flex items-center rounded border font-semibold uppercase tracking-wider select-none ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]} ${className}`}
      role="status"
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{current.label}</span>
    </span>
  );
};
