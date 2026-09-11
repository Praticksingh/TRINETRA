-- ==============================================================================
-- TRINETRA COMPLETE DATABASE SEED DATA (PHASE 2)
-- Uttarakhand Himalayan Convective Corridor Pilot Region
-- ==============================================================================

-- 1. SEED DATA INGESTION STATUS
INSERT INTO public.data_ingestion_status (source_name, last_successful_ingest, lag_minutes, status) VALUES
('INSAT_3DR', NOW() - INTERVAL '12 minutes', 12, 'nominal'),
('IMDAA_REANALYSIS', NOW() - INTERVAL '45 minutes', 45, 'nominal'),
('DWR_RADAR', NOW() - INTERVAL '6 minutes', 6, 'nominal'),
('SRTM_DEM', NOW() - INTERVAL '30 days', 0, 'nominal'),
('SYNTHETIC_REPLAY', NOW(), 0, 'nominal')
ON CONFLICT (source_name) DO UPDATE SET
last_successful_ingest = EXCLUDED.last_successful_ingest,
lag_minutes = EXCLUDED.lag_minutes,
status = EXCLUDED.status;

-- 2. SEED GRID CELLS (Uttarakhand pilot catchments with PostGIS geometry)
INSERT INTO public.grid_cells (
    cell_id, region_code, region_name, basin_name, centroid, geom, elevation_m, slope_deg, twi, catchment_vuln_score
) VALUES
(
    '3012_7824', 'IN-UT', 'Rishikesh - Shivpuri River Gorge', 'Lower Ganga Catchment',
    ST_SetSRID(ST_MakePoint(78.267, 30.086), 4326),
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(78.24 30.06, 78.28 30.06, 78.28 30.10, 78.24 30.10, 78.24 30.06)')), 4326),
    372, 38.4, 12.1, 0.85
),
(
    '3031_7803', 'IN-UT', 'Dehradun - Rajpur Foothill', 'Song / Bindal Watershed',
    ST_SetSRID(ST_MakePoint(78.032, 30.316), 4326),
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(78.01 30.29, 78.05 30.29, 78.05 30.33, 78.01 30.33, 78.01 30.29)')), 4326),
    640, 22.5, 9.4, 0.65
),
(
    '3073_7906', 'IN-UT', 'Kedarnath - Mandakini Watershed', 'Upper Mandakini Cirque',
    ST_SetSRID(ST_MakePoint(79.066, 30.735), 4326),
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(79.04 30.71, 79.08 30.71, 79.08 30.75, 79.04 30.75, 79.04 30.71)')), 4326),
    3583, 46.2, 14.8, 0.96
),
(
    '3072_7843', 'IN-UT', 'Uttarkashi - Bhagirathi Canyon', 'Bhagirathi River Basin',
    ST_SetSRID(ST_MakePoint(78.435, 30.726), 4326),
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(78.41 30.70, 78.45 30.70, 78.45 30.74, 78.41 30.74, 78.41 30.70)')), 4326),
    1158, 34.0, 10.2, 0.74
),
(
    '3055_7935', 'IN-UT', 'Chamoli - Alaknanda Valley', 'Alaknanda Gorge Catchment',
    ST_SetSRID(ST_MakePoint(79.350, 30.558), 4326),
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(79.33 30.53, 79.37 30.53, 79.37 30.57, 79.33 30.57, 79.33 30.53)')), 4326),
    1890, 41.5, 11.7, 0.89
),
(
    '2994_7816', 'IN-UT', 'Haridwar - Upper Gangetic Plain', 'Ganga Alluvial Floodplain',
    ST_SetSRID(ST_MakePoint(78.164, 29.945), 4326),
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(78.14 29.92, 78.18 29.92, 78.18 29.96, 78.14 29.96, 78.14 29.92)')), 4326),
    250, 4.2, 6.8, 0.38
)
ON CONFLICT (cell_id) DO NOTHING;

-- 3. SEED FORECAST SNAPSHOT
INSERT INTO public.forecast_snapshots (
    forecast_id, model_version, generated_at, data_timestamp, is_synthetic_replay, region_code, summary_metrics
) VALUES (
    'fct_syn_20260911_0830',
    'v0.1.0-baseline-synthetic',
    NOW(),
    NOW() - INTERVAL '15 minutes',
    TRUE,
    'IN-UT',
    '{"max_flash_flood_prob": 0.94, "max_thunderstorm_prob": 0.88, "active_cells_count": 6, "uncertainty_index": 0.22}'::JSONB
) ON CONFLICT (forecast_id) DO NOTHING;

