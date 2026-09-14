/**
 * TRINETRA SENTINEL AURORA — DESIGN TOKENS
 * Master visual design token system following TRINETRA_SENTINEL_REFINEMENT_PHASE_PLAN.
 * 
 * Rules:
 * 1. Background: #080E1A (Deep Midnight Navy, not pure black)
 * 2. Panels: #111A2C (Slate-Blue Surfaces) with subtle borders (#1E2E48)
 * 3. Primary interaction: Soft Sky Blue (#38BDF8 / #0284C7) & Steel Blue (#60A5FA)
 * 4. Severity colors (Green/Gold/Orange/Red) reserved strictly for risk severity.
 * 5. Minimal glow; reserved for active selection or critical alert indicators.
 * 6. Every risk state must include both color and geometric shape cues:
 *    ● Low, ◆ Watch, ▲ Warning, ▲ Critical pulse.
 */

export const sentinelTokens = {
  colors: {
    // App Base & Surface Foundation (Sentinel Aurora)
    background: "#080E1A",
    backgroundSubtle: "#0B1322",
    
    panel: {
      base: "#111A2C",
      subtle: "#0D1524",
      elevated: "#16233B",
      hover: "#1A2B47",
      active: "#1F3456",
    },

    border: {
      base: "#1E2E48",
      subtle: "#152236",
      highlight: "#2B4063",
      focus: "#38BDF8",
    },

    // Interactive & System Accents (Soft Sky Blue & Steel Blue, never for severity)
    interactive: {
      accent: "#0284C7",
      accentHover: "#0369A1",
      accentSoft: "#38BDF8",
      accentMuted: "#0C2438",
      accentGlow: "rgba(56, 189, 248, 0.15)",
      // Aliases for seamless backward compatibility
      cyan: "#38BDF8",
      cyanHover: "#0284C7",
      cyanActive: "#0369A1",
      cyanMuted: "#0C2438",
      cyanGlow: "rgba(56, 189, 248, 0.15)",
      cyanGlowStrong: "rgba(56, 189, 248, 0.3)",
    },

    // Typography Hierarchy
    text: {
      primary: "#F8FAFC",   // Primary headlines, key metrics
      secondary: "#94A3B8", // Subtitles, metadata, table labels
      muted: "#64748B",     // Captions, subtle units, disabled state
      inverse: "#080E1A",   // Contrast text on bright accent pills
    },

    // Hazard & Risk Severity System (Strictly for meteorological/hydrological risk)
    severity: {
      low: {
        label: "LOW RISK",
        color: "#10B981",
        bg: "rgba(6, 46, 32, 0.65)",
        border: "rgba(16, 185, 129, 0.35)",
        text: "#34D399",
        shapeSymbol: "●",
        shapeDesc: "Circle (Low)",
      },
      watch: {
        label: "WATCH",
        color: "#EAB308",
        bg: "rgba(61, 48, 5, 0.65)",
        border: "rgba(234, 179, 8, 0.35)",
        text: "#FDE047",
        shapeSymbol: "◆",
        shapeDesc: "Diamond (Watch)",
      },
      warning: {
        label: "WARNING",
        color: "#F97316",
        bg: "rgba(67, 27, 6, 0.65)",
        border: "rgba(249, 115, 22, 0.4)",
        text: "#FB923C",
        shapeSymbol: "▲",
        shapeDesc: "Triangle (Warning)",
      },
      critical: {
        label: "CRITICAL",
        color: "#EF4444",
        bg: "rgba(69, 10, 10, 0.75)",
        border: "rgba(239, 68, 68, 0.5)",
        text: "#F87171",
        shapeSymbol: "▲",
        shapeDesc: "Pulse Triangle (Critical)",
      },
    },

    // Provenance & Source Telemetry Status
    status: {
      nominal: "#10B981",
      delayed: "#EAB308",
      stale: "#F97316",
      degraded: "#FB923C",
      offline: "#EF4444",
      replay: "#A855F7",
    },
  },

  // Typography Tokens
  typography: {
    fontSans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    sizes: {
      display: "1.75rem",    // 28px - Core dashboard titles
      heading: "1.25rem",    // 20px - Section headers
      subheading: "1.0rem",  // 16px - Card titles
      body: "0.875rem",      // 14px - Primary prose
      caption: "0.75rem",    // 12px - Secondary metrics & labels
      tiny: "0.625rem",      // 10px - Badges, timestamps, coordinates
    },
  },

  // Spacing & Layout
  spacing: {
    headerHeight: "3.25rem",       // 52px compact operational header
    sidebarWidthExpanded: "14.5rem", // 232px
    sidebarWidthCollapsed: "4rem",  // 64px
    inspectorWidth: "24rem",        // 384px right inspector
    timelineHeight: "4.5rem",       // 72px bottom timeline dock
  },

  // Corner Radii
  radii: {
    sm: "0.25rem",   // 4px - Badges, code pills
    md: "0.5rem",    // 8px - Buttons, inputs, small cards
    lg: "0.75rem",   // 12px - Panels, drawers, dialogs
    full: "9999px",  // Round pills
  },

  // Elevation & Shadows
  shadows: {
    panel: "0 4px 20px -2px rgba(2, 6, 17, 0.5)",
    floating: "0 10px 30px -4px rgba(2, 6, 17, 0.7)",
    accentGlow: "0 0 12px rgba(56, 189, 248, 0.18)",
    cyanGlow: "0 0 12px rgba(56, 189, 248, 0.18)",
    criticalGlow: "0 0 14px rgba(239, 68, 68, 0.3)",
  },

  // Animation & Motion Constants
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    standard: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    smooth: "350ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export type SeverityType = "low" | "watch" | "warning" | "critical";

export function getSeverityToken(severity: string) {
  const norm = severity.toLowerCase();
  if (norm === "critical") return sentinelTokens.colors.severity.critical;
  if (norm === "warning") return sentinelTokens.colors.severity.warning;
  if (norm === "watch" || norm === "advisory") return sentinelTokens.colors.severity.watch;
  return sentinelTokens.colors.severity.low;
}
