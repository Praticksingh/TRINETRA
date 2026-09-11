-- TRINETRA Initial Database Schema & PostGIS Setup
-- Prepares database structure for Phase 2 Supabase Backend Foundation

-- Enable geospatial and cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Profiles & Roles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    organization TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'analyst', 'incident_commander', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Spatial Grid Cells Table
CREATE TABLE IF NOT EXISTS public.grid_cells (
    cell_id TEXT PRIMARY KEY,
    region_code TEXT NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    elevation_m NUMERIC,
    slope_deg NUMERIC,
    twi NUMERIC,
    catchment_vuln_score NUMERIC CHECK (catchment_vuln_score BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grid_cells_geom ON public.grid_cells USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_grid_cells_centroid ON public.grid_cells USING GIST (centroid);

-- 3. Forecast Snapshots Table
CREATE TABLE IF NOT EXISTS public.forecast_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_id TEXT UNIQUE NOT NULL,
    model_version TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL,
    data_timestamp TIMESTAMPTZ NOT NULL,
    is_synthetic_replay BOOLEAN NOT NULL DEFAULT FALSE,
    region_code TEXT NOT NULL,
    summary_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_data_time ON public.forecast_snapshots (data_timestamp DESC);

-- 4. Alerts Table
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts (status);
CREATE INDEX IF NOT EXISTS idx_alerts_valid_window ON public.alerts (valid_from, valid_to);

-- 5. Audit Events Table
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    actor_id UUID REFERENCES public.profiles(id),
    target_resource TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_created ON public.audit_events (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grid_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Initial Read-Only Policies for Authenticated & Anonymous Users (public monitoring views)
CREATE POLICY "Public can view grid cells" ON public.grid_cells FOR SELECT USING (true);
CREATE POLICY "Public can view forecasts" ON public.forecast_snapshots FOR SELECT USING (true);
CREATE POLICY "Public can view active alerts" ON public.alerts FOR SELECT USING (true);
