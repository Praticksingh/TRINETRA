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
      bg: "bg-[#1C1F30]",
      text: "text-indigo-300",
      border: "border-indigo-500/40",
      icon: Sparkles,
    },
    UNDER_REVIEW: {
      label: "UNDER REVIEW",
      bg: "bg-[#241F12]",
      text: "text-amber-300",
      border: "border-amber-500/40",
      icon: Eye,
    },
    DISPATCHED: {
      label: "DISPATCHED",
      bg: "bg-[#251429]",
      text: "text-fuchsia-300",
      border: "border-fuchsia-500/40",
      icon: Send,
    },
    ACKNOWLEDGED: {
      label: "ACKNOWLEDGED",
      bg: "bg-[#11221A]",
      text: "text-emerald-300",
      border: "border-emerald-500/40",
      icon: CheckCircle2,
    },
    RESOLVED: {
      label: "RESOLVED",
      bg: "bg-[#1D202B]",
      text: "text-slate-400",
      border: "border-white/[0.08]",
      icon: Archive,
    },
    REVOKED: {
      label: "REVOKED",
      bg: "bg-[#241418]",
      text: "text-rose-400",
      border: "border-rose-500/40",
      icon: XCircle,
    },
  };

  const current = config[status] || config.GENERATED;
  const Icon = current.icon;

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[9px] gap-1 font-mono",
    sm: "px-2.5 py-0.5 text-[10px] gap-1.5 font-mono",
    md: "px-3 py-1 text-xs gap-1.5 font-mono",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-wider select-none shadow-clay-badge ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]} ${className}`}
      role="status"
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{current.label}</span>
    </span>
  );
};