-- 4. SEED FORECAST PREDICTIONS (Cell level)
INSERT INTO public.forecast_predictions (
    forecast_id, cell_id, horizon_minutes, valid_time, thunderstorm_prob, cloudburst_prob, flash_flood_prob, severity, terrain_factors, xai_attribution
) VALUES
(
    'fct_syn_20260911_0830', '3073_7906', 120, NOW() + INTERVAL '2 hours',
    0.88, 0.82, 0.94, 'critical',
    '{"slope_deg": 46.2, "elevation_m": 3583, "twi": 14.8, "catchment_vuln": 0.96}'::JSONB,
    '[{"feature": "cloudburst", "label": "Extreme Convective Updraft", "contribution": 0.45, "observed_value": 120, "unit": "mm/h"}, {"feature": "slope", "label": "Severe Cirque Slope", "contribution": 0.31, "observed_value": 46.2, "unit": "°"}, {"feature": "cooling", "label": "Rapid Ice Core Ascent", "contribution": 0.24, "observed_value": -21.4, "unit": "K/hr"}]'::JSONB
),
(
    'fct_syn_20260911_0830', '3012_7824', 120, NOW() + INTERVAL '2 hours',
    0.78, 0.56, 0.82, 'warning',
    '{"slope_deg": 38.4, "elevation_m": 372, "twi": 12.1, "catchment_vuln": 0.85}'::JSONB,
    '[{"feature": "cape", "label": "Convective Instability (CAPE)", "contribution": 0.38, "observed_value": 3150, "unit": "J/kg"}, {"feature": "cooling", "label": "TIR1 Cloud Cooling Rate", "contribution": 0.28, "observed_value": -16.5, "unit": "K/hr"}, {"feature": "slope", "label": "Steep Valley Slope", "contribution": 0.22, "observed_value": 38.4, "unit": "°"}]'::JSONB
),
(
    'fct_syn_20260911_0830', '3055_7935', 120, NOW() + INTERVAL '2 hours',
    0.74, 0.68, 0.86, 'warning',
    '{"slope_deg": 41.5, "elevation_m": 1890, "twi": 11.7, "catchment_vuln": 0.89}'::JSONB,
    '[{"feature": "slope", "label": "Gorge Channeling & Slope", "contribution": 0.40, "observed_value": 41.5, "unit": "°"}, {"feature": "cooling", "label": "TIR1 Cloud Deepening", "contribution": 0.32, "observed_value": -17.8, "unit": "K/hr"}]'::JSONB
),
(
    'fct_syn_20260911_0830', '3031_7803', 120, NOW() + INTERVAL '2 hours',
    0.64, 0.32, 0.51, 'watch',
    '{"slope_deg": 22.5, "elevation_m": 640, "twi": 9.4, "catchment_vuln": 0.65}'::JSONB,
    '[{"feature": "cape", "label": "Convective Instability (CAPE)", "contribution": 0.42, "observed_value": 2650, "unit": "J/kg"}]'::JSONB
)
ON CONFLICT (forecast_id, cell_id, horizon_minutes) DO NOTHING;

-- 5. SEED ALERTS (Demonstrating auditable lifecycle)
INSERT INTO public.alerts (
    alert_id, hazard_type, severity, region_code, region_name, headline, description, status, issued_at, valid_from, valid_to, is_official_warning, affected_cells
) VALUES
(
    'alt_kedarnath_001',
    'flash_flood',
    'critical',
    'IN-UT',
    'Upper Mandakini / Kedarnath Valley',
    'FLASH FLOOD CRITICAL RISK: Rapid Cirque Inundation Likely',
    'Deep convective cloud cluster exhibiting -21.4 K/hr TIR1 cooling rate coupled with 46.2° steep slope drainage. High probability of flash flood in next 2–3 hours. (SYNTHETIC REPLAY PILOT)',
    'generated',
    NOW(),
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '5 hours',
    FALSE,
    ARRAY['3073_7906']::TEXT[]
),
(
    'alt_rishikesh_002',
    'cloudburst',
    'warning',
    'IN-UT',
    'Shivpuri-Rishikesh Ganga Corridor',
    'CLOUDBURST WARNING: Intense Convective Rainfall Band',
    'CAPE exceeding 3,150 J/kg with moisture convergence. Rainfall rates projected ≥90 mm/h. Precautionary monitoring advised along riverfront campsites. (SYNTHETIC REPLAY PILOT)',
    'generated',
    NOW(),
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '4 hours',
    FALSE,
    ARRAY['3012_7824']::TEXT[]
)
ON CONFLICT (alert_id) DO NOTHING;
