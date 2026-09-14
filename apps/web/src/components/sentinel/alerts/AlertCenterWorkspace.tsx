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
  Download,
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
    a.download = `trinetra_alerts_all_${Date.now()}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F3350] pb-4">
        <div>
          <div className="flex items-center gap-2 font-sans text-xs text-sky-400 font-semibold uppercase tracking-wider">
            <Bell className="h-4 w-4" />
            <span>Alerts & Incident Queue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans mt-1">
            Active Alerts & Weather Advisories
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Review, dispatch, and track convective storm advisories across catchment zones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileCode className="h-3.5 w-3.5 text-sky-400" />}
            onClick={handleExportAllGeoJson}
          >
            Export All GeoJSON
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
                placeholder="Search by river basin, district, or headline..."
                className="w-full rounded-lg border border-[#1E2D4A] bg-[#16233B] pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-400 font-sans"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 font-sans text-xs text-slate-400">
              <span className="font-medium">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-lg border border-[#1E2D4A] bg-[#16233B] px-2 py-1 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical Only (▲)</option>
                <option value="warning">Warning Only (▲)</option>
                <option value="watch">Watch Only (◆)</option>
              </select>
            </div>

            {/* Hazard Filter */}
            <div className="flex items-center gap-1 font-sans text-xs text-slate-400">
              <span className="font-medium">Hazard:</span>
              <select
                value={hazardFilter}
                onChange={(e) => setHazardFilter(e.target.value)}
                className="rounded-lg border border-[#1E2D4A] bg-[#16233B] px-2 py-1 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">All Hazards</option>
                <option value="flash_flood">Flash Flood</option>
                <option value="cloudburst">Cloudburst</option>
                <option value="thunderstorm">Thunderstorm</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 font-sans text-xs text-slate-400">
              <span className="font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-[#1E2D4A] bg-[#16233B] px-2 py-1 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="active">Active Unresolved</option>
                <option value="GENERATED">Generated</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="RESOLVED">Resolved</option>
                <option value="all">All States</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Table */}
      <Card variant="base">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs text-slate-200">
              <thead className="border-b border-[#1E2D4A] bg-[#111A2C] text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Lifecycle State</th>
                  <th className="px-3 py-3">Severity</th>
                  <th className="px-4 py-3">Location & Headline</th>
                  <th className="px-3 py-3">Hazard Type</th>
                  <th className="px-3 py-3">Issued Time</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D4A]/60">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedAlert(item)}
                      className="hover:bg-[#16233B]/60 cursor-pointer transition-colors duration-150"
                    >
                      {/* Lifecycle Status */}
                      <td className="px-4 py-3">
                        <AlertLifecycleBadge status={item.status || "GENERATED"} size="xs" />
                      </td>

                      {/* Severity with shape cue */}
                      <td className="px-3 py-3">
                        <Badge severity={item.severity} size="xs">
                          {item.severity.toUpperCase()}
                        </Badge>
                      </td>

                      {/* Location & Headline */}
                      <td className="px-4 py-3 font-sans">
                        <div className="font-semibold text-slate-100">{item.headline}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.regionName} • ID: <span className="font-mono">{item.id}</span>
                        </div>
                      </td>

                      {/* Hazard Type */}
                      <td className="px-3 py-3 text-xs text-slate-300 capitalize">
                        {item.hazardType.replace("_", " ")}
                      </td>

                      {/* Issued Time */}
                      <td className="px-3 py-3 font-mono text-[11px] text-slate-400">
                        {item.issuedAt.replace("T", " ").slice(0, 16)} UTC
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
                          Review & Action →
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-90" />
                      <div className="text-sm font-semibold text-slate-200">No Advisories Match Filters</div>
                      <div className="text-xs text-slate-400 mt-1">All monitored catchment sectors are nominal under the current criteria.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
