"use client";

import React from "react";
import { useSentinel } from "@/context/SentinelContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { Activity, Clock, CheckCircle2, Send, Eye, ShieldAlert } from "lucide-react";

interface ActivityItem {
  id: string;
  timestamp: string;
  status: "GENERATED" | "UNDER_REVIEW" | "DISPATCHED" | "ACKNOWLEDGED" | "RESOLVED";
  location: string;
  headline: string;
  actor: string;
}

const AUDIT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act_001",
    timestamp: "10:32 UTC (4m ago)",
    status: "GENERATED",
    location: "Upper Mandakini / Kedarnath",
    headline: "High flash flood risk (94% chance) detected by AI forecast model",
    actor: "Automated Weather Model",
  },
  {
    id: "act_002",
    timestamp: "10:25 UTC (11m ago)",
    status: "UNDER_REVIEW",
    location: "Shivpuri-Rishikesh Ganga Corridor",
    headline: "Heavy rain warning flagged for meteorologist review",
    actor: "Duty Meteorologist (SEOC Dehradun)",
  },
  {
    id: "act_003",
    timestamp: "10:10 UTC (26m ago)",
    status: "ACKNOWLEDGED",
    location: "Alaknanda Basin / Chamoli",
    headline: "Thunderstorm watch received and reviewed by District Operations Center",
    actor: "District Emergency Center (Chamoli)",
  },
  {
    id: "act_004",
    timestamp: "09:45 UTC (51m ago)",
    status: "DISPATCHED",
    location: "Upper Mandakini / Kedarnath",
    headline: "Precautionary warning dispatched to district emergency channels",
    actor: "Emergency Dispatch Automation",
  },
];

export const RecentActivityStrip: React.FC = () => {
  const { setCurrentView } = useSentinel();

  const getStatusBadge = (status: ActivityItem["status"]) => {
    switch (status) {
      case "GENERATED":
        return <Badge variant="cyan" size="xs">New alert</Badge>;
      case "UNDER_REVIEW":
        return <Badge severity="watch" size="xs">In review</Badge>;
      case "DISPATCHED":
        return <Badge severity="warning" size="xs">Dispatched</Badge>;
      case "ACKNOWLEDGED":
        return <Badge variant="emerald" size="xs">Acknowledged</Badge>;
      case "RESOLVED":
        return <Badge variant="neutral" size="xs">Resolved</Badge>;
    }
  };

  return (
    <Card variant="base">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          <CardTitle>Recent Weather Alert Updates</CardTitle>
        </div>
        <button
          onClick={() => setCurrentView("alerts")}
          className="text-xs font-sans text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          View all alerts →
        </button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-[#1E2330] text-xs font-sans">
          {AUDIT_ACTIVITIES.map((act) => (
            <div
              key={act.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 hover:bg-[#16233B]/50 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-2.5">
                {getStatusBadge(act.status)}
                <div>
                  <span className="font-semibold text-slate-100">{act.location}: </span>
                  <span className="text-slate-300">{act.headline}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
                <span className="text-slate-300 font-medium">{act.actor}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {act.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
