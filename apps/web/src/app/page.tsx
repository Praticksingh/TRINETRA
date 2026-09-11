import React from "react";
import { ShieldCheck, Activity, Database, Cpu, Terminal, Radio, AlertTriangle } from "lucide-react";

export default function Phase0ConsolePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#090d16] text-slate-200">
      {/* Top Operations Header */}
      <header className="border-b border-slate-800 bg-[#0d1424]/80 px-6 py-3.5 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 font-mono font-bold text-sm">
              T3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-slate-100 tracking-wide text-sm sm:text-base">
                  TRINETRA NOWCASTING
                </h1>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-400 border border-cyan-800/60">
                  PHASE 0 : CONSTITUTION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hyper-Local Severe Weather Decision-Support Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 rounded border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM READINESS: PASS
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6">
        {/* Banner */}
        <div className="rounded-lg border border-slate-800 bg-[#0e1629] p-5 shadow-lg">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Phase 0 Constitution & Architecture Guardrails Active
              </h2>
              <p className="text-sm text-slate-400 max-w-3xl mt-1 leading-relaxed">
                Project guardrails, architectural boundaries, data contracts, and non-negotiable engineering rules have been initialized. All subsequent phases will proceed under the strict Senior Review Protocol.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded bg-slate-900 border border-slate-700/60 px-3 py-1.5 font-mono text-xs text-cyan-300">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              v0.1.0-baseline
            </div>
          </div>
        </div>

        {/* Verification Matrix Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card 1: Authority Backend */}
          <div className="rounded-lg border border-slate-800 bg-[#0d1424] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-2">
                <Database className="h-4 w-4" />
                BACKEND & STORAGE
              </div>
              <h3 className="text-base font-medium text-slate-200">Supabase + PostGIS</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                PostgreSQL system-of-record with PostGIS spatial indexing for grid cells and real-time WebSocket alert dispatching. RLS policies active.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Schema: 20260911000000</span>
              <span className="text-emerald-400">Prepared</span>
            </div>
          </div>

          {/* Card 2: ML Inference Engine */}
          <div className="rounded-lg border border-slate-800 bg-[#0d1424] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-2">
                <Cpu className="h-4 w-4" />
                SCIENTIFIC INFERENCE
              </div>
              <h3 className="text-base font-medium text-slate-200">Python 3.11 + FastAPI</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Stateless inference container handling spatiotemporal tensor formatting, DEM terrain susceptibility calculations, and XAI factor attribution.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Endpoint: /api/v1/nowcast</span>
              <span className="text-emerald-400">Verified</span>
            </div>
          </div>

          {/* Card 3: Safety Guardrails */}
          <div className="rounded-lg border border-slate-800 bg-[#0d1424] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-2">
                <ShieldCheck className="h-4 w-4" />
                SECURITY & AUDIT
              </div>
              <h3 className="text-base font-medium text-slate-200">Zero Secret Leakage</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Monorepo gitignore excludes all environment files, rasters, and model checkpoints. Replay data strictly labeled with synthetic flags.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Status: Clean</span>
              <span className="text-emerald-400">Pass</span>
            </div>
          </div>
        </div>

        {/* Hazard Target Specification */}
        <div className="rounded-lg border border-slate-800 bg-[#0d1424] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 font-mono">
            Target Hazard Coverage & Actionable Horizons
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">Severe Thunderstorm</span>
                <span className="text-[10px] font-mono rounded bg-amber-950/60 text-amber-400 px-1.5 py-0.5 border border-amber-800/40">
                  2 - 6 Hours
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Predicts severe convection accompanied by lightning, wind gusts $\ge 50$ km/h, and hail cores using satellite IR cooling and CAPE.
              </p>
            </div>

            <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">Cloudburst Event</span>
                <span className="text-[10px] font-mono rounded bg-orange-950/60 text-orange-400 px-1.5 py-0.5 border border-orange-800/40">
                  2 - 6 Hours
                </span>
              </div>
              <p className="text-xs text-slate-400">
                High-probability detection for extreme localized rainfall intensity ($\ge 100$ mm/h) over steep Himalayan river catchments.
              </p>
            </div>

            <div className="rounded border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">Flash Flood Risk</span>
                <span className="text-[10px] font-mono rounded bg-rose-950/60 text-rose-400 px-1.5 py-0.5 border border-rose-800/40">
                  2 - 6 Hours
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Coupled meteorological probability and DEM-derived terrain susceptibility (slope gradient, TWI, flow accumulation channels).
              </p>
            </div>
          </div>
        </div>

        {/* Phase Progress Roadmap */}
        <div className="rounded-lg border border-slate-800 bg-[#0d1424] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Phased Implementation Tracker
            </h3>
            <span className="text-xs font-mono text-cyan-400">Phase 0 of 12 Complete</span>
          </div>

          <div className="space-y-2">
            {[
              { phase: "Phase 0", title: "Project Constitution & Guardrails", status: "COMPLETED", active: true },
              { phase: "Phase 1", title: "UX Foundation & Storytelling Shell", status: "NEXT", active: false },
              { phase: "Phase 2", title: "Supabase Backend Foundation", status: "PENDING", active: false },
              { phase: "Phase 3", title: "Data Ingestion & Normalization Layer", status: "PENDING", active: false },
              { phase: "Phase 4", title: "Baseline Forecast Engine", status: "PENDING", active: false },
              { phase: "Phase 5", title: "Spatiotemporal Multi-Task AI Model", status: "PENDING", active: false },
              { phase: "Phase 6", title: "Terrain-Aware Flash-Flood Risk Layer", status: "PENDING", active: false },
              { phase: "Phase 7", title: "Real-Time Inference & Forecast Orchestration", status: "PENDING", active: false },
              { phase: "Phase 8", title: "GIS Dashboard & Explainable AI", status: "PENDING", active: false },
              { phase: "Phase 9", title: "Alerting & Authority Workflow", status: "PENDING", active: false },
              { phase: "Phase 10", title: "Security, Reliability & Production Hardening", status: "PENDING", active: false },
              { phase: "Phase 11", title: "Deployment, Observability & Demo Readiness", status: "PENDING", active: false },
              { phase: "Phase 12", title: "Senior Full-Stack Review Loop & Final Release", status: "PENDING", active: false },
            ].map((p, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded px-3 py-2 text-xs font-mono transition-colors ${
                  p.active
                    ? "border border-cyan-800/60 bg-cyan-950/30 text-cyan-200"
                    : p.status === "NEXT"
                    ? "border border-slate-700 bg-slate-800/40 text-slate-200"
                    : "border border-transparent bg-slate-900/30 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-400">{p.phase}</span>
                  <span className={p.active ? "text-slate-100 font-sans" : "text-slate-300 font-sans"}>
                    {p.title}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    p.active
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50"
                      : p.status === "NEXT"
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-800/50"
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
