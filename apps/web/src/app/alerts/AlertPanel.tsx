import React, { useState } from "react";
import { AlertCircle, Bell, Check, Clock, Filter, MapPin, X, ChevronRight, ShieldAlert } from "lucide-react";
import RiskBadge, { SeverityLevel } from "../components/RiskBadge";

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

  const filteredAlerts = alerts.filter((item) => {
    if (!showAcknowledged && item.isAcknowledged) return false;
    if (filterHazard !== "all" && item.hazardType !== filterHazard) return false;
    return true;
  });

  const unacknowledgedCount = alerts.filter((a) => !a.isAcknowledged).length;

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800 bg-[#0c1220] shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-4 w-4 text-cyan-400" />
            {unacknowledgedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white"></span>
            )}
          </div>
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-slate-100">
            Categorized Alert Feed
          </h3>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
            {filteredAlerts.length} ACTIVE
          </span>
        </div>

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

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 bg-[#090e1a] px-4 py-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="h-3 w-3 text-slate-500" />
          <span>HAZARD:</span>
          <select
            value={filterHazard}
            onChange={(e) => setFilterHazard(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
          />
          Show Acknowledged
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
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`group rounded-lg border transition-all p-3.5 ${
                alert.isAcknowledged
                  ? "border-slate-800/60 bg-slate-900/40 opacity-75"
                  : alert.severity === "warning" || alert.severity === "critical"
                  ? "border-rose-800/70 bg-rose-950/20"
                  : "border-slate-800 bg-slate-900/80"
              }`}
            >
              {/* Badge Row & Official Demarcation */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <RiskBadge severity={alert.severity} size="sm" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {alert.hazardType.replace("_", " ")}
                  </span>
                </div>

                {alert.isOfficialWarning ? (
                  <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-300 border border-rose-700">
                    OFFICIAL WARNING
                  </span>
                ) : (
                  <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-mono text-amber-300/90 border border-slate-700/60" title="Model-generated decision support alert. Not an official state agency decree.">
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

                <div className="flex items-center gap-2">
                  {onFocusRegion && (
                    <button
                      onClick={() => onFocusRegion(alert)}
                      className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-cyan-300 hover:bg-slate-700 transition"
                    >
                      <span>Locate</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}

                  {!alert.isAcknowledged && onAcknowledgeAlert && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="inline-flex items-center gap-1 rounded border border-emerald-700/60 bg-emerald-950/60 px-2 py-1 text-[11px] text-emerald-300 hover:bg-emerald-900/80 transition"
                    >
                      <Check className="h-3 w-3" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
