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
    base: "bg-[#161820] border border-white/[0.08] shadow-clay-card rounded-2xl",
    elevated: "bg-[#1D202B] border border-white/[0.12] shadow-clay-card-elevated rounded-2xl",
    subtle: "bg-[#111217] border border-white/[0.05] shadow-clay-card rounded-2xl",
    interactive:
      "bg-[#161820] border border-white/[0.08] shadow-clay-card hover:shadow-clay-card-elevated hover:bg-[#1D202B] hover:-translate-y-0.5 active:translate-y-0 active:shadow-clay-card transition-all duration-200 cursor-pointer rounded-2xl",
  };

  const accentClasses = {
    none: "",
    cyan: "border-l-4 border-l-indigo-500",
    critical: "border-l-4 border-l-rose-500",
    warning: "border-l-4 border-l-amber-500",
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
      className={`flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5 bg-white/[0.02] ${className}`}
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
      className={`text-sm font-semibold tracking-wide text-white font-sans ${className}`}
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
    <div className={`p-5 ${className}`} {...props}>
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
      className={`flex items-center justify-between border-t border-white/[0.06] px-5 py-3 bg-black/20 text-xs font-sans text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
