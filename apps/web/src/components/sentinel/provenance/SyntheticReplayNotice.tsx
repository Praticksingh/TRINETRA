"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/sentinel/Card";
import { Badge } from "@/components/sentinel/Badge";
import { History, AlertTriangle, Shield, CheckCircle2, PlayCircle } from "lucide-react";

export const SyntheticReplayNotice: React.FC = () => {
  return (
    <Card variant="base">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-amber-400" />
            <CardTitle className="font-sans text-sm font-semibold">Historical Data & Simulation Notice</CardTitle>
          </div>
          <Badge severity="warning" size="sm">
            HISTORICAL SCENARIO DATA
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 font-sans text-xs text-slate-300">
        <p className="leading-relaxed">
          This system is currently demonstrating forecast capabilities using a <strong>verified historical weather dataset</strong> (Monsoon 2025 Test Split). This allows realistic evaluation of the AI forecasting model against recorded mountain weather events.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.08] bg-[#1D202B] p-3 space-y-1 shadow-clay-card">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Historical Scenario</span>
            <div className="text-slate-200 font-semibold font-sans">Monsoon 2025 Test Cycle (Jul 1 – Sep 30)</div>
            <span className="text-[10px] text-emerald-400 font-medium">Independent test data</span>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#1D202B] p-3 space-y-1 shadow-clay-card">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Public Alert Safety Lock</span>
            <div className="text-amber-400 font-semibold font-sans">DEMO / EVALUATION MODE</div>
            <span className="text-[10px] text-slate-400">Public sirens and emergency SMS are disconnected</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-[#241F12] p-3 text-xs text-amber-200 flex items-start gap-2.5 font-sans shadow-clay-card">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-100 font-semibold">System Notice:</strong> Connecting this system to live real-time emergency dispatch requires active API keys for ISRO MOSDAC direct satellite feeds and IMD radar feeds.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
