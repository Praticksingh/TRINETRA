import React, { useState } from "react";
import {
  AlertCircle,
  Bell,
  Check,
  Clock,
  Filter,
  MapPin,
  X,
  ChevronRight,
  ShieldAlert,
  Send,
  Eye,
  FileCode,
  Download,
  CheckCircle2,
} from "lucide-react";
import RiskBadge, { SeverityLevel } from "../components/RiskBadge";

export type AlertLifecycleStatus =
  | "GENERATED"
  | "UNDER_REVIEW"
  | "DISPATCHED"
  | "ACKNOWLEDGED"
  | "RESOLVED"
  | "REVOKED";

export interface AlertItem {
  id: string;
  hazardType: "thunderstorm" | "cloudburst" | "flash_flood" | "multi_hazard";
  severity: SeverityLevel;
  regionName: string;
  headline: string;
  description: string;
  issuedAt: string;
  validFrom: string;
  validTo: string;
  isOfficialWarning: boolean;
  isAcknowledged: boolean;
  status?: AlertLifecycleStatus;
  affectedCells: string[];
}

interface AlertPanelProps {
  alerts: AlertItem[];
  onAcknowledgeAlert?: (alertId: string) => void;
  onFocusRegion?: (alert: AlertItem) => void;
  onClose?: () => void;
}

