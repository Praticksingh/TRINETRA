"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "base" | "elevated" | "subtle" | "interactive";
  borderAccent?: "none" | "cyan" | "critical" | "warning";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "base",
  borderAccent = "none",
  className = "",
  ...props
}) => {
  const variantClasses = {
    base: "bg-[#111A2C] border border-[#1E2E48] shadow-[0_4px_20px_-2px_rgba(2,6,17,0.5)]",
    elevated: "bg-[#16233B] border border-[#2B4063] shadow-[0_10px_30px_-4px_rgba(2,6,17,0.7)]",
    subtle: "bg-[#0D1524] border border-[#152236]",
    interactive:
      "bg-[#111A2C] border border-[#1E2E48] hover:border-[#2B4063] hover:bg-[#1A2B47] transition-all duration-150 cursor-pointer",
  };

  const accentClasses = {
    none: "",
    cyan: "border-l-4 border-l-[#0284C7]",
    critical: "border-l-4 border-l-[#EF4444]",
    warning: "border-l-4 border-l-[#EAB308]",
  };

  return (
    <div
      className={`rounded-lg overflow-hidden text-slate-200 ${variantClasses[variant]} ${accentClasses[borderAccent]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`flex items-center justify-between border-b border-[#1E2E48]/80 px-4 py-3 bg-[#0D1524]/60 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <h3
      className={`text-sm font-semibold tracking-wide text-slate-100 font-sans ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <p
      className={`text-[11px] text-[#91A5BB] font-mono mt-0.5 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`flex items-center justify-between border-t border-[#1F3350]/80 px-4 py-2.5 bg-[#0F1A2A]/40 text-xs font-mono text-[#91A5BB] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
