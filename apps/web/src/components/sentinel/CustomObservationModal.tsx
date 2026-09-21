"use client";

import React, { useState } from "react";
import { useSentinel } from "@/context/SentinelContext";
import {
  X,
  FileCode,
  Play,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";

const SAMPLE_PAYLOAD = {
  observation_timestamp: new Date().toISOString(),
  insat: {
    observation_timestamp: new Date().toISOString(),
    tir1_bt_k: [
      [285.0, 278.0, 260.0, 245.0],
      [275.0, 252.0, 228.0, 218.0],
      [260.0, 235.0, 198.5, 212.0],
      [250.0, 220.0, 210.0, 225.0],
    ],
    tir2_bt_k: [
      [283.5, 276.2, 257.8, 242.5],
      [273.2, 249.5, 225.1, 215.3],
      [258.0, 232.4, 202.1, 209.4],
      [247.5, 217.8, 207.5, 222.0],
    ],
    wv_bt_k: [
      [245.0, 242.0, 236.0, 230.0],
      [240.0, 232.0, 222.0, 218.0],
      [235.0, 224.0, 212.0, 215.0],
      [232.0, 220.0, 214.0, 220.0],
    ],
    cooling_rate_k_hr: [
      [-2.5, -6.0, -10.5, -14.2],
      [-5.0, -11.4, -18.2, -19.5],
      [-8.2, -16.5, -21.4, -18.0],
      [-6.5, -14.0, -17.5, -12.0],
    ],
  },
  imdaa: {
    observation_timestamp: new Date().toISOString(),
    cape_j_kg: [
      [1850.0, 2200.0, 2650.0, 2900.0],
      [2100.0, 2650.0, 3150.0, 3400.0],
      [2400.0, 2950.0, 3850.0, 3600.0],
      [2200.0, 2750.0, 3300.0, 3100.0],
    ],
    cin_j_kg: [
      [-85.0, -60.0, -45.0, -30.0],
      [-65.0, -40.0, -25.0, -15.0],
      [-40.0, -20.0, -10.0, -15.0],
      [-50.0, -35.0, -20.0, -25.0],
    ],
    tpw_mm: [
      [38.0, 42.0, 46.0, 50.0],
      [42.0, 48.0, 54.0, 58.0],
      [46.0, 52.0, 64.2, 60.0],
      [40.0, 45.0, 55.0, 52.0],
    ],
    omega_500_hpa: [
      [-0.4, -0.6, -0.9, -1.1],
      [-0.5, -0.8, -1.2, -1.5],
      [-0.7, -1.1, -1.8, -1.6],
      [-0.6, -0.9, -1.3, -1.2],
    ],
  },
  dem: {
    elevation_m: [
      [250.0, 372.0, 640.0, 1158.0],
      [372.0, 640.0, 1890.0, 2600.0],
      [640.0, 1158.0, 2600.0, 3583.0],
      [1158.0, 1890.0, 3583.0, 4200.0],
    ],
    slope_deg: [
      [4.2, 12.5, 22.5, 34.0],
      [12.5, 22.5, 38.4, 41.5],
      [22.5, 34.0, 41.5, 46.2],
      [34.0, 38.4, 46.2, 52.0],
    ],
    twi: [
      [6.8, 8.2, 9.4, 10.2],
      [8.2, 9.4, 12.1, 11.7],
      [9.4, 10.2, 11.7, 14.8],
      [10.2, 12.1, 14.8, 16.2],
    ],
  },
};

export const CustomObservationModal: React.FC = () => {
  const { isCustomObservationOpen, closeCustomObservation, triggerNowcastCycle } = useSentinel();
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCustomObservationOpen) return null;

  const handleRunInference = async () => {
    setIsProcessing(true);
    setStatusMsg("Executing Spatiotemporal Conv3D Ingestion & Inference...");
    try {
      const parsed = JSON.parse(jsonText);
      const res = await fetch("/api/py/orchestration/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_synthetic_replay: true,
          source: "custom_observation_modal",
          observation_payload: parsed,
        }),
      });
      if (res.ok) {
        await triggerNowcastCycle();
        setStatusMsg("Inference completed! Live map polygons and threat metrics updated.");
        setTimeout(() => {
          closeCustomObservation();
          setStatusMsg(null);
        }, 1200);
      } else {
        setStatusMsg("API Error: Verify JSON payload format.");
      }
    } catch (err: any) {
      setStatusMsg(`JSON Parse Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[85vh] rounded-3xl border border-white/[0.08] bg-[#161820] shadow-clay-card-elevated text-slate-200 font-sans overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 bg-[#111217]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-500/30 bg-[#1C1F30] text-indigo-300 shadow-clay-btn">
              <FileCode className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Custom Observation Feeds & Tensor Ingestion
              </h2>
              <p className="text-[11px] text-slate-400">
                Feed multi-spectral satellite radiances & atmospheric vectors into Conv3D model
              </p>
            </div>
          </div>
          <button
            onClick={closeCustomObservation}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-[#1D202B] text-slate-400 hover:text-slate-100 transition shadow-clay-btn active:translate-y-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] font-sans">
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm">
                10 Channels: TIR1, WV, CTT Drop, CAPE, CIN, IWV, Omega, Elevation, Slope, TWI
              </Badge>
            </div>
            <button
              onClick={() => setJsonText(JSON.stringify(SAMPLE_PAYLOAD, null, 2))}
              className="text-indigo-300 hover:text-indigo-200 transition flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-[#1D202B] border border-white/[0.06] shadow-clay-btn active:translate-y-0.5"
            >
              <RefreshCw className="h-3 w-3" />
              Reset Default Event
            </button>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-80 rounded-2xl border border-white/[0.06] bg-[#111217] p-3.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px] leading-relaxed resize-none shadow-clay-inset selection:bg-indigo-900"
            spellCheck={false}
          />

          {statusMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-[#1C1F30] p-3 text-xs text-indigo-200 font-sans shadow-clay-card">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3.5 bg-[#111217]">
          <span className="text-[11px] text-slate-400 font-sans">
            Enforces 0.04° EPSG:4326 Normalization & SHA-256 Provenance Hashing
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={closeCustomObservation}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunInference}
              disabled={isProcessing}
              className="flex items-center gap-1.5"
            >
              <Play className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
              <span>{isProcessing ? "Predicting..." : "Execute AI Nowcast"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
