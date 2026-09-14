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
        background: "#090d16",
        surface: {
          50: "#131b2e",
          100: "#1a243b",
          200: "#22304d",
          border: "#263554",
        },
        hazard: {
          green: "#10b981",
          advisory: "#f59e0b",
          watch: "#f97316",
          warning: "#ef4444",
        },
        // Sentinel Aurora Design System tokens
        sentinel: {
          bg: "#080E1A",
          bgSubtle: "#0B1322",
          panel: "#111A2C",
          panelSubtle: "#0D1524",
          panelElevated: "#16233B",
          panelHover: "#1A2B47",
          border: "#1E2E48",
          borderSubtle: "#152236",
          borderHighlight: "#2B4063",
          accent: "#0284C7",
          accentSoft: "#38BDF8",
          accentMuted: "#0C2438",
          cyan: "#38BDF8",
          cyanHover: "#0284C7",
          cyanActive: "#0369A1",
          cyanMuted: "#0C2438",
          textPrimary: "#F8FAFC",
          textSecondary: "#94A3B8",
          textMuted: "#64748B",
          riskLow: "#10B981",
          riskWatch: "#EAB308",
          riskWarning: "#F97316",
          riskCritical: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
