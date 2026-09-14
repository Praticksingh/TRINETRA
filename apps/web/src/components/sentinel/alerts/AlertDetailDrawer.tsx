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
  ShieldAlert,
  ArrowRight,
  Eye,
  Archive,
  Check,
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
      setToastMessage("Dispatched to SEOC Webhook (HMAC-SHA256 Signed)");
    } else {
      setToastMessage(`Status transitioned to ${nextStatus}`);
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
  <note>TRINETRA Model Advisory. Not an official government decree.</note>
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
        status: currentStatus,
        issued_at: alert.issuedAt,
        valid_from: alert.validFrom,
        valid_to: alert.validTo,
        is_official_warning: alert.isOfficialWarning,
      },
      geometry: {
        type: "Point",
        coordinates: [78.5, 30.3],
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

  // Lifecycle steps array
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
      subtitle={`ADVISORY #${alert.id}`}
      position="right"
      width="w-full sm:w-[480px]"
    >
      <div className="space-y-4 text-xs font-sans text-slate-200">
        {/* Toast feedback */}
        {toastMessage && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 p-2.5 text-emerald-300 font-medium animate-in fade-in flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Badges & Mandatory Disclaimer */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge severity={alert.severity}>{alert.severity.toUpperCase()}</Badge>
            <AlertLifecycleBadge status={currentStatus} />
          </div>
          <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-800/60 font-sans">
            MODEL ADVISORY (NOT OFFICIAL)
          </span>
        </div>

        {/* Lifecycle Progression Visualizer */}
        <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-3 space-y-2">
          <div className="text-[10px] uppercase font-semibold text-slate-400">
            Lifecycle State Machine
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {steps.map((st, idx) => {
              const isPast = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={st} className="flex flex-col items-center">
                  <div
                    className={`h-1.5 w-full rounded-full mb-1 transition-all ${
                      isCurrent
                        ? "bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                        : isPast
                        ? "bg-emerald-500"
                        : "bg-slate-800"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-sans truncate w-full font-medium ${
                      isCurrent
                        ? "text-[#38BDF8] font-semibold"
                        : isPast
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative & Details */}
        <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B] p-3.5 space-y-2.5 font-sans">
          <h3 className="text-sm font-semibold text-slate-100">{alert.headline}</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{alert.description}</p>

          <div className="pt-2 border-t border-[#1E2D4A]/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>
              <span>Valid From:</span>
              <div className="text-slate-200 font-semibold font-mono text-[11px]">{alert.validFrom.replace("T", " ").slice(0, 16)} UTC</div>
            </div>
            <div>
              <span>Valid To:</span>
              <div className="text-slate-200 font-semibold font-mono text-[11px]">{alert.validTo.replace("T", " ").slice(0, 16)} UTC</div>
            </div>
          </div>
        </div>

        {/* Primary Action Button based on status */}
        <div className="space-y-2 font-sans">
          {currentStatus === "GENERATED" && (
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<Eye className="h-4 w-4" />}
              onClick={handleAdvanceLifecycle}
            >
              Assign For Duty Review (Advance to Under Review)
            </Button>
          )}

          {currentStatus === "UNDER_REVIEW" && (
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<Send className="h-4 w-4" />}
              onClick={handleAdvanceLifecycle}
            >
              Dispatch to SEOC & DEOC Webhook (Advance to Dispatched)
            </Button>
          )}

          {currentStatus === "DISPATCHED" && (
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              onClick={handleAdvanceLifecycle}
            >
              Record Local DEOC Acknowledgment
            </Button>
          )}

          {currentStatus === "ACKNOWLEDGED" && (
            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<Archive className="h-4 w-4" />}
              onClick={handleAdvanceLifecycle}
            >
              Resolve & Archive Event
            </Button>
          )}

          {currentStatus === "RESOLVED" && (
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-2.5 text-center text-slate-400 text-xs font-sans">
              ✓ This advisory has been formally resolved and archived.
            </div>
          )}
        </div>

        {/* Secondary Actions: Map Focus, CAP XML, GeoJSON */}
        <div className="grid grid-cols-2 gap-2 font-sans">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<MapPin className="h-3.5 w-3.5 text-[#38BDF8]" />}
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
            leftIcon={<FileCode className="h-3.5 w-3.5 text-[#38BDF8]" />}
            onClick={handleExportGeoJson}
            className="col-span-2"
          >
            Export GeoJSON (RFC 7946)
          </Button>
        </div>

        {/* Audit Log Record */}
        <div className="rounded-lg border border-[#1E2D4A] bg-[#16233B]/60 p-3 space-y-1.5 text-xs font-sans text-slate-400">
          <div className="font-semibold text-slate-200 uppercase text-[10px] tracking-wider">Provenance Audit Record</div>
          <div>Issued At: <span className="font-mono text-slate-300">{alert.issuedAt}</span></div>
          <div>Trigger Engine: Spatiotemporal Conv3D (Multitask v1.0.0)</div>
          <div>Authority Status: Model Advisory (Duty Operator Verification Required)</div>
        </div>
      </div>
    </Drawer>
  );
};
