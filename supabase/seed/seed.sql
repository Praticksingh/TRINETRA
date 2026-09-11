-- TRINETRA Database Seed Data
-- Initial baseline seed for demo and development environments

INSERT INTO public.alerts (
    alert_id,
    hazard_type,
    severity,
    region_code,
    region_name,
    headline,
    description,
    status,
    issued_at,
    valid_from,
    valid_to,
    is_official_warning
) VALUES (
    'alt_demo_syn_001',
    'flash_flood',
    'watch',
    'IN-UT',
    'Uttarakhand Central Himalayas',
    'MODEL ADVISORY: Flash Flood Risk in 2-4 Hours',
    'Elevated convective thunderstorm activity over high-slope catchment. Model probability: 0.81 (SYNTHETIC REPLAY).',
    'generated',
    NOW(),
    NOW(),
    NOW() + INTERVAL '4 hours',
    false
) ON CONFLICT (alert_id) DO NOTHING;
