// TRINETRA Supabase Edge Function: Health & Observability Check

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Verify DB query response
    const { data: dbData, error: dbError } = await supabaseClient
      .from("data_ingestion_status")
      .select("source_name, status")
      .limit(5);

    if (dbError) throw dbError;

    // 2. Check Python Inference microservice health if configured
    const mlUrl = Deno.env.get("ML_INFERENCE_SERVICE_URL") || "http://localhost:8000";
    let mlStatus = "unreachable";
    try {
      const mlRes = await fetch(`${mlUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (mlRes.ok) mlStatus = "nominal";
    } catch {
      mlStatus = "standby_or_mock";
    }

    const latencyMs = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        status: "healthy",
        database: "connected",
        database_latency_ms: latencyMs,
        ingestion_feeds_monitored: dbData?.length || 0,
        ml_inference_service: mlStatus,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "degraded",
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
