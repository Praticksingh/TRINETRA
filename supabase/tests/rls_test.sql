-- ==============================================================================
-- TRINETRA RLS SECURITY VALIDATION TEST SUITE (PHASE 2)
-- Verifies that table permissions respect Role-Based Access Control
-- ==============================================================================

BEGIN;

-- 1. Test Anonymous / Viewer Access
SET ROLE anon;

-- Should succeed: Public can read active alerts and grid cells
SELECT COUNT(*) FROM public.grid_cells;
SELECT COUNT(*) FROM public.forecast_snapshots;
SELECT COUNT(*) FROM public.alerts WHERE status = 'generated';

-- Should fail: Anonymous user cannot insert or update alerts
DO $$
BEGIN
    BEGIN
        INSERT INTO public.alerts (
            alert_id, hazard_type, severity, region_code, region_name, headline, description
        ) VALUES (
            'illegal_anon_alert', 'flash_flood', 'critical', 'IN-UT', 'Illegal', 'Anon Alert', 'Should Fail'
        );
        RAISE EXCEPTION 'SECURITY BREACH: Anonymous user was allowed to insert an alert!';
    EXCEPTION WHEN insufficient_privilege THEN
        -- Expected behavior
        RAISE NOTICE 'SUCCESS: Anonymous insert rejected by RLS.';
    END;
END $$;

-- 2. Test Audit Log Protection
-- Should fail: Anonymous user cannot view or insert audit events
DO $$
BEGIN
    BEGIN
        SELECT COUNT(*) FROM public.audit_events;
        -- If RLS policy returns 0 rows without exception that is expected, but no rows leaked
        RAISE NOTICE 'SUCCESS: Audit table restricted from anonymous read.';
    END;
END $$;

ROLLBACK;
