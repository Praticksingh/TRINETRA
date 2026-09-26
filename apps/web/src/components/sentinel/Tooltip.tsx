"use client";

import React, { useState } from "react";
import { HelpCircle, Info } from "lucide-react";
import { TERMINOLOGY } from "@/config/copy";

export interface TooltipProps {
  content: React.ReactNode;
  subtitle?: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  subtitle,
  position = "top",
  children,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none whitespace-normal w-max max-w-xs rounded-xl border border-white/[0.1] bg-[#161820]/98 p-2.5 text-xs shadow-clay-card-elevated backdrop-blur-xl transition-all duration-150 animate-in fade-in zoom-in-95 ${positionClasses[position]} ${className}`}
        >
          {subtitle && (
            <div className="text-[10px] font-mono text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">
              {subtitle}
            </div>
          )}
          <div className="text-slate-200 text-[11px] leading-relaxed font-sans">{content}</div>
        </div>
      )}
    </div>
  );
};

export interface TermHelpProps {
  termKey?: string;
  term?: string;
  customTitle?: string;
  customText?: string;
  children?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/**
 * Reusable two-layer explanation helper.
 * If children provided, wraps them with subtle dotted underline.
 * If no children, renders an unobtrusive (i) icon.
 */
export const TermHelp: React.FC<TermHelpProps> = ({
  termKey,
  term,
  customTitle,
  customText,
  children,
  position = "top",
  className = "",
}) => {
  const resolvedKey = termKey || term;
  const termEntry = resolvedKey ? TERMINOLOGY[resolvedKey] : undefined;
  const title = customTitle || termEntry?.technical || "Scientific Detail";
  const body = customText || termEntry?.explanation || "";

  if (!body) return <>{children}</>;

  if (children) {
    return (
      <Tooltip subtitle={title} content={body} position={position} className={className}>
        <span className="underline decoration-dotted decoration-indigo-400/60 underline-offset-2 cursor-help hover:text-indigo-200 transition-colors">
          {children}
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip subtitle={title} content={body} position={position} className={className}>
      <span
        tabIndex={0}
        aria-label={`Explanation for ${title}`}
        className="inline-flex items-center justify-center p-0.5 text-zinc-400 hover:text-indigo-300 transition cursor-help rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
      >
        <Info className="h-3 w-3" />
      </span>
    </Tooltip>
  );
};