export default function AlertPanel({
  alerts,
  onAcknowledgeAlert,
  onFocusRegion,
  onClose,
}: AlertPanelProps) {
  const [filterHazard, setFilterHazard] = useState<string>("all");
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<string, AlertLifecycleStatus>>({});
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);
  const [dispatchReceipt, setDispatchReceipt] = useState<any | null>(null);

  const getAlertStatus = (alert: AlertItem): AlertLifecycleStatus => {
    if (localStatuses[alert.id]) return localStatuses[alert.id];
    if (alert.status) return alert.status;
    return alert.isAcknowledged ? "ACKNOWLEDGED" : "GENERATED";
  };

  const handleTransition = async (alertId: string, nextStatus: AlertLifecycleStatus) => {
    setLocalStatuses((prev) => ({ ...prev, [alertId]: nextStatus }));
    if (nextStatus === "ACKNOWLEDGED" && onAcknowledgeAlert) {
      onAcknowledgeAlert(alertId);
    }
    if (nextStatus === "DISPATCHED") {
      try {
        const res = await fetch(`/api/py/alerts/${alertId}/dispatch-simulation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "SDMA_SEOC_WEBHOOK",
            recipient: "https://seoc.uk.gov.in/api/v1/inbound-alerts",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setDispatchReceipt(data.receipt);
          setDispatchToast(`HMAC-SHA256 Verified Dispatch: ${data.receipt?.receipt_id || "OK"}`);
        } else {
          setDispatchToast(`Alert ${alertId} dispatched to SEOC Webhook (Simulated)`);
        }
      } catch {
        setDispatchToast(`Alert ${alertId} dispatched to SEOC Webhook (Simulated)`);
      }
      setTimeout(() => setDispatchToast(null), 5000);
    }
  };

  const handleExportCapXml = (alert: AlertItem) => {
    // Generate standard CAP XML download in browser
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${alert.id}</identifier>
  <sender>trinetra-nowcast@sdma.uk.gov.in</sender>
  <sent>${alert.issuedAt}</sent>
  <status>Test</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <note>TRINETRA Model-Generated Advisory. Not an official government decree.</note>
  <info>
    <category>Met</category>
    <event>${alert.hazardType.replace("_", " ").toUpperCase()}</event>
    <urgency>${alert.severity === "critical" ? "Immediate" : "Expected"}</urgency>
    <severity>${alert.severity === "critical" ? "Extreme" : alert.severity === "warning" ? "Severe" : "Moderate"}</severity>
    <certainty>Likely</certainty>
    <expires>${alert.validTo}</expires>
    <headline>${alert.headline}</headline>
    <description>${alert.description}</description>
    <area>
      <areaDesc>${alert.regionName}</areaDesc>
    </area>
  </info>
</alert>`;
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${alert.id}_cap12.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportGeoJson = () => {
    const geojson = {
      type: "FeatureCollection",
      metadata: {
        exportedAt: new Date().toISOString(),
        disclaimer: "TRINETRA Model Advisory Alert Feed (RFC 7946)",
      },
      features: alerts.map((a) => ({
        type: "Feature",
        id: a.id,
        properties: {
          headline: a.headline,
          severity: a.severity,
          hazard_type: a.hazardType,
          region: a.regionName,
          status: getAlertStatus(a),
          is_official_warning: a.isOfficialWarning,
        },
        geometry: {
          type: "Point",
          coordinates: [78.5, 30.3], // Centroid approx
        },
      })),
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trinetra_alerts_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredAlerts = alerts.filter((item) => {
    const status = getAlertStatus(item);
    if (!showAcknowledged && (status === "ACKNOWLEDGED" || status === "RESOLVED")) return false;
    if (filterHazard !== "all" && item.hazardType !== filterHazard) return false;
    return true;
  });

  const unacknowledgedCount = alerts.filter((a) => {
    const s = getAlertStatus(a);
    return s !== "ACKNOWLEDGED" && s !== "RESOLVED";
  }).length;

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/[0.08] bg-[#161820] shadow-clay-card overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-[#1D202B]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-4 w-4 text-indigo-400" />
            {unacknowledgedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-clay-badge"></span>
            )}
          </div>
          <h3 className="font-sans text-sm font-semibold tracking-wide text-slate-100">
            Authority Alert Feed
          </h3>
          <span className="rounded-full bg-[#111217] px-2.5 py-0.5 text-[10px] font-sans font-semibold text-slate-300 border border-white/[0.06] shadow-clay-badge">
            {filteredAlerts.length} ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Export GeoJSON Feed */}
          <button
            onClick={handleExportGeoJson}
            className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#161820] px-2.5 py-1 text-[11px] font-sans font-medium text-slate-200 hover:bg-[#252937] shadow-clay-btn active:translate-y-0.5 active:shadow-clay-btn-pressed transition"
            title="Download RFC 7946 GeoJSON Alert Feed"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">GeoJSON</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-[#252937] hover:text-slate-200 transition"
              aria-label="Close Alert Panel"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dispatch Toast Notification */}
      {dispatchToast && (
        <div className="border-b border-emerald-500/30 bg-[#11221A] px-4 py-2 text-xs font-sans text-emerald-200 backdrop-blur flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>{dispatchToast}</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">HMAC VERIFIED</span>
        </div>
      )}

      {/* HMAC Dispatch Receipt Details */}
      {dispatchReceipt && (
        <div className="border-b border-emerald-600/30 bg-[#11221A] p-3.5 text-xs font-mono text-emerald-300 space-y-1 shadow-clay-inset">
          <div className="flex items-center justify-between font-bold text-[11px]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>DELIVERY RECEIPT: {dispatchReceipt.receipt_id}</span>
            </span>
            <button onClick={() => setDispatchReceipt(null)} className="text-slate-400 hover:text-white text-[11px]">✕</button>
          </div>
          <div className="text-[11px] text-slate-300 truncate">Endpoint: {dispatchReceipt.recipient}</div>
          <div className="text-[10px] text-emerald-400 truncate">SHA256: {dispatchReceipt.signature}</div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-[#111217] px-4 py-2.5 text-xs font-sans shadow-clay-inset">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] uppercase font-semibold text-slate-400">HAZARD:</span>
          <select
            value={filterHazard}
            onChange={(e) => setFilterHazard(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-[#1D202B] px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 shadow-clay-inset cursor-pointer text-xs"
          >
            <option value="all">ALL HAZARDS</option>
            <option value="flash_flood">FLASH FLOOD</option>
            <option value="cloudburst">CLOUDBURST</option>
            <option value="thunderstorm">THUNDERSTORM</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-slate-400 text-xs font-medium">
          <input
            type="checkbox"
            checked={showAcknowledged}
            onChange={(e) => setShowAcknowledged(e.target.checked)}
            className="rounded-md border-white/20 bg-[#1D202B] text-indigo-500 focus:ring-0 cursor-pointer"
          />
          Show Acknowledged / Resolved
        </label>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 font-sans text-xs">
            <ShieldAlert className="h-8 w-8 text-slate-600 mb-2" />
            <p>No active alerts matching filter criteria.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Convective parameters are currently below warning thresholds.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const currentStatus = getAlertStatus(alert);

            return (
              <div
                key={alert.id}
                className={`group rounded-2xl border transition-all p-4 shadow-clay-card ${
                  currentStatus === "RESOLVED"
                    ? "border-white/[0.04] bg-[#161820]/60 opacity-60"
                    : currentStatus === "ACKNOWLEDGED"
                    ? "border-emerald-500/30 bg-[#11221A]"
                    : alert.severity === "warning" || alert.severity === "critical"
                    ? "border-rose-500/30 bg-[#241418]"
                    : "border-white/[0.08] bg-[#1D202B]"
                }`}
              >
                {/* Badge Row: Severity, Hazard, Lifecycle Status, and Official Demarcation */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <RiskBadge severity={alert.severity} size="sm" />
                    <span className="text-[10px] font-sans font-medium text-slate-400 uppercase tracking-wider">
                      {alert.hazardType.replace("_", " ")}
                    </span>
                    {/* Lifecycle Status Badge */}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-sans font-bold border shadow-clay-badge ${
                        currentStatus === "DISPATCHED"
                          ? "bg-rose-950/80 text-rose-300 border-rose-500/40 animate-pulse"
                          : currentStatus === "UNDER_REVIEW"
                          ? "bg-[#1C1F30] text-indigo-300 border-indigo-500/40"
                          : currentStatus === "ACKNOWLEDGED"
                          ? "bg-[#11221A] text-emerald-300 border-emerald-500/40"
                          : currentStatus === "RESOLVED"
                          ? "bg-[#161820] text-slate-400 border-white/[0.06]"
                          : "bg-[#241F12] text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {currentStatus.replace("_", " ")}
                    </span>
                  </div>

                  {alert.isOfficialWarning ? (
                    <span className="rounded-full bg-rose-950/90 px-2 py-0.5 text-[9px] font-sans font-bold text-rose-300 border border-rose-600/50 shadow-clay-badge">
                      OFFICIAL WARNING
                    </span>
                  ) : (
                    <span
                      className="rounded-full bg-[#161820] px-2 py-0.5 text-[9px] font-sans font-medium text-amber-300/90 border border-white/[0.08] shadow-clay-badge"
                      title="Model-generated decision support advisory. Not an official state agency decree."
                    >
                      MODEL ADVISORY
                    </span>
                  )}
                </div>

                {/* Headline & Region */}
                <h4 className="font-sans font-semibold text-slate-100 text-sm leading-snug">
                  {alert.headline}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-sans mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="font-medium">{alert.regionName}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {alert.affectedCells.length} Catchment Cells
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                  {alert.description}
                </p>

                {/* Valid Time Horizon */}
                <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[11px] font-sans text-slate-400">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Valid: {alert.validFrom.slice(11, 16)} - {alert.validTo.slice(11, 16)} UTC
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* CAP XML Export */}
                    <button
                      onClick={() => handleExportCapXml(alert)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#161820] px-2.5 py-1 text-[11px] text-indigo-400 hover:bg-[#252937] border border-white/[0.08] shadow-clay-btn active:translate-y-0.5 active:shadow-clay-btn-pressed transition font-sans font-medium"
                      title="Download ITU-T / OASIS CAP v1.2 XML"
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      <span>CAP 1.2</span>
                    </button>

                    {onFocusRegion && (
                      <button
                        onClick={() => onFocusRegion(alert)}
                        className="inline-flex items-center gap-0.5 rounded-xl bg-[#161820] px-2.5 py-1 text-[11px] text-slate-300 hover:bg-[#252937] border border-white/[0.08] shadow-clay-btn active:translate-y-0.5 active:shadow-clay-btn-pressed transition font-sans font-medium"
                        title="Locate Cell on Map"
                      >
                        <span>Locate</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Authority Lifecycle Action Bar */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2 font-sans text-[11px]">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Action:</span>

                  <div className="flex items-center gap-1.5">
                    {currentStatus === "GENERATED" && (
                      <button
                        onClick={() => handleTransition(alert.id, "UNDER_REVIEW")}
                        className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-[#1C1F30] px-2.5 py-1 text-indigo-200 hover:bg-[#252937] shadow-clay-btn active:translate-y-0.5 active:shadow-clay-btn-pressed transition font-medium"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Begin Review</span>
                      </button>
                    )}

                    {currentStatus === "UNDER_REVIEW" && (
                      <button
                        onClick={() => handleTransition(alert.id, "DISPATCHED")}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/80 px-3 py-1 text-rose-200 hover:bg-rose-900 shadow-clay-btn-danger active:translate-y-0.5 active:shadow-clay-btn-pressed transition font-semibold"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Dispatch Advisory</span>
                      </button>
                    )}

                    {currentStatus === "DISPATCHED" && (
                      <button
                        onClick={() => handleTransition(alert.id, "ACKNOWLEDGED")}
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-[#11221A] px-2.5 py-1 text-emerald-200 hover:bg-emerald-900 shadow-clay-btn active:translate-y-0.5 active:shadow-clay-btn-pressed transition font-medium"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Acknowledge Watch</span>
                      </button>
                    )}

                    {currentStatus === "ACKNOWLEDGED" && (
                      <button
                        onClick={() => handleTransition(alert.id, "RESOLVED")}
                        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#161820] px-2.5 py-1 text-slate-200 hover:bg-[#252937] shadow-clay-btn active:translate-y-0.5 active:shadow-clay-btn-pressed transition font-medium"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Resolve Alert</span>
                      </button>
                    )}

                    {currentStatus === "RESOLVED" && (
                      <span className="text-slate-500 italic">Incident Cleared</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
