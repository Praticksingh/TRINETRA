/**
 * TRINETRA Canonical Type Definitions
 * Strict TypeScript types for spatiotemporal observations, nowcast forecasts, and alert lifecycles.
 */

export type SeverityLevel = 'none' | 'advisory' | 'watch' | 'warning';

export type HazardType = 'thunderstorm' | 'cloudburst' | 'flash_flood' | 'multi_hazard';

export type AlertStatus =
  | 'generated'
  | 'reviewed'
  | 'issued'
  | 'acknowledged'
  | 'resolved'
  | 'expired';

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
}

export interface TerrainFactors {
  slope_deg: number;
  twi: number;
  catchment_vuln: number;
}

export interface XAIAttribution {
  feature: string;
  contribution: number;
  observed_value?: number;
  unit?: string;
}

export interface HazardProbabilities {
  thunderstorm: number;
  cloudburst: number;
  flash_flood: number;
}

export interface GridCellPrediction {
  grid_cell_id: string;
  centroid: [number, number]; // [lon, lat]
  horizon_minutes: number;
  valid_time: string; // ISO 8601 UTC
  probabilities: HazardProbabilities;
  severity: SeverityLevel;
  terrain_factors?: TerrainFactors;
  xai_attribution?: XAIAttribution[];
}

export interface ForecastSnapshot {
  forecast_id: string;
  model_version: string;
  generated_at: string; // ISO 8601 UTC
  data_timestamp: string; // ISO 8601 UTC
  is_synthetic_replay: boolean;
  region_code: string;
  region_name: string;
  grid_resolution_deg: number;
  predictions: GridCellPrediction[];
}

export interface AlertAuditRecord {
  timestamp: string;
  action: string;
  actor_id: string;
  notes?: string;
}

export interface AlertRecord {
  alert_id: string;
  hazard_type: HazardType;
  severity: SeverityLevel;
  region_code: string;
  region_name: string;
  headline: string;
  description: string;
  status: AlertStatus;
  issued_at: string;
  valid_from: string;
  valid_to: string;
  is_official_warning: boolean;
  affected_cells?: string[];
  audit_trail?: AlertAuditRecord[];
}

export interface SystemHealthStatus {
  status: 'operational' | 'degraded' | 'outage';
  satellite_feed_freshness_minutes: number;
  nwp_freshness_minutes: number;
  last_inference_timestamp: string;
  ml_service_healthy: boolean;
  database_healthy: boolean;
}
