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
        // Clean, subtle weather-platform elevations (replacing claymorphism bevels)
        "clay-card": "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
        "clay-card-elevated": "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 4px 10px -4px rgba(0, 0, 0, 0.4)",
        "clay-btn": "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        "clay-btn-primary": "0 1px 3px 0 rgba(79, 70, 229, 0.35)",
        "clay-btn-danger": "0 1px 3px 0 rgba(225, 29, 72, 0.35)",
        "clay-btn-pressed": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)",
        "clay-badge": "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
        "clay-inset": "inset 0 1px 3px 0 rgba(0, 0, 0, 0.4)",
      },
      borderRadius: {
        "clay-sm": "6px",
        clay: "10px",
        "clay-lg": "14px",
        "clay-xl": "18px",
      },
    },
  },
  plugins: [],
};

export default config;
