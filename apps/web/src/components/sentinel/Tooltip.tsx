"use client";

import React, { useState } from "react";

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
          className={`absolute z-50 pointer-events-none whitespace-normal w-max max-w-xs rounded-md border border-[#1F3350] bg-[#0F1A2A]/95 p-2 text-xs shadow-xl backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95 ${positionClasses[position]} ${className}`}
        >
          {subtitle && (
            <div className="text-[10px] font-mono text-[#36D9E8] font-semibold uppercase tracking-wider mb-0.5">
              {subtitle}
            </div>
          )}
          <div className="text-slate-200 text-[11px] leading-relaxed font-sans">{content}</div>
        </div>
      )}
    </div>
  );
};
