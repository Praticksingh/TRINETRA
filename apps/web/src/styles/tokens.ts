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
    // App Base & Surface Foundation (Obsidian & Mineral Titanium)
    background: "#0B0C10",
    backgroundSubtle: "#111217",
    
    panel: {
      base: "#161820",
      subtle: "#111217",
      elevated: "#1D202B",
      hover: "#252937",
      active: "#1C1F30",
    },

    border: {
      base: "#272A38",
      subtle: "#1C1E28",
      highlight: "#3B3F52",
      focus: "#6366F1",
    },

    // Interactive & System Accents (Arctic Indigo & Titanium)
    interactive: {
      accent: "#4F46E5",
      accentHover: "#4338CA",
      accentSoft: "#818CF8",
      accentMuted: "#1C1F30",
      accentGlow: "rgba(99, 102, 241, 0.2)",
      // Aliases for seamless backward compatibility
      cyan: "#38BDF8",
      cyanHover: "#0284C7",
      cyanActive: "#0369A1",
      cyanMuted: "#1C1F30",
      cyanGlow: "rgba(56, 189, 248, 0.15)",
      cyanGlowStrong: "rgba(56, 189, 248, 0.3)",
    },

    // Typography Hierarchy
    text: {
      primary: "#F8FAFC",   // Primary headlines, key metrics
      secondary: "#A1A1AA", // Subtitles, metadata, neutral labels
      muted: "#71717A",     // Captions, subtle units, disabled state
      inverse: "#0B0C10",   // Contrast text on bright accent pills
    },

    // Hazard & Risk Severity System (Calibrated for Obsidian Titanium)
    severity: {
      low: {
        label: "LOW RISK",
        color: "#10B981",
        bg: "rgba(16, 46, 32, 0.75)",
        border: "rgba(16, 185, 129, 0.4)",
        text: "#34D399",
        shapeSymbol: "●",
        shapeDesc: "Circle (Low)",
      },
      watch: {
        label: "WATCH",
        color: "#F59E0B",
        bg: "rgba(52, 38, 12, 0.75)",
        border: "rgba(245, 158, 11, 0.4)",
        text: "#FCD34D",
        shapeSymbol: "◆",
        shapeDesc: "Diamond (Watch)",
      },
      warning: {
        label: "WARNING",
        color: "#F97316",
        bg: "rgba(58, 26, 12, 0.75)",
        border: "rgba(249, 115, 22, 0.4)",
        text: "#FB923C",
        shapeSymbol: "▲",
        shapeDesc: "Triangle (Warning)",
      },
      critical: {
        label: "CRITICAL",
        color: "#F43F5E",
        bg: "rgba(60, 18, 26, 0.8)",
        border: "rgba(244, 63, 94, 0.5)",
        text: "#FB7185",
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
