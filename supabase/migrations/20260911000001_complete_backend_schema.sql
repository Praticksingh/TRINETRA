-- ==============================================================================
-- TRINETRA COMPLETE BACKEND SCHEMA & GEOSPATIAL POSTGIS FOUNDATION (PHASE 2)
-- Authoritative schema supporting 2-6 hour convective nowcasting & alert lifecycle
-- ==============================================================================

-- Enable geospatial and cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ------------------------------------------------------------------------------
-- 1. PROFILES & ROLES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    organization TEXT NOT NULL DEFAULT 'Disaster Management Authority',
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'analyst', 'incident_commander', 'admin')),
    phone_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. SPATIAL GRID CELLS TABLE (0.04° Resolution ~4km)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grid_cells (
    cell_id TEXT PRIMARY KEY,
    region_code TEXT NOT NULL,
    region_name TEXT NOT NULL,
    basin_name TEXT,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    elevation_m NUMERIC NOT NULL,
    slope_deg NUMERIC NOT NULL,
    twi NUMERIC NOT NULL, -- Topographic Wetness Index
    catchment_vuln_score NUMERIC NOT NULL CHECK (catchment_vuln_score BETWEEN 0 AND 1),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grid_cells_geom ON public.grid_cells USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_grid_cells_centroid ON public.grid_cells USING GIST (centroid);
CREATE INDEX IF NOT EXISTS idx_grid_cells_region ON public.grid_cells (region_code);

-- ------------------------------------------------------------------------------
-- 3. OBSERVATIONS TABLE (Satellite, Atmospheric & Radar Inputs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name TEXT NOT NULL CHECK (source_name IN ('INSAT_3DR', 'IMDAA_REANALYSIS', 'DWR_RADAR', 'SRTM_DEM', 'SYNTHETIC_REPLAY')),
    observation_timestamp TIMESTAMPTZ NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quality_flag TEXT NOT NULL DEFAULT 'nominal' CHECK (quality_flag IN ('nominal', 'degraded', 'interpolated', 'missing_channels')),
    bounds_bbox GEOMETRY(Polygon, 4326),
    variables_metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    raw_storage_uri TEXT
);

CREATE INDEX IF NOT EXISTS idx_observations_timestamp ON public.observations (observation_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_observations_source ON public.observations (source_name);

-- ------------------------------------------------------------------------------
-- 4. FORECAST SNAPSHOTS TABLE (Run-level Master Records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forecast_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_id TEXT UNIQUE NOT NULL,
    model_version TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_timestamp TIMESTAMPTZ NOT NULL,
    is_synthetic_replay BOOLEAN NOT NULL DEFAULT FALSE,
    region_code TEXT NOT NULL,
    summary_metrics JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_data_time ON public.forecast_snapshots (data_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_forecast_id ON public.forecast_snapshots (forecast_id);

-- ------------------------------------------------------------------------------
-- 5. FORECAST PREDICTIONS TABLE (Cell-level Probabilities & XAI)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forecast_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_id TEXT NOT NULL REFERENCES public.forecast_snapshots(forecast_id) ON DELETE CASCADE,
    cell_id TEXT NOT NULL REFERENCES public.grid_cells(cell_id),
    horizon_minutes INT NOT NULL CHECK (horizon_minutes BETWEEN 0 AND 360),
    valid_time TIMESTAMPTZ NOT NULL,
    thunderstorm_prob NUMERIC NOT NULL CHECK (thunderstorm_prob BETWEEN 0 AND 1),
    cloudburst_prob NUMERIC NOT NULL CHECK (cloudburst_prob BETWEEN 0 AND 1),
    flash_flood_prob NUMERIC NOT NULL CHECK (flash_flood_prob BETWEEN 0 AND 1),
    severity TEXT NOT NULL CHECK (severity IN ('none', 'advisory', 'watch', 'warning', 'critical')),
    terrain_factors JSONB NOT NULL DEFAULT '{}'::JSONB,
    xai_attribution JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(forecast_id, cell_id, horizon_minutes)
);

CREATE INDEX IF NOT EXISTS idx_predictions_forecast_cell ON public.forecast_predictions (forecast_id, cell_id);
CREATE INDEX IF NOT EXISTS idx_predictions_valid_time ON public.forecast_predictions (valid_time);
CREATE INDEX IF NOT EXISTS idx_predictions_severity ON public.forecast_predictions (severity);

-- ------------------------------------------------------------------------------
-- 6. RISK MAPS TABLE (Polygonal Hazard Contours for Vector Tiles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.risk_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_id TEXT NOT NULL REFERENCES public.forecast_snapshots(forecast_id) ON DELETE CASCADE,
    hazard_type TEXT NOT NULL CHECK (hazard_type IN ('thunderstorm', 'cloudburst', 'flash_flood')),
    severity TEXT NOT NULL CHECK (severity IN ('advisory', 'watch', 'warning', 'critical')),
    horizon_minutes INT NOT NULL,
    valid_time TIMESTAMPTZ NOT NULL,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    area_sq_km NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_maps_geom ON public.risk_maps USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_risk_maps_forecast_valid ON public.risk_maps (forecast_id, valid_time);

-- ------------------------------------------------------------------------------
-- 7. CATEGORIZED ALERTS TABLE (Lifecycle & Governance)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id TEXT UNIQUE NOT NULL,
    hazard_type TEXT NOT NULL CHECK (hazard_type IN ('thunderstorm', 'cloudburst', 'flash_flood', 'multi_hazard')),
    severity TEXT NOT NULL CHECK (severity IN ('advisory', 'watch', 'warning', 'critical')),
    region_code TEXT NOT NULL,
    region_name TEXT NOT NULL,
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'reviewed', 'issued', 'acknowledged', 'resolved', 'expired')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    is_official_warning BOOLEAN NOT NULL DEFAULT FALSE,
    affected_cells TEXT[] DEFAULT ARRAY[]::TEXT[],
    acknowledged_by UUID REFERENCES public.profiles(id),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts (status);
CREATE INDEX IF NOT EXISTS idx_alerts_valid_window ON public.alerts (valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts (severity);

-- ------------------------------------------------------------------------------
-- 8. MODEL RUNS TABLE (ML Lineage, Latency & Auditability)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.model_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id TEXT UNIQUE NOT NULL,
    model_version TEXT NOT NULL,
    architecture_type TEXT NOT NULL DEFAULT 'Spatiotemporal Multi-Task (ConvLSTM)',
    execution_latency_ms INT NOT NULL,
    feature_schema_version TEXT NOT NULL DEFAULT 'v1.0.0',
    input_records_count INT NOT NULL,
    is_synthetic_run BOOLEAN NOT NULL DEFAULT FALSE,
    host_environment JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_runs_created ON public.model_runs (created_at DESC);

-- ------------------------------------------------------------------------------
-- 9. DATA INGESTION STATUS TABLE (Telemetry & Freshness Heartbeat)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_ingestion_status (
    source_name TEXT PRIMARY KEY,
    last_successful_ingest TIMESTAMPTZ NOT NULL,
    lag_minutes INT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('nominal', 'degraded', 'offline')),
    last_error_message TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. AUDIT EVENTS TABLE (Immutable Operations Log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL, -- e.g. ALERT_ACKNOWLEDGED, OFFICIAL_WARNING_ISSUED, THRESHOLD_MODIFIED
    actor_id UUID REFERENCES public.profiles(id),
    actor_email TEXT,
    target_resource TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    action_details JSONB DEFAULT '{}'::JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_created ON public.audit_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource ON public.audit_events (target_resource, resource_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grid_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_ingestion_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Helper function: Get authenticated user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Public Read Policies for Geospatial & Nowcast Monitoring
CREATE POLICY "Anyone can view grid cells" ON public.grid_cells FOR SELECT USING (true);
CREATE POLICY "Anyone can view forecast snapshots" ON public.forecast_snapshots FOR SELECT USING (true);
CREATE POLICY "Anyone can view forecast predictions" ON public.forecast_predictions FOR SELECT USING (true);
CREATE POLICY "Anyone can view risk maps" ON public.risk_maps FOR SELECT USING (true);
CREATE POLICY "Anyone can view active alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Anyone can view ingestion status" ON public.data_ingestion_status FOR SELECT USING (true);

-- 3. Alert Workflow Permissions
CREATE POLICY "Analysts and Commanders can acknowledge alerts" ON public.alerts
    FOR UPDATE
    USING (public.get_user_role() IN ('analyst', 'incident_commander', 'admin'))
    WITH CHECK (public.get_user_role() IN ('analyst', 'incident_commander', 'admin'));

CREATE POLICY "Incident Commanders can insert official alerts" ON public.alerts
    FOR INSERT
    WITH CHECK (public.get_user_role() IN ('incident_commander', 'admin'));

-- 4. Audit Trail Permissions (Append-only)
CREATE POLICY "Authenticated users can view relevant audit events" ON public.audit_events
    FOR SELECT USING (public.get_user_role() IN ('analyst', 'incident_commander', 'admin'));

CREATE POLICY "Authorized system actions insert audit events" ON public.audit_events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR public.get_user_role() IS NOT NULL);

-- ==============================================================================
-- POSTGIS SPATIAL QUERY HELPER FUNCTIONS
-- ==============================================================================

-- Function to find all grid cells within an area of interest exceeding a hazard probability
CREATE OR REPLACE FUNCTION public.get_high_risk_cells_in_area(
    area_polygon GEOMETRY,
    hazard_column TEXT,
    min_probability NUMERIC
)
RETURNS TABLE (
    cell_id TEXT,
    region_name TEXT,
    probability NUMERIC,
    slope_deg NUMERIC,
    elevation_m NUMERIC
) AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT g.cell_id, g.region_name, p.%I, g.slope_deg, g.elevation_m
         FROM public.grid_cells g
         JOIN public.forecast_predictions p ON g.cell_id = p.cell_id
         WHERE ST_Intersects(g.geom, $1) AND p.%I >= $2
         ORDER BY p.%I DESC',
        hazard_column, hazard_column, hazard_column
    ) USING area_polygon, min_probability;
END;
$$ LANGUAGE plpgsql STABLE;
