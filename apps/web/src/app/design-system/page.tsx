"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  Tooltip,
  Drawer,
  StatusDot,
} from "@/components/sentinel";
import { sentinelTokens } from "@/styles/tokens";
import {
  ArrowLeft,
  Shield,
  Layers,
  Activity,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Compass,
  Sliders,
  Eye,
} from "lucide-react";

export default function DesignSystemShowcase() {
  const [activeTab, setActiveTab] = useState("buttons");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const toggleLoading = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F3350] pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1F3350] bg-[#142235] text-slate-300 hover:text-[#36D9E8] hover:border-[#36D9E8]/50 transition-colors"
              title="Return to Sentinel Console"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#36D9E8] uppercase tracking-wider">
                  TRINETRA SENTINEL
                </span>
                <span className="rounded bg-[#0F3847] px-2 py-0.5 text-[10px] font-mono text-[#36D9E8] border border-[#36D9E8]/40">
                  DESIGN SYSTEM v1.0
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-100 mt-1 font-sans">
                Visual Foundation & Reusable Primitives
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/legacy">
              <Button variant="ghost" size="sm">
                View Pre-Redesign Baseline →
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Eye className="h-3.5 w-3.5" />}
              onClick={() => setIsDrawerOpen(true)}
            >
              Test Drawer Primitive
            </Button>
          </div>
        </div>

        {/* 1. Core Color & Visual Tokens Palette */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-200 uppercase font-mono tracking-wider">
              1. Master Tokens & Color Semantics
            </h2>
            <span className="text-xs font-mono text-[#91A5BB]">
              Strict Separation: Cyan = Telemetry, Amber/Red = Risk Only
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
            {/* App Background */}
            <div className="rounded-lg border border-[#1F3350] bg-[#0B1220] p-3 shadow">
              <div className="h-10 rounded bg-[#0B1220] border border-[#1F3350] mb-2" />
              <div className="font-bold text-slate-200">#0B1220</div>
              <div className="text-[10px] text-[#91A5BB]">App Background</div>
            </div>

            {/* Slate Surface Panel */}
            <div className="rounded-lg border border-[#1F3350] bg-[#142235] p-3 shadow">
              <div className="h-10 rounded bg-[#142235] border border-[#1F3350] mb-2" />
              <div className="font-bold text-slate-200">#142235</div>
              <div className="text-[10px] text-[#91A5BB]">Slate Panel Surface</div>
            </div>

            {/* Elevated Panel */}
            <div className="rounded-lg border border-[#2B476F] bg-[#1B2C44] p-3 shadow">
              <div className="h-10 rounded bg-[#1B2C44] border border-[#2B476F] mb-2" />
              <div className="font-bold text-slate-200">#1B2C44</div>
              <div className="text-[10px] text-[#91A5BB]">Elevated Surface</div>
            </div>

            {/* Interactive Cyan */}
            <div className="rounded-lg border border-[#36D9E8]/40 bg-[#0F3847] p-3 shadow">
              <div className="h-10 rounded bg-[#36D9E8] mb-2" />
              <div className="font-bold text-[#36D9E8]">#36D9E8</div>
              <div className="text-[10px] text-[#91A5BB]">Interactive Cyan</div>
            </div>

            {/* Low Risk */}
            <div className="rounded-lg border border-emerald-700/60 bg-emerald-950/40 p-3 shadow">
              <div className="h-10 rounded bg-emerald-600 mb-2" />
              <div className="font-bold text-emerald-300">● Low (Green)</div>
              <div className="text-[10px] text-emerald-400/80">Nominal Severity</div>
            </div>

            {/* Critical Risk */}
            <div className="rounded-lg border border-red-700/60 bg-red-950/60 p-3 shadow">
              <div className="h-10 rounded bg-red-600 mb-2" />
              <div className="font-bold text-red-300">▲ Critical (Red)</div>
              <div className="text-[10px] text-red-400/80">Immediate Surge</div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Primitives Showcase */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-200 uppercase font-mono tracking-wider">
            2. Component Primitives Showcase
          </h2>

          <Tabs value={activeTab} onValueChange={setActiveTab} variant="segmented">
            <TabList className="mb-6">
              <TabTrigger value="buttons">Buttons & Controls</TabTrigger>
              <TabTrigger value="badges">Badges & Shape Cues</TabTrigger>
              <TabTrigger value="cards">Card System</TabTrigger>
              <TabTrigger value="status">Status & Telemetry Dots</TabTrigger>
              <TabTrigger value="tooltips">Tooltips & Popovers</TabTrigger>
            </TabList>

            {/* TAB: BUTTONS */}
            <TabContent value="buttons" className="space-y-6">
              <Card variant="base">
                <CardHeader>
                  <CardTitle>Button Variants & States</CardTitle>
                  <CardDescription>
                    Standardized button variants with keyboard focus rings and loading spinners.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" onClick={toggleLoading} isLoading={buttonLoading}>
                      Primary Action
                    </Button>
                    <Button variant="secondary">Secondary Action</Button>
                    <Button variant="outline">Outline Cyan</Button>
                    <Button variant="active">Active State</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="danger">Destructive / Revoke</Button>
                  </div>

                  <div className="pt-4 border-t border-[#1F3350]/80">
                    <div className="text-xs font-mono text-[#91A5BB] mb-2 uppercase">
                      Size Hierarchy (xs, sm, md, lg)
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="xs" variant="secondary">Size XS (24px)</Button>
                      <Button size="sm" variant="secondary">Size SM (28px)</Button>
                      <Button size="md" variant="secondary">Size MD (36px)</Button>
                      <Button size="lg" variant="primary">Size LG (44px)</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabContent>

            {/* TAB: BADGES & SHAPE CUES */}
            <TabContent value="badges" className="space-y-6">
              <Card variant="base">
                <CardHeader>
                  <CardTitle>Accessible Risk Badges & Shape Indicators</CardTitle>
                  <CardDescription>
                    Strict non-color-dependent visual cues: ● Circle (Low), ◆ Diamond (Watch), ▲ Triangle (Warning), ▲ Pulse (Critical).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-xs font-mono text-[#91A5BB] mb-2 uppercase">
                      Hazard Severity Badges (With geometric shape cues)
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge severity="none">LOW / NOMINAL</Badge>
                      <Badge severity="watch">WATCH</Badge>
                      <Badge severity="warning">WARNING</Badge>
                      <Badge severity="critical" pulse>CRITICAL SURGE</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1F3350]/80">
                    <div className="text-xs font-mono text-[#91A5BB] mb-2 uppercase">
                      Operational Metadata & Provenance Badges
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="cyan">MODEL ADVISORY</Badge>
                      <Badge variant="purple">SYNTHETIC REPLAY</Badge>
                      <Badge variant="emerald">POSTGIS LIVE</Badge>
                      <Badge variant="neutral">CONV3D MULTITASK</Badge>
                      <Badge variant="outline">HURDLE CLEARED</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabContent>

            {/* TAB: CARDS */}
            <TabContent value="cards" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="base">
                  <CardHeader>
                    <CardTitle>Base Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Default slate surface panel for routine telemetry cards and operational lists.
                    </p>
                  </CardContent>
                  <CardFooter>Status: Synchronized</CardFooter>
                </Card>

                <Card variant="elevated" borderAccent="cyan">
                  <CardHeader>
                    <CardTitle>Elevated Cyan Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Higher z-depth surface with cyan accent bar for active focus areas.
                    </p>
                  </CardContent>
                  <CardFooter>Telemetry: Live</CardFooter>
                </Card>

                <Card variant="interactive" borderAccent="critical">
                  <CardHeader>
                    <CardTitle>Interactive Risk Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Hover border highlight for selectable hazard zones or priority alerts.
                    </p>
                  </CardContent>
                  <CardFooter className="text-red-400 font-bold">Priority: P1 Critical</CardFooter>
                </Card>
              </div>
            </TabContent>

            {/* TAB: STATUS DOTS */}
            <TabContent value="status" className="space-y-6">
              <Card variant="base">
                <CardHeader>
                  <CardTitle>Data Freshness & Provenance Status Dots</CardTitle>
                  <CardDescription>
                    Heartbeats and latency states indicating telemetry health.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-3">
                      <StatusDot status="nominal" label="NOMINAL (INSAT)" />
                      <div className="text-[10px] text-[#91A5BB] mt-1">Satellite feed lag: 12 min</div>
                    </div>
                    <div className="rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-3">
                      <StatusDot status="delayed" label="DELAYED (NWP)" />
                      <div className="text-[10px] text-[#91A5BB] mt-1">Reanalysis lag: 48 min</div>
                    </div>
                    <div className="rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-3">
                      <StatusDot status="stale" label="STALE FEED" />
                      <div className="text-[10px] text-[#91A5BB] mt-1">Feed age exceeds 60m</div>
                    </div>
                    <div className="rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-3">
                      <StatusDot status="degraded" label="RUNOFF DEGRADED" />
                      <div className="text-[10px] text-[#91A5BB] mt-1">Missing soil probe fallback</div>
                    </div>
                    <div className="rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-3">
                      <StatusDot status="offline" label="OFFLINE" pulse={false} />
                      <div className="text-[10px] text-[#91A5BB] mt-1">DWR Radar offline</div>
                    </div>
                    <div className="rounded-lg border border-[#1F3350] bg-[#0F1A2A] p-3">
                      <StatusDot status="replay" label="SYNTHETIC REPLAY" />
                      <div className="text-[10px] text-[#91A5BB] mt-1">Historical test benchmark</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabContent>

            {/* TAB: TOOLTIPS */}
            <TabContent value="tooltips" className="space-y-6">
              <Card variant="base">
                <CardHeader>
                  <CardTitle>Technical Explainers & Accessible Tooltips</CardTitle>
                  <CardDescription>
                    Contextual explanation of meteorological and machine-learning acronyms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <Tooltip
                      subtitle="CONVECTIVE METRIC"
                      content="Convective Available Potential Energy (CAPE) measures atmospheric buoyancy in J/kg. Values >2500 indicate severe thunderstorm potential."
                    >
                      <Button variant="secondary" size="sm">Hover for CAPE Explainer</Button>
                    </Tooltip>

                    <Tooltip
                      subtitle="TOPOGRAPHIC METRIC"
                      content="Topographic Wetness Index (TWI) calculates steady-state moisture accumulation based on upstream catchment area and local slope."
                    >
                      <Button variant="secondary" size="sm">Hover for TWI Explainer</Button>
                    </Tooltip>

                    <Tooltip
                      subtitle="EVALUATION METRIC"
                      content="Precision-Recall Area Under Curve (PR-AUC) evaluates performance on highly imbalanced severe weather events without false alarm inflation."
                    >
                      <Button variant="secondary" size="sm">Hover for PR-AUC Explainer</Button>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </TabContent>
          </Tabs>
        </section>

        {/* Demo Drawer Component */}
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Sentinel Drawer Primitive"
          subtitle="Keyboard Accessible (Press ESC to close)"
          position="right"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded border border-[#1F3350] bg-[#0F1A2A] p-3">
              <span className="text-[#36D9E8] font-mono font-bold">DRAWER FUNCTIONALITY</span>
              <p className="text-slate-300 mt-1">
                This slide-over drawer will house the Right-Side Risk Inspector, Alert Center details, and Advanced Layer Controls in subsequent phases.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-mono text-[#91A5BB]">KEYBOARD INTERACTIONS</div>
              <ul className="list-disc pl-4 text-slate-300 space-y-1">
                <li>Press <strong>Escape</strong> to close anywhere</li>
                <li>Click outside backdrop to dismiss</li>
                <li>Full scroll containment for high-density tabular data</li>
              </ul>
            </div>

            <div className="pt-4">
              <Button variant="primary" className="w-full" onClick={() => setIsDrawerOpen(false)}>
                Confirm & Dismiss
              </Button>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
