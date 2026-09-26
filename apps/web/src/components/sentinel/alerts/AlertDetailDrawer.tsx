"use client";

import React, { useState } from "react";
import { AlertItem, AlertLifecycleStatus } from "@/app/alerts/AlertPanel";
import { Drawer } from "@/components/sentinel/Drawer";
import { Badge } from "@/components/sentinel/Badge";
import { Button } from "@/components/sentinel/Button";
import { AlertLifecycleBadge } from "./AlertLifecycleBadge";
import {
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Download,
  FileCode,
  Eye,
  Archive,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
} from "lucide-react";

export interface AlertDetailDrawerProps {
  alert: AlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTransitionStatus: (alertId: string, nextStatus: AlertLifecycleStatus) => void;
  onFocusMap: (alert: AlertItem) => void;
}

export const AlertDetailDrawer: React.FC<AlertDetailDrawerProps> = ({
  alert,
  isOpen,
  onClose,
  onTransitionStatus,
  onFocusMap,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  if (!alert) return null;

  const currentStatus: AlertLifecycleStatus = alert.status || "GENERATED";

  const handleAdvanceLifecycle = () => {
    let nextStatus: AlertLifecycleStatus = "UNDER_REVIEW";
    if (currentStatus === "GENERATED") nextStatus = "UNDER_REVIEW";
    else if (currentStatus === "UNDER_REVIEW") nextStatus = "DISPATCHED";
    else if (currentStatus === "DISPATCHED") nextStatus = "ACKNOWLEDGED";
    else if (currentStatus === "ACKNOWLEDGED") nextStatus = "RESOLVED";

    onTransitionStatus(alert.id, nextStatus);

    if (nextStatus === "DISPATCHED") {
      setToastMessage("Dispatched to Emergency Operations Center");
    } else {
      setToastMessage(`Status updated to ${nextStatus}`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCap = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${alert.id}</identifier>
  <sender>trinetra-nowcast@sdma.uk.gov.in</sender>
  <sent>${alert.issuedAt}</sent>
  <status>Test</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <note>TRINETRA Model Advisory. Meteorological Early Warning.</note>
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportGeoJson = () => {
    const geojson = {
      type: "Feature",
      id: alert.id,
      properties: {
        headline: alert.headline,
        severity: alert.severity,
        hazard_type: alert.hazardType,
        region: alert.regionName,
        status: alert.status,
      },
      geometry: {
        type: "Point",
        coordinates: [79.066, 30.735],
      },
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${alert.id}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const steps: AlertLifecycleStatus[] = [
    "GENERATED",
    "UNDER_REVIEW",
    "DISPATCHED",
    "ACKNOWLEDGED",
    "RESOLVED",
  ];
  const currentStepIdx = steps.indexOf(currentStatus);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={alert.regionName}
      subtitle={`Alert #${alert.id}`}
      position="right"
      width="w-full sm:w-[480px]"
    >
      <div className="space-y-4 text-xs font-sans text-slate-200">
        {/* Toast feedback */}
        {toastMessage && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-emerald-300 font-medium animate-in fade-in flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge severity={alert.severity} size="sm" />
            <AlertLifecycleBadge status={currentStatus} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            ID: {alert.id}
          </span>
        </div>

        {/* Status Lifecycle Stepper */}
        <div className="rounded-lg border border-[#232736] bg-[#141722] p-3 space-y-2">
          <div className="text-[10px] font-medium text-slate-400">
            Emergency Lifecycle Status
          </div>
          <div className="grid grid-cols-5 gap-1 text-center">
            {steps.map((st, idx) => {
              const isPast = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              const label =
                st === "GENERATED"
                  ? "New"
                  : st === "UNDER_REVIEW"
                  ? "Reviewing"
                  : st === "DISPATCHED"
                  ? "Sent"
                  : st === "ACKNOWLEDGED"
                  ? "Acknowledged"
                  : "Resolved";

              return (
                <div key={st} className="flex flex-col items-center">
                  <div
                    className={`h-1.5 w-full rounded-full mb-1 transition-all ${
                      isCurrent
                        ? "bg-indigo-500"
                        : isPast
                        ? "bg-emerald-500"
                        : "bg-[#0E1017]"
                    }`}
                  />
                  <span
                    className={`text-[9px] truncate w-full ${
                      isCurrent
                        ? "text-indigo-300 font-medium"
                        : isPast
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= SECTION 16: STRICT ALERT DETAIL HIERARCHY ================= */}
        <div className="rounded-lg border border-[#232736] bg-[#141722] p-4 space-y-3 font-sans">
          {/* WHAT */}
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              What
            </div>
            <div className="text-sm font-semibold text-white mt-0.5">
              {alert.headline}
            </div>
          </div>

          {/* WHERE */}
          <div className="pt-2 border-t border-[#1E2330]">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Where
            </div>
            <div className="text-xs font-medium text-slate-200 mt-0.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>{alert.regionName}, Uttarakhand</span>
            </div>
          </div>

          {/* WHEN */}
          <div className="pt-2 border-t border-[#1E2330]">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              When
            </div>
            <div className="text-xs font-mono text-slate-200 mt-0.5 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{alert.validFrom.replace("T", " ").slice(11, 16)} – {alert.validTo.replace("T", " ").slice(11, 16)} UTC (Active window)</span>
            </div>
          </div>

          {/* RISK */}
          <div className="pt-2 border-t border-[#1E2330]">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Risk Level
            </div>
            <div className="mt-1">
              <Badge severity={alert.severity} size="sm" />
            </div>
          </div>

          {/* WHY */}
          <div className="pt-2 border-t border-[#1E2330]">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Why
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              {alert.description}
            </p>
          </div>

          {/* WHAT TO WATCH */}
          <div className="pt-2 border-t border-[#1E2330]">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              What to Watch
            </div>
            <ul className="text-xs text-slate-300 mt-1 space-y-1 list-disc list-inside">
              <li>Rainfall intensity over mountain slopes (&gt; 30 mm/h)</li>
              <li>Rapid river and stream water level increase</li>
              <li>Lightning activity and convective storm cell growth</li>
            </ul>
          </div>

          {/* TECHNICAL DETAILS (Collapsed by default - Rule 16) */}
          <div className="pt-2 border-t border-[#1E2330]">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center justify-between w-full text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <span>{showTechnicalDetails ? "Hide technical evidence" : "Show technical evidence & model metadata"}</span>
              {showTechnicalDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showTechnicalDetails && (
              <div className="mt-2.5 rounded bg-[#0E1017] p-2.5 border border-[#1E2330] text-[11px] text-slate-400 space-y-1.5 animate-in fade-in duration-150">
                <div>Model: <span className="text-slate-200">TRINETRA Spatiotemporal Neural Nowcaster</span></div>
                <div>Hazard Category: <span className="font-mono text-slate-200">{alert.hazardType}</span></div>
                <div>Issued: <span className="font-mono text-slate-200">{alert.issuedAt}</span></div>
                <div>Affected Grid Sectors: <span className="font-mono text-slate-200">{alert.affectedCells?.join(", ") || "Mandakini-1"}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Lifecycle Action Buttons */}
        <div className="space-y-2 font-sans">
          {currentStatus === "GENERATED" && (
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<Eye className="h-4 w-4" />}
              onClick={handleAdvanceLifecycle}
            >
              Begin Duty Review (Mark In Review)
            </Button>
          )}

          {currentStatus === "UNDER_REVIEW" && (
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<Send className="h-4 w-4" />}
              onClick={handleAdvanceLifecycle}
            >
              Dispatch Advisory to Emergency Center
            </Button>
          )}

          {currentStatus === "DISPATCHED" && (
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              onClick={handleAdvanceLifecycle}
            >
              Confirm Receipt by District Operations
            </Button>
          )}

          {currentStatus === "ACKNOWLEDGED" && (
            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<Archive className="h-4 w-4" />}
              onClick={handleAdvanceLifecycle}
            >
              Mark Resolved & Archive Alert
            </Button>
          )}

          {currentStatus === "RESOLVED" && (
            <div className="rounded-lg border border-[#232736] bg-[#141722] p-2.5 text-center text-slate-400 text-xs">
              ✓ Alert marked resolved and archived in system audit log.
            </div>
          )}
        </div>

        {/* Secondary Utility Actions */}
        <div className="grid grid-cols-2 gap-2 font-sans">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<MapPin className="h-3.5 w-3.5 text-indigo-400" />}
            onClick={() => {
              onFocusMap(alert);
              onClose();
            }}
          >
            Locate on Map
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5 text-emerald-400" />}
            onClick={handleExportCap}
          >
            Export CAP XML
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileCode className="h-3.5 w-3.5 text-indigo-400" />}
            onClick={handleExportGeoJson}
            className="col-span-2"
          >
            Export GeoJSON
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
