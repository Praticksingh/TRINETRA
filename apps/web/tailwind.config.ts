import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0C10",
        surface: {
          50: "#111217",
          100: "#161820",
          200: "#1D202B",
          300: "#262A38",
          border: "#272A38",
        },
        hazard: {
          green: "#10b981",
          advisory: "#f59e0b",
          watch: "#f97316",
          warning: "#f43f5e",
        },
        // Sentinel Obsidian & Mineral Titanium Design System tokens
        sentinel: {
          bg: "#0B0C10",
          bgSubtle: "#0E0F14",
          panel: "#161820",
          panelSubtle: "#111217",
          panelElevated: "#1D202B",
          panelHover: "#252937",
          border: "#272A38",
          borderSubtle: "#1C1E28",
          borderHighlight: "#3B3F52",
          accent: "#6366F1",
          accentHover: "#4F46E5",
          accentActive: "#4338CA",
          accentSoft: "#818CF8",
          accentMuted: "#1C1F30",
          azure: "#38BDF8",
          azureHover: "#0284C7",
          cyan: "#38BDF8",
          cyanHover: "#0284C7",
          cyanActive: "#0369A1",
          cyanMuted: "#1C1F30",
          textPrimary: "#F8FAFC",
          textSecondary: "#A1A1AA",
          textMuted: "#71717A",
          riskLow: "#10B981",
          riskWatch: "#F59E0B",
          riskWarning: "#F97316",
          riskCritical: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        "clay-card": "0 16px 36px -4px rgba(0, 0, 0, 0.7), 0 6px 14px -2px rgba(0, 0, 0, 0.45), inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.14), inset -2.5px -2.5px 5px rgba(0, 0, 0, 0.65)",
        "clay-card-elevated": "0 24px 48px -6px rgba(0, 0, 0, 0.8), 0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 2px 2px 4px rgba(255, 255, 255, 0.18), inset -3.5px -3.5px 7px rgba(0, 0, 0, 0.7)",
        "clay-btn": "0 6px 14px -2px rgba(0, 0, 0, 0.5), inset 1.5px 1.5px 2.5px rgba(255, 255, 255, 0.18), inset -2px -2px 4px rgba(0, 0, 0, 0.5)",
        "clay-btn-primary": "0 6px 20px -2px rgba(99, 102, 241, 0.45), inset 2px 2px 4px rgba(255, 255, 255, 0.35), inset -3px -3px 6px rgba(67, 56, 202, 0.7)",
        "clay-btn-danger": "0 6px 20px -2px rgba(225, 29, 72, 0.45), inset 2px 2px 4px rgba(255, 255, 255, 0.3), inset -3px -3px 6px rgba(159, 18, 57, 0.7)",
        "clay-btn-pressed": "0 2px 6px -1px rgba(0, 0, 0, 0.6), inset 2.5px 2.5px 6px rgba(0, 0, 0, 0.75), inset -1px -1px 2px rgba(255, 255, 255, 0.08)",
        "clay-badge": "0 4px 10px -2px rgba(0, 0, 0, 0.4), inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.2), inset -1.5px -1.5px 3px rgba(0, 0, 0, 0.45)",
        "clay-inset": "inset 2.5px 2.5px 6px rgba(0, 0, 0, 0.8), inset -1.5px -1.5px 3px rgba(255, 255, 255, 0.06)",
      },
      borderRadius: {
        "clay-sm": "12px",
        clay: "18px",
        "clay-lg": "24px",
        "clay-xl": "32px",
      },
    },
  },
  plugins: [],
};

export default config;
