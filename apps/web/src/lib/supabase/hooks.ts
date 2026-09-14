"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertItem } from "../../app/alerts/AlertPanel";
import { supabase, isSupabaseConfigured } from "./client";

export function useRealtimeAlerts(initialAlerts: AlertItem[]) {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, isAcknowledged: true, status: "ACKNOWLEDGED" as const }
          : a
      )
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("alerts")
          .update({ status: "acknowledged" })
          .eq("alert_id", alertId);
      } catch (err) {
        console.warn("Failed to update alert in Supabase:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLiveConnected(false);
      return;
    }

    let isMounted = true;

    async function fetchInitialAlerts() {
      try {
        const { data, error } = await supabase!
          .from("alerts")
          .select("*")
          .order("issued_at", { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0 && isMounted) {
          const mapped: AlertItem[] = data.map((item: any) => ({
            id: item.alert_id || item.id,
            hazardType: item.hazard_type || "thunderstorm",
            severity: item.severity || "watch",
            regionName: item.region_name || item.region_code || "Pilot Catchment",
            headline: item.headline || "Severe Weather Alert",
            description: item.description || "",
            issuedAt: item.issued_at || new Date().toISOString(),
            validFrom: item.valid_from || new Date().toISOString(),
            validTo: item.valid_to || new Date().toISOString(),
            isOfficialWarning: Boolean(item.is_official_warning),
            isAcknowledged: item.status === "acknowledged" || Boolean(item.is_acknowledged),
            status: (item.status?.toUpperCase() as any) || "GENERATED",
            affectedCells: Array.isArray(item.affected_cells) ? item.affected_cells : [],
          }));
          setAlerts(mapped);
          setIsLiveConnected(true);
        }
      } catch (err) {
        console.warn("Supabase alerts fetch error:", err);
        if (isMounted) setIsLiveConnected(false);
      }
    }

    fetchInitialAlerts();

    const channel = supabase
      .channel("public:alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        (payload: any) => {
          if (!isMounted) return;
          if (payload.eventType === "INSERT") {
            const newItem = payload.new;
            const formatted: AlertItem = {
              id: newItem.alert_id || newItem.id,
              hazardType: newItem.hazard_type || "thunderstorm",
              severity: newItem.severity || "watch",
              regionName: newItem.region_name || newItem.region_code || "Pilot Catchment",
              headline: newItem.headline || "Severe Weather Alert",
              description: newItem.description || "",
              issuedAt: newItem.issued_at || new Date().toISOString(),
              validFrom: newItem.valid_from || new Date().toISOString(),
              validTo: newItem.valid_to || new Date().toISOString(),
              isOfficialWarning: Boolean(newItem.is_official_warning),
              isAcknowledged: newItem.status === "acknowledged",
              status: (newItem.status?.toUpperCase() as any) || "GENERATED",
              affectedCells: Array.isArray(newItem.affected_cells) ? newItem.affected_cells : [],
            };
            setAlerts((prev) => [formatted, ...prev.filter((a) => a.id !== formatted.id)]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new;
            setAlerts((prev) =>
              prev.map((a) =>
                a.id === (updated.alert_id || updated.id)
                  ? {
                      ...a,
                      isAcknowledged: updated.status === "acknowledged",
                      status: (updated.status?.toUpperCase() as any) || a.status,
                    }
                  : a
              )
            );
          }
        }
      )
      .subscribe((status: string) => {
        if (isMounted) {
          setIsLiveConnected(status === "SUBSCRIBED");
        }
      });

    return () => {
      isMounted = false;
      supabase!.removeChannel(channel);
    };
  }, []);

  return { alerts, isLiveConnected, acknowledgeAlert };
}
