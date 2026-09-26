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
    // Clean, professional weather-platform button variants
    const variantClasses = {
      primary:
        "bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-500 active:bg-indigo-700 border border-indigo-400/40",
      secondary:
        "bg-[#181C28] text-slate-200 hover:text-white hover:bg-[#222838] active:bg-[#141822] shadow-sm border border-[#2B3142]",
      ghost:
        "bg-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent",
      danger:
        "bg-rose-700 text-white font-medium hover:bg-rose-600 active:bg-rose-800 shadow-sm border border-rose-500/40",
      outline:
        "bg-transparent text-indigo-400 border border-indigo-500/40 hover:bg-indigo-950/30 hover:border-indigo-400/80 shadow-sm",
      active:
        "bg-indigo-950/60 text-indigo-300 border border-indigo-500/50 font-medium shadow-sm",
    };

    // Accessible touch target sizing
    const sizeClasses = {
      xs: "min-h-[28px] h-7 px-2.5 text-[11px] gap-1 rounded-md font-sans",
      sm: "min-h-[32px] sm:min-h-[34px] h-8 px-3 text-xs gap-1.5 rounded-lg font-sans",
      md: "min-h-[38px] sm:min-h-[40px] h-9 sm:h-10 px-3.5 sm:px-4 text-xs sm:text-sm gap-2 rounded-lg font-sans font-medium",
      lg: "min-h-[44px] h-11 px-5 text-sm gap-2.5 rounded-lg font-sans font-medium",
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
