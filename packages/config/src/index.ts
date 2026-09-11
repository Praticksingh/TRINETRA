/**
 * TRINETRA System-wide Constants & Operational Thresholds
 */

export const THRESHOLDS = {
  ADVISORY_PROBABILITY: 0.20,
  WATCH_PROBABILITY: 0.45,
  WARNING_PROBABILITY: 0.70,
  DATA_STALENESS_WARNING_MINUTES: 45,
  DATA_STALENESS_CRITICAL_MINUTES: 90,
} as const;

export const SEVERITY_COLORS = {
  none: '#10b981',      // Emerald 500
  advisory: '#f59e0b',  // Amber 500
  watch: '#f97316',     // Orange 500
  warning: '#ef4444',   // Red 500
} as const;

export const DEFAULT_PILOT_REGION = {
  code: 'IN-UT',
  name: 'Uttarakhand Central Himalayas',
  center: [78.9629, 30.0668] as [number, number],
  defaultZoom: 8.5,
  bounds: {
    min_lon: 77.5,
    min_lat: 28.5,
    max_lon: 81.0,
    max_lat: 31.5,
  },
} as const;

export const FORECAST_HORIZONS = [60, 120, 180, 240, 300, 360] as const; // 1 to 6 hours
