"use client";

import React, { createContext, useContext, useId } from "react";

interface TabsContextType {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant: "segmented" | "underline";
}

const TabsContext = createContext<TabsContextType | null>(null);

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  variant?: "segmented" | "underline";
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  variant = "segmented",
  children,
  className = "",
}) => {
  return (
    <TabsContext.Provider value={{ activeTab: value, onTabChange: onValueChange, variant }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  const context = useContext(TabsContext);
  const variant = context?.variant || "segmented";

  const listStyles = {
    segmented:
      "inline-flex items-center rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-1 gap-1",
    underline:
      "flex items-center border-b border-[#1F3350] gap-4 w-full",
  };

  return (
    <div
      role="tablist"
      className={`${listStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  badgeCount?: number;
}

export const TabTrigger: React.FC<TabTriggerProps> = ({
  value,
  children,
  badgeCount,
  className = "",
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabTrigger must be used inside <Tabs>");

  const { activeTab, onTabChange, variant } = context;
  const isActive = activeTab === value;

  const triggerStyles = {
    segmented: `px-3 py-1 text-xs font-mono rounded transition-all duration-150 select-none ${
      isActive
        ? "bg-[#142235] text-[#36D9E8] font-bold shadow border border-[#36D9E8]/40"
        : "text-[#91A5BB] hover:text-slate-200 hover:bg-[#142235]/40"
    }`,
    underline: `pb-2 px-1 text-xs font-medium transition-all duration-150 border-b-2 select-none flex items-center gap-2 ${
      isActive
        ? "border-[#36D9E8] text-[#36D9E8] font-bold"
        : "border-transparent text-[#91A5BB] hover:text-slate-200 hover:border-[#1F3350]"
    }`,
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => onTabChange(value)}
      className={`${triggerStyles[variant]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {typeof badgeCount === "number" && (
        <span
          className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${
            isActive
              ? "bg-[#0F3847] text-[#36D9E8] border border-[#36D9E8]/40"
              : "bg-[#142235] text-[#91A5BB] border border-[#1F3350]"
          }`}
        >
          {badgeCount}
        </span>
      )}
    </button>
  );
};

export interface TabContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabContent: React.FC<TabContentProps> = ({
  value,
  children,
  className = "",
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabContent must be used inside <Tabs>");

  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={`animate-in fade-in duration-200 ${className}`}
    >
      {children}
    </div>
  );
};
