"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "active";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "secondary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    // 3D Molded Claymorphism variant styling
    const variantClasses = {
      primary:
        "bg-[#4F46E5] text-white font-semibold shadow-clay-btn-primary hover:bg-[#4338CA] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-clay-btn-pressed border border-indigo-400/40",
      secondary:
        "bg-[#1D202B] text-slate-200 hover:text-white hover:bg-[#252937] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-clay-btn-pressed shadow-clay-btn border border-white/[0.08]",
      ghost:
        "bg-transparent text-slate-300 hover:text-indigo-300 hover:bg-white/[0.05] border border-transparent active:translate-y-0.5",
      danger:
        "bg-[#BE123C] text-white font-semibold hover:bg-[#9F1239] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-clay-btn-pressed shadow-clay-btn-danger border border-rose-400/40",
      outline:
        "bg-transparent text-indigo-400 border border-indigo-500/40 hover:bg-indigo-950/40 hover:border-indigo-400 shadow-sm active:translate-y-0.5",
      active:
        "bg-[#1C1F30] text-indigo-300 border border-indigo-500/60 shadow-clay-btn-pressed font-semibold",
    };

    // Pillowy Clay Size styling
    const sizeClasses = {
      xs: "h-6 px-2.5 text-[10px] gap-1 rounded-lg font-sans",
      sm: "h-7.5 px-3 text-xs gap-1.5 rounded-xl font-sans",
      md: "h-9 px-4 text-xs gap-2 rounded-xl font-sans font-medium",
      lg: "h-11 px-5 text-sm gap-2.5 rounded-2xl font-sans font-medium",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${
          isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
