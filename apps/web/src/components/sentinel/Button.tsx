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
    // Variant styling (Sentinel Aurora)
    const variantClasses = {
      primary:
        "bg-[#0284C7] text-white font-medium hover:bg-[#0369A1] active:bg-[#075985] shadow-sm border border-[#38BDF8]/40",
      secondary:
        "bg-[#111A2C] text-slate-200 hover:text-white hover:bg-[#16233B] border border-[#1E2E48] hover:border-[#2B4063] active:bg-[#1A2B47]",
      ghost:
        "bg-transparent text-slate-300 hover:text-[#38BDF8] hover:bg-[#111A2C]/60 border border-transparent",
      danger:
        "bg-rose-950/80 text-rose-200 hover:bg-rose-900 border border-rose-700/60 hover:border-rose-600 active:bg-rose-950",
      outline:
        "bg-transparent text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#0284C7]/10 hover:border-[#38BDF8]",
      active:
        "bg-[#0C2438] text-[#38BDF8] border border-[#0284C7]/60 font-semibold",
    };

    // Size styling
    const sizeClasses = {
      xs: "h-6 px-2 text-[10px] gap-1 rounded font-mono",
      sm: "h-7 px-2.5 text-xs gap-1.5 rounded font-mono",
      md: "h-9 px-3.5 text-xs gap-2 rounded-md font-sans font-medium",
      lg: "h-11 px-5 text-sm gap-2.5 rounded-md font-sans font-medium",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080E1A] ${
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
