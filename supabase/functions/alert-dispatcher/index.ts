// TRINETRA Supabase Edge Function: Alert Dispatcher
// Evaluates severe weather nowcast outputs against operational thresholds and dispatches categorized alerts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const THRESHOLDS = {
  ADVISORY: 0.20,
  WATCH: 0.45,
  WARNING: 0.70,
  CRITICAL: 0.85,
};

interface ForecastEvent {
  cell_id: string;
  region_name: string;
  horizon_minutes: number;
  thunderstorm_prob: number;
  cloudburst_prob: number;
  flash_flood_prob: number;
  terrain_factors?: {
    slope_deg: number;
    twi: number;
    catchment_vuln: number;
  };
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { forecast_id, predictions }: { forecast_id: string; predictions: ForecastEvent[] } = await req.json();

    const alertsToCreate = [];

    for (const pred of predictions) {
      const maxProb = Math.max(pred.flash_flood_prob, pred.cloudburst_prob, pred.thunderstorm_prob);

      if (maxProb >= THRESHOLDS.WATCH) {
        let hazardType = "thunderstorm";
        if (pred.flash_flood_prob >= pred.cloudburst_prob && pred.flash_flood_prob >= pred.thunderstorm_prob) {
          hazardType = "flash_flood";
        } else if (pred.cloudburst_prob >= pred.thunderstorm_prob) {
          hazardType = "cloudburst";
        }

        let severity = "watch";
        if (maxProb >= THRESHOLDS.CRITICAL) {
          severity = "critical";
        } else if (maxProb >= THRESHOLDS.WARNING) {
          severity = "warning";
        }

        const validFrom = new Date();
        const validTo = new Date(validFrom.getTime() + pred.horizon_minutes * 60000);

        alertsToCreate.push({
          alert_id: `alt_${pred.cell_id}_${Date.now()}`,
          hazard_type: hazardType,
          severity,
          region_code: "IN-UT",
          region_name: pred.region_name || "Uttarakhand Catchment",
          headline: `${severity.toUpperCase()}: Elevated ${hazardType.replace("_", " ")} risk in next ${pred.horizon_minutes / 60} hours`,
          description: `Model predicted probability ${Math.round(maxProb * 100)}% over catchment cell #${pred.cell_id}. Slope: ${pred.terrain_factors?.slope_deg || "N/A"}°.`,
          status: "generated",
          valid_from: validFrom.toISOString(),
          valid_to: validTo.toISOString(),
          is_official_warning: false,
          affected_cells: [pred.cell_id],
        });
      }
    }

    if (alertsToCreate.length > 0) {
      const { data, error } = await supabaseClient
        .from("alerts")
        .insert(alertsToCreate)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify({ status: "success", created_alerts: data.length }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "nominal", message: "No cells exceeded warning thresholds" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
