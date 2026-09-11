-- ============================================================================
-- Migration: 20260911000002_terrain_risk_layer.sql
-- Description: Phase 6 Terrain-Aware Flash-Flood Risk Layer
-- Tables: terrain_susceptibility_grids, basin_confinement_profiles
-- Helper: calculate_terrain_fused_risk()
-- ============================================================================

-- 1. Table: Terrain Susceptibility Grids (0.04-degree cell level)
CREATE TABLE IF NOT EXISTS public.terrain_susceptibility_grids (
    cell_id VARCHAR(32) PRIMARY KEY,
    basin_id VARCHAR(64) REFERENCES public.river_basins(basin_id) ON DELETE SET NULL,
    centroid_lat DOUBLE PRECISION NOT NULL,
    centroid_lon DOUBLE PRECISION NOT NULL,
    mean_elevation_m DOUBLE PRECISION NOT NULL,
    mean_slope_deg DOUBLE PRECISION NOT NULL,
    mean_twi DOUBLE PRECISION NOT NULL,
    terrain_susceptibility_score DOUBLE PRECISION NOT NULL CHECK (terrain_susceptibility_score >= 0.0 AND terrain_susceptibility_score <= 1.0),
    confinement_rating VARCHAR(64) NOT NULL DEFAULT 'MODERATE',
    is_convergent_valley BOOLEAN NOT NULL DEFAULT FALSE,
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial index
CREATE INDEX IF NOT EXISTS idx_terrain_grids_geom ON public.terrain_susceptibility_grids USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_terrain_grids_basin ON public.terrain_susceptibility_grids (basin_id);

-- Enable RLS
ALTER TABLE public.terrain_susceptibility_grids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to terrain susceptibility grids"
    ON public.terrain_susceptibility_grids FOR SELECT
    USING (true);

-- 2. Seed pilot terrain cells for Uttarakhand catchments
INSERT INTO public.terrain_susceptibility_grids (
    cell_id, basin_id, centroid_lat, centroid_lon, mean_elevation_m,
    mean_slope_deg, mean_twi, terrain_susceptibility_score, confinement_rating,
    is_convergent_valley, geom
) VALUES
(
    '3073_7906', 'basin_mandakini', 30.73, 79.06, 3583.0,
    46.2, 14.8, 0.885, 'EXTREME_GLACIAL_GORGE', true,
    ST_SetSRID(ST_MakeBox2D(ST_Point(79.04, 30.71), ST_Point(79.08, 30.75)), 4326)
),
(
    '3012_7824', 'basin_ganga_foothills', 30.12, 78.24, 372.0,
    38.4, 12.1, 0.640, 'FOOTHILL_RIPARIAN_TRANSITION', true,
    ST_SetSRID(ST_MakeBox2D(ST_Point(78.22, 30.10), ST_Point(78.26, 30.14)), 4326)
),
(
    '3055_7935', 'basin_alaknanda', 30.55, 79.35, 1420.0,
    36.4, 11.2, 0.780, 'DEEP_FAULTED_GORGE', true,
    ST_SetSRID(ST_MakeBox2D(ST_Point(79.33, 30.53), ST_Point(79.37, 30.57)), 4326)
),
(
    '3073_7844', 'basin_bhagirathi', 30.73, 78.44, 1150.0,
    33.2, 10.5, 0.710, 'STEEP_RIVERINE_VALLEY', false,
    ST_SetSRID(ST_MakeBox2D(ST_Point(78.42, 30.71), ST_Point(78.46, 30.75)), 4326)
)
ON CONFLICT (cell_id) DO UPDATE SET
    mean_elevation_m = EXCLUDED.mean_elevation_m,
    mean_slope_deg = EXCLUDED.mean_slope_deg,
    mean_twi = EXCLUDED.mean_twi,
    terrain_susceptibility_score = EXCLUDED.terrain_susceptibility_score;

-- 3. Stored procedure: calculate_terrain_fused_risk
CREATE OR REPLACE FUNCTION public.calculate_terrain_fused_risk(
    p_cell_id VARCHAR,
    p_cloudburst_prob DOUBLE PRECISION,
    p_thunderstorm_prob DOUBLE PRECISION
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cell RECORD;
    v_meteo_score DOUBLE PRECISION;
    v_surge_interaction DOUBLE PRECISION;
    v_fused_risk DOUBLE PRECISION;
    v_severity VARCHAR(64);
BEGIN
    SELECT * INTO v_cell FROM public.terrain_susceptibility_grids WHERE cell_id = p_cell_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Cell not found');
    END IF;

    -- Meteorological forcing (Cloudburst 75%, Thunderstorm 25%)
    v_meteo_score := LEAST(1.0, GREATEST(0.0, (0.75 * p_cloudburst) + (0.25 * p_thunderstorm)));

    -- Surge interaction term
    v_surge_interaction := POWER(v_meteo_score * v_cell.terrain_susceptibility_score, 0.8);

    -- Composite risk formulation
    v_fused_risk := LEAST(1.0, GREATEST(0.0,
        (0.40 * v_meteo_score) +
        (0.30 * v_cell.terrain_susceptibility_score) +
        (0.30 * v_surge_interaction)
    ));

    IF v_fused_risk >= 0.70 THEN
        v_severity := 'EXTREME_SURGE_WARNING';
    ELSIF v_fused_risk >= 0.45 THEN
        v_severity := 'HIGH_SURGE_WATCH';
    ELSIF v_fused_risk >= 0.20 THEN
        v_severity := 'MODERATE_MONITORING';
    ELSE
        v_severity := 'LOW';
    END IF;

    RETURN jsonb_build_object(
        'cell_id', p_cell_id,
        'flash_flood_risk_score', ROUND(v_fused_risk::numeric, 3),
        'severity', v_severity,
        'dual_factor_attribution', jsonb_build_object(
            'meteorological_forcing', ROUND(v_meteo_score::numeric, 3),
            'terrain_susceptibility', ROUND(v_cell.terrain_susceptibility_score::numeric, 3),
            'surge_interaction', ROUND(v_surge_interaction::numeric, 3),
            'slope_deg', v_cell.mean_slope_deg,
            'twi', v_cell.mean_twi
        ),
        'disclaimer', 'STATISTICAL RISK ESTIMATION — NOT DETERMINISTIC HYDROLOGICAL TRUTH',
        'deterministic_hydrology', false
    );
END;
$$;
