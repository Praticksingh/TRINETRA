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
    base: "bg-[#12151E] border border-[#222634] shadow-sm rounded-xl",
    elevated: "bg-[#161A26] border border-[#2A3042] shadow-md rounded-xl",
    subtle: "bg-[#0E1017] border border-[#1C202C] rounded-xl",
    interactive:
      "bg-[#12151E] border border-[#222634] hover:border-[#383F54] hover:bg-[#161A26] transition-colors duration-150 cursor-pointer rounded-xl",
  };

  const accentClasses = {
    none: "",
    cyan: "border-l-2 border-l-indigo-400",
    critical: "border-l-2 border-l-rose-500",
    warning: "border-l-2 border-l-amber-500",
  };

  return (
    <div
      className={`overflow-hidden text-slate-200 transition-all ${variantClasses[variant]} ${accentClasses[borderAccent]} ${className}`}
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
      className={`flex items-center justify-between border-b border-[#1E2330] px-4 sm:px-5 py-3 bg-white/[0.01] ${className}`}
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
      className={`text-sm font-medium tracking-normal text-slate-100 font-sans ${className}`}
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
      className={`text-xs text-slate-400 font-sans mt-0.5 ${className}`}
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
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
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
      className={`flex items-center justify-between border-t border-[#1E2330] px-4 sm:px-5 py-2.5 bg-black/10 text-xs font-sans text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
