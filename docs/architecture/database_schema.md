# TRINETRA Database Architecture & PostGIS Schema (Phase 2)

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    profiles ||--o{ alerts : "acknowledges"
    profiles ||--o{ audit_events : "triggers"
    grid_cells ||--o{ forecast_predictions : "contains"
    forecast_snapshots ||--o{ forecast_predictions : "yields"
    forecast_snapshots ||--o{ risk_maps : "generates"

    profiles {
        uuid id PK
        string email
        string full_name
        string role
        string organization
        timestamptz created_at
    }

    grid_cells {
        string cell_id PK
        string region_code
        string region_name
        geometry centroid "Point 4326"
        geometry geom "Polygon 4326"
        numeric elevation_m
        numeric slope_deg
        numeric twi
        numeric catchment_vuln_score
    }

    observations {
        uuid id PK
        string source_name
        timestamptz observation_timestamp
        string quality_flag
        jsonb variables_metadata
    }

    forecast_snapshots {
        uuid id PK
        string forecast_id UK
        string model_version
        timestamptz generated_at
        timestamptz data_timestamp
        boolean is_synthetic_replay
        string region_code
        jsonb summary_metrics
    }

    forecast_predictions {
        uuid id PK
        string forecast_id FK
        string cell_id FK
        int horizon_minutes
        timestamptz valid_time
        numeric thunderstorm_prob
        numeric cloudburst_prob
        numeric flash_flood_prob
        string severity
        jsonb terrain_factors
        jsonb xai_attribution
    }

    risk_maps {
        uuid id PK
        string forecast_id FK
        string hazard_type
        string severity
        int horizon_minutes
        geometry geom "MultiPolygon 4326"
        numeric area_sq_km
    }

    alerts {
        uuid id PK
        string alert_id UK
        string hazard_type
        string severity
        string region_code
        string headline
        string description
        string status
        boolean is_official_warning
        string_array affected_cells
        uuid acknowledged_by FK
        timestamptz valid_from
        timestamptz valid_to
    }

    model_runs {
        uuid id PK
        string run_id UK
        string model_version
        int execution_latency_ms
        string feature_schema_version
        boolean is_synthetic_run
    }

    data_ingestion_status {
        string source_name PK
        timestamptz last_successful_ingest
        int lag_minutes
        string status
    }

    audit_events {
        uuid id PK
        string event_type
        uuid actor_id FK
        string target_resource
        string resource_id
        jsonb action_details
        timestamptz created_at
    }
```

---

## 2. Spatial & Temporal Indexing Strategy

| Table | Index Name | Index Type | Target Columns / Expression | Operational Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `grid_cells` | `idx_grid_cells_geom` | **GIST** | `geom` | Spatial intersection & point-in-polygon queries. |
| `grid_cells` | `idx_grid_cells_centroid` | **GIST** | `centroid` | Fast proximity & radius lookups from monitoring stations. |
| `risk_maps` | `idx_risk_maps_geom` | **GIST** | `geom` | Vector tile generation & hazard polygon clipping. |
| `forecast_snapshots`| `idx_forecast_snapshots_data_time` | **B-TREE** | `data_timestamp DESC` | Retrieval of latest nowcast run for console display. |
| `forecast_predictions`| `idx_predictions_valid_time` | **B-TREE** | `valid_time` | Timeline scrubber queries (T+0 to T+6h). |
| `alerts` | `idx_alerts_valid_window` | **B-TREE** | `valid_from, valid_to` | Active warning query filtering out expired events. |
| `audit_events` | `idx_audit_events_created`| **B-TREE** | `created_at DESC` | Compliance audit trail retrieval. |

---

## 3. Row Level Security (RLS) Matrix

| Table | Viewer / Public | Analyst | Incident Commander | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| `grid_cells` | SELECT | SELECT | SELECT | ALL |
| `forecast_snapshots` | SELECT | SELECT | SELECT | ALL |
| `forecast_predictions`| SELECT | SELECT | SELECT | ALL |
| `risk_maps` | SELECT | SELECT | SELECT | ALL |
| `alerts` | SELECT | SELECT, UPDATE (Acknowledge) | SELECT, INSERT, UPDATE (Issue Official) | ALL |
| `profiles` | SELECT (Self) | SELECT (Self), UPDATE (Self) | SELECT (Self), UPDATE (Self) | ALL |
| `audit_events` | NONE | SELECT | SELECT, INSERT | ALL |
| `data_ingestion_status`| SELECT | SELECT | SELECT | ALL |
