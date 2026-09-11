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

  const getAlertStatus = (alert: AlertItem): AlertLifecycleStatus => {
    if (localStatuses[alert.id]) return localStatuses[alert.id];
    if (alert.status) return alert.status;
    return alert.isAcknowledged ? "ACKNOWLEDGED" : "GENERATED";
  };

  const handleTransition = (alertId: string, nextStatus: AlertLifecycleStatus) => {
    setLocalStatuses((prev) => ({ ...prev, [alertId]: nextStatus }));
    if (nextStatus === "ACKNOWLEDGED" && onAcknowledgeAlert) {
      onAcknowledgeAlert(alertId);
    }
    if (nextStatus === "DISPATCHED") {
      setDispatchToast(`Alert ${alertId} dispatched to SEOC Webhook & SMS Gateway (HMAC Verified)`);
      setTimeout(() => setDispatchToast(null), 4000);
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
    <div className="flex h-full flex-col rounded-lg border border-slate-800 bg-[#0c1220] shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-[#080d19]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-4 w-4 text-cyan-400" />
            {unacknowledgedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white"></span>
            )}
          </div>
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-slate-100">
            Authority Alert Feed
          </h3>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
            {filteredAlerts.length} ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Export GeoJSON Feed */}
          <button
            onClick={handleExportGeoJson}
            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1 text-[10px] font-mono text-slate-300 hover:bg-slate-700 transition"
            title="Download RFC 7946 GeoJSON Alert Feed"
          >
            <Download className="h-3 w-3 text-cyan-400" />
            <span className="hidden sm:inline">GeoJSON</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              aria-label="Close Alert Panel"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dispatch Toast Notification */}
      {dispatchToast && (
        <div className="border-b border-emerald-600/70 bg-emerald-950/90 px-4 py-1.5 text-xs font-mono text-emerald-200 backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>{dispatchToast}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">SYNTHETIC DISPATCH</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 bg-[#090e1a] px-4 py-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="h-3 w-3 text-slate-500" />
          <span>HAZARD:</span>
          <select
            value={filterHazard}
            onChange={(e) => setFilterHazard(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="all">ALL HAZARDS</option>
            <option value="flash_flood">FLASH FLOOD</option>
            <option value="cloudburst">CLOUDBURST</option>
            <option value="thunderstorm">THUNDERSTORM</option>
          </select>
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 text-[11px]">
          <input
            type="checkbox"
            checked={showAcknowledged}
            onChange={(e) => setShowAcknowledged(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
          />
          Show Acknowledged / Resolved
        </label>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono text-xs">
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
                className={`group rounded-lg border transition-all p-3.5 ${
                  currentStatus === "RESOLVED"
                    ? "border-slate-800/40 bg-slate-900/30 opacity-60"
                    : currentStatus === "ACKNOWLEDGED"
                    ? "border-emerald-800/40 bg-slate-900/50"
                    : alert.severity === "warning" || alert.severity === "critical"
                    ? "border-rose-800/70 bg-rose-950/20"
                    : "border-slate-800 bg-slate-900/80"
                }`}
              >
                {/* Badge Row: Severity, Hazard, Lifecycle Status, and Official Demarcation */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <RiskBadge severity={alert.severity} size="sm" />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {alert.hazardType.replace("_", " ")}
                    </span>
                    {/* Lifecycle Status Badge */}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold border ${
                        currentStatus === "DISPATCHED"
                          ? "bg-rose-950 text-rose-300 border-rose-700 animate-pulse"
                          : currentStatus === "UNDER_REVIEW"
                          ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                          : currentStatus === "ACKNOWLEDGED"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                          : currentStatus === "RESOLVED"
                          ? "bg-slate-800 text-slate-400 border-slate-700"
                          : "bg-amber-950 text-amber-300 border-amber-700"
                      }`}
                    >
                      {currentStatus.replace("_", " ")}
                    </span>
                  </div>

                  {alert.isOfficialWarning ? (
                    <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-300 border border-rose-700">
                      OFFICIAL WARNING
                    </span>
                  ) : (
                    <span
                      className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-mono text-amber-300/90 border border-slate-700/60"
                      title="Model-generated decision support advisory. Not an official state agency decree."
                    >
                      MODEL ADVISORY
                    </span>
                  )}
                </div>

                {/* Headline & Region */}
                <h4 className="font-medium text-slate-100 text-sm leading-snug">
                  {alert.headline}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{alert.regionName}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">
                    {alert.affectedCells.length} Catchment Cells
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {alert.description}
                </p>

                {/* Valid Time Horizon */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>
                      Valid: {alert.validFrom.slice(11, 16)} - {alert.validTo.slice(11, 16)} UTC
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* CAP XML Export */}
                    <button
                      onClick={() => handleExportCapXml(alert)}
                      className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-400 hover:bg-slate-700 border border-slate-700 transition"
                      title="Download ITU-T / OASIS CAP v1.2 XML"
                    >
                      <FileCode className="h-3 w-3" />
                      <span>CAP 1.2</span>
                    </button>

                    {onFocusRegion && (
                      <button
                        onClick={() => onFocusRegion(alert)}
                        className="inline-flex items-center gap-0.5 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 transition"
                        title="Locate Cell on Map"
                      >
                        <span>Locate</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Authority Lifecycle Action Bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 font-mono text-[10px]">
                  <span className="text-slate-500 uppercase">Workflow Action:</span>

                  <div className="flex items-center gap-1.5">
                    {currentStatus === "GENERATED" && (
                      <button
                        onClick={() => handleTransition(alert.id, "UNDER_REVIEW")}
                        className="flex items-center gap-1 rounded border border-cyan-700 bg-cyan-950/80 px-2 py-1 text-cyan-300 hover:bg-cyan-900 transition font-semibold"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Begin Review</span>
                      </button>
                    )}

                    {currentStatus === "UNDER_REVIEW" && (
                      <button
                        onClick={() => handleTransition(alert.id, "DISPATCHED")}
                        className="flex items-center gap-1 rounded border border-rose-700 bg-rose-950/80 px-2.5 py-1 text-rose-300 hover:bg-rose-900 transition font-semibold"
                      >
                        <Send className="h-3 w-3" />
                        <span>Dispatch Advisory</span>
                      </button>
                    )}

                    {currentStatus === "DISPATCHED" && (
                      <button
                        onClick={() => handleTransition(alert.id, "ACKNOWLEDGED")}
                        className="flex items-center gap-1 rounded border border-emerald-700 bg-emerald-950/80 px-2 py-1 text-emerald-300 hover:bg-emerald-900 transition font-semibold"
                      >
                        <Check className="h-3 w-3" />
                        <span>Acknowledge Watch</span>
                      </button>
                    )}

                    {currentStatus === "ACKNOWLEDGED" && (
                      <button
                        onClick={() => handleTransition(alert.id, "RESOLVED")}
                        className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 transition"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
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
