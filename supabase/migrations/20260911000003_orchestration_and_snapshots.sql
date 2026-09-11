-- ============================================================================
-- Migration: 20260911000003_orchestration_and_snapshots.sql
-- Description: Phase 7 Forecast Orchestration & Snapshot Persistence
-- Tables: forecast_jobs, forecast_snapshots
-- ============================================================================

-- 1. Table: Forecast Jobs Audit Log
CREATE TABLE IF NOT EXISTS public.forecast_jobs (
    job_id VARCHAR(64) PRIMARY KEY,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    data_timestamp TIMESTAMPTZ NOT NULL,
    input_fingerprint VARCHAR(64) NOT NULL,
    source VARCHAR(64) NOT NULL DEFAULT 'radar_sat_nwp_fusion',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms DOUBLE PRECISION DEFAULT 0.0,
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecast_jobs_fingerprint ON public.forecast_jobs (input_fingerprint);
CREATE INDEX IF NOT EXISTS idx_forecast_jobs_status ON public.forecast_jobs (status);

ALTER TABLE public.forecast_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to forecast jobs"
    ON public.forecast_jobs FOR SELECT
    USING (true);

-- 2. Table: Forecast Snapshots
CREATE TABLE IF NOT EXISTS public.forecast_snapshots (
    snapshot_id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) REFERENCES public.forecast_jobs(job_id) ON DELETE SET NULL,
    data_timestamp TIMESTAMPTZ NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_synthetic_replay BOOLEAN NOT NULL DEFAULT TRUE,
    cell_count INT NOT NULL DEFAULT 0,
    model_version VARCHAR(64) NOT NULL DEFAULT 'v1.0.0-conv3d-multitask',
    geojson_data JSONB NOT NULL,
    disclaimer TEXT NOT NULL DEFAULT 'STATISTICAL RISK ESTIMATION — NOT DETERMINISTIC HYDROLOGICAL TRUTH',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_ts ON public.forecast_snapshots (generated_at DESC);

ALTER TABLE public.forecast_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to forecast snapshots"
    ON public.forecast_snapshots FOR SELECT
    USING (true);

-- Helper query: get_latest_forecast_snapshot
CREATE OR REPLACE FUNCTION public.get_latest_forecast_snapshot()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT jsonb_build_object(
        'snapshot_id', snapshot_id,
        'job_id', job_id,
        'generated_at', generated_at,
        'data_timestamp', data_timestamp,
        'is_synthetic_replay', is_synthetic_replay,
        'cell_count', cell_count,
        'geojson', geojson_data,
        'disclaimer', disclaimer
    )
    FROM public.forecast_snapshots
    ORDER BY generated_at DESC
    LIMIT 1;
$$;
