"use client";

import React, { useState, useMemo } from "react";
import { useSentinel } from "@/context/SentinelContext";
import { AlertItem, AlertLifecycleStatus } from "@/app/alerts/AlertPanel";
import { GRID_CELLS } from "@/app/forecast/ForecastMap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { Button } from "@/components/sentinel/Button";
import { AlertLifecycleBadge } from "./AlertLifecycleBadge";
import { AlertDetailDrawer } from "./AlertDetailDrawer";
import {
  Bell,
  Search,
  Filter,
  FileCode,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const AlertCenterWorkspace: React.FC = () => {
  const { alerts, updateAlertStatus, setSelectedCell, setCurrentView } = useSentinel();

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [hazardFilter, setHazardFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      // Search
      if (
        searchQuery &&
        !a.regionName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.headline.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Severity
      if (severityFilter !== "all" && a.severity !== severityFilter) {
        return false;
      }

      // Hazard
      if (hazardFilter !== "all" && a.hazardType !== hazardFilter) {
        return false;
      }

      // Status
      if (statusFilter === "active") {
        return a.status !== "RESOLVED" && a.status !== "REVOKED";
      } else if (statusFilter !== "all" && a.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [alerts, searchQuery, severityFilter, hazardFilter, statusFilter]);

  const handleFocusMap = (alert: AlertItem) => {
    const matched = GRID_CELLS.find((c) => alert.affectedCells.includes(c.cellId));
    if (matched) {
      setSelectedCell(matched);
      setCurrentView("map");
    }
  };

  const handleExportAllGeoJson = () => {
    const geojson = {
      type: "FeatureCollection",
      metadata: {
        exportedAt: new Date().toISOString(),
        count: filteredAlerts.length,
        disclaimer: "TRINETRA Model Advisory Alert Feed (RFC 7946)",
      },
      features: filteredAlerts.map((a) => ({
        type: "Feature",
        id: a.id,
        properties: {
          headline: a.headline,
          severity: a.severity,
          hazard_type: a.hazardType,
          region: a.regionName,
          status: a.status || "GENERATED",
          is_official_warning: a.isOfficialWarning,
        },
        geometry: {
          type: "Point",
          coordinates: [78.5, 30.3],
        },
      })),
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trinetra_alerts_${Date.now()}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2330] pb-4">
        <div>
          <div className="flex items-center gap-2 font-sans text-xs text-indigo-400 font-medium">
            <Bell className="h-4 w-4" />
            <span>Weather Warning Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans mt-0.5">
            Active Weather Alerts
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Track active severe weather advisories, flash flood warnings, and emergency lifecycle progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileCode className="h-3.5 w-3.5 text-indigo-400" />}
            onClick={handleExportAllGeoJson}
          >
            Export GeoJSON
          </Button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <Card variant="base">
        <CardContent className="p-3.5 space-y-3 font-sans">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location or keyword..."
                className="w-full rounded-lg border border-[#2B3142] bg-[#141722] pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-lg border border-[#2B3142] bg-[#141722] px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="watch">Watch</option>
              </select>
            </div>

            {/* Hazard Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Hazard:</span>
              <select
                value={hazardFilter}
                onChange={(e) => setHazardFilter(e.target.value)}
                className="rounded-lg border border-[#2B3142] bg-[#141722] px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">All Events</option>
                <option value="flash_flood">Flash Flood</option>
                <option value="cloudburst">Heavy Rain</option>
                <option value="thunderstorm">Thunderstorm</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-[#2B3142] bg-[#141722] px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="GENERATED">New</option>
                <option value="UNDER_REVIEW">In Review</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="ACKNOWLEDGED">Reviewed</option>
                <option value="RESOLVED">Resolved</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Table / List (Desktop Table + Mobile Cards - Rule 15 & 22) */}
      <Card variant="base">
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left font-sans text-xs text-slate-200">
              <thead className="border-b border-[#1E2330] bg-[#0E1017] text-[11px] text-slate-400 font-medium">
                <tr>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-3 py-3">Hazard</th>
                  <th className="px-4 py-3">Location & Headline</th>
                  <th className="px-3 py-3">Expected Time</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2330]">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedAlert(item)}
                      className="hover:bg-[#161A26] cursor-pointer transition-colors duration-150"
                    >
                      {/* Severity */}
                      <td className="px-4 py-3">
                        <Badge severity={item.severity} size="xs" />
                      </td>

                      {/* Hazard Type */}
                      <td className="px-3 py-3 text-xs text-slate-200 capitalize font-medium">
                        {item.hazardType === "flash_flood"
                          ? "Flash Flood"
                          : item.hazardType === "cloudburst"
                          ? "Extreme Rain"
                          : item.hazardType === "thunderstorm"
                          ? "Thunderstorm"
                          : item.hazardType.replace("_", " ")}
                      </td>

                      {/* Location & Headline */}
                      <td className="px-4 py-3 font-sans">
                        <div className="font-medium text-slate-100">{item.headline}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.regionName}
                        </div>
                      </td>

                      {/* Expected Time */}
                      <td className="px-3 py-3 font-mono text-[11px] text-slate-400">
                        {item.issuedAt.replace("T", " ").slice(0, 16)} UTC
                      </td>

                      {/* Lifecycle Status */}
                      <td className="px-3 py-3">
                        <AlertLifecycleBadge status={item.status || "GENERATED"} size="xs" />
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlert(item);
                          }}
                        >
                          View →
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-90" />
                      <div className="text-sm font-medium text-slate-200">No Active Alerts Match Criteria</div>
                      <div className="text-xs text-slate-400 mt-1">Conditions are currently below the alert threshold for this filter.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards View (Rule 22) */}
          <div className="md:hidden divide-y divide-[#1E2330]">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAlert(item)}
                  className="p-3.5 space-y-2 active:bg-[#181C28] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge severity={item.severity} size="xs" />
                      <span className="text-xs font-semibold text-slate-100">
                        {item.hazardType === "flash_flood"
                          ? "Flash Flood"
                          : item.hazardType === "cloudburst"
                          ? "Extreme Rain"
                          : "Thunderstorm"}
                      </span>
                    </div>
                    <AlertLifecycleBadge status={item.status || "GENERATED"} size="xs" />
                  </div>

                  <p className="text-xs font-medium text-slate-200">
                    {item.headline}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      <span>{item.regionName}</span>
                    </span>
                    <span className="font-mono">{item.issuedAt.slice(11, 16)} UTC</span>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                      <span>View alert details</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400">
                <ShieldCheck className="h-7 w-7 text-emerald-400 mx-auto mb-1.5" />
                <div className="text-xs font-medium text-slate-200">No Alerts</div>
                <div className="text-[11px] text-slate-400 mt-0.5">All monitored areas are currently below warning thresholds.</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Slide-over Alert Detail Drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        onTransitionStatus={(alertId, nextStatus) => {
          updateAlertStatus(alertId, nextStatus);
          if (selectedAlert) {
            setSelectedAlert({ ...selectedAlert, status: nextStatus });
          }
        }}
        onFocusMap={handleFocusMap}
      />
    </div>
  );
};
