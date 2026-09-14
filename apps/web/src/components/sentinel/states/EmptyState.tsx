"use client";

import React from "react";
import { Button } from "@/components/sentinel/Button";
import { Inbox, CheckCircle2, ShieldCheck } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      className={`flex flex-col items-center justify-center p-8 text-center font-mono border border-dashed border-[#1F3350] rounded-xl bg-[#090E1A]/40 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F3847]/60 border border-[#36D9E8]/30 text-[#36D9E8] mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-sans">
        {title}
      </h3>
      <p className="mt-1 text-xs text-[#91A5BB] max-w-md leading-relaxed font-sans">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
