-- ============================================================================
-- Migration: 20260911000004_alert_lifecycle_and_cap.sql
-- Description: Phase 9 Alerting, Authority Lifecycle State Machine & CAP Feeds
-- Tables: authority_alert_events, alert_audit_log
-- ============================================================================

-- 1. Table: Authority Alert Events
CREATE TABLE IF NOT EXISTS public.authority_alert_events (
    alert_id VARCHAR(64) PRIMARY KEY,
    hazard_type VARCHAR(32) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'GENERATED',
    region_name VARCHAR(128) NOT NULL,
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    instruction TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    lead_time_minutes INT NOT NULL DEFAULT 120,
    peak_probability DOUBLE PRECISION NOT NULL,
    is_official_warning BOOLEAN NOT NULL DEFAULT FALSE,
    is_synthetic_replay BOOLEAN NOT NULL DEFAULT TRUE,
    boundary_geom geometry(Polygon, 4326),
    cap_xml TEXT,
    trigger_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_authority_alerts_status ON public.authority_alert_events (status);
CREATE INDEX IF NOT EXISTS idx_authority_alerts_severity ON public.authority_alert_events (severity);
CREATE INDEX IF NOT EXISTS idx_authority_alerts_issued_at ON public.authority_alert_events (issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_authority_alerts_geom ON public.authority_alert_events USING GIST (boundary_geom);

ALTER TABLE public.authority_alert_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to authority alert events"
    ON public.authority_alert_events FOR SELECT
    USING (true);

-- 2. Table: Alert Audit Log (Authority Review History)
CREATE TABLE IF NOT EXISTS public.alert_audit_log (
    audit_id SERIAL PRIMARY KEY,
    alert_id VARCHAR(64) NOT NULL REFERENCES public.authority_alert_events(alert_id) ON DELETE CASCADE,
    from_status VARCHAR(32) NOT NULL,
    to_status VARCHAR(32) NOT NULL,
    operator_id VARCHAR(64) NOT NULL,
    operator_role VARCHAR(64) NOT NULL DEFAULT 'SDMA_WATCH_OFFICER',
    remarks TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_audit_log_alert_id ON public.alert_audit_log (alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_audit_log_created_at ON public.alert_audit_log (created_at DESC);

ALTER TABLE public.alert_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to alert audit log"
    ON public.alert_audit_log FOR SELECT
    USING (true);
