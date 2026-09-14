"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CameraController } from "./CameraController";
import { FLIGHT_PRESETS, flyToTarget, FlightTarget } from "./LocationFlight";
import { createIndiaStationMarkers, createUttarakhandBoundingBox, MONITORED_STATIONS } from "./IndiaHighlight";
import { Globe, Plane, Navigation, RefreshCw, Layers } from "lucide-react";

interface GlobeSceneProps {
  onSelectStation?: (stationName: string) => void;
  onEnterNowcastGrid?: () => void;
  className?: string;
}

export default function GlobeScene({
  onSelectStation,
  onEnterNowcastGrid,
  className = "",
}: GlobeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<CameraController | null>(null);
  const [activePreset, setActivePreset] = useState<string>("INDIA_SUBCONTINENT");
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Controller Setup
    const controller = new CameraController(camera, renderer.domElement);
    controllerRef.current = controller;

    // 5. Build Procedural Earth Sphere Texture Canvas
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Ocean Base
      ctx.fillStyle = "#091322";
      ctx.fillRect(0, 0, 2048, 1024);

      // Graticule Lines (Lat/Lon grid)
      ctx.strokeStyle = "#162844";
      ctx.lineWidth = 1;
      for (let x = 0; x < 2048; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }
      for (let y = 0; y < 1024; y += 128) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(2048, y);
        ctx.stroke();
      }

      // Stylized Continental Masses
      ctx.fillStyle = "#16253d";
      // Eurasia & Africa broad contours
      ctx.beginPath();
      ctx.ellipse(1400, 380, 420, 250, 0, 0, Math.PI * 2);
      ctx.fill();

      // Indian Subcontinent (Prominently mapped around x=1460, y=410)
      ctx.fillStyle = "#1e375b";
      ctx.beginPath();
      // Northwest Himalayas
      ctx.moveTo(1440, 320);
      // Himalayan mountain crest towards northeast
      ctx.lineTo(1520, 330);
      // Northeast / Bengal
      ctx.lineTo(1510, 420);
      // Southern Peninsular Apex (Kanyakumari)
      ctx.lineTo(1460, 520);
      // Western Ghats / Arabian Sea coast
      ctx.lineTo(1430, 420);
      ctx.closePath();
      ctx.fill();

      // Northern Himalayan High-Risk Belt (Uttarakhand / Himachal arc)
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(1468, 336, 32, -0.4, 0.6);
      ctx.stroke();

      // Americas
      ctx.fillStyle = "#16253d";
      ctx.beginPath();
      ctx.ellipse(550, 360, 260, 200, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Earth Sphere Mesh
    const earthGeometry = new THREE.SphereGeometry(1.0, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.85,
      metalness: 0.15,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    // Atmospheric Glow Mesh
    const atmosphereGeometry = new THREE.SphereGeometry(1.045, 48, 48);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // Monitoring Station Markers & Bounding Box
    const stationMarkers = createIndiaStationMarkers(1.0);
    const uttarakhandBox = createUttarakhandBoundingBox(1.0);
    scene.add(stationMarkers);
    scene.add(uttarakhandBox);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.8);
    dirLight.position.set(4, 3, 5);
    scene.add(dirLight);

    // Set initial view to Indian Subcontinent
    flyToTarget(controller, FLIGHT_PRESETS.INDIA_SUBCONTINENT);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle pulse for radar rings
      stationMarkers.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
          const scale = 1.0 + Math.sin(elapsedTime * 3 + index) * 0.18;
          child.scale.set(scale, scale, 1);
        }
      });

      controller.update();
      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controller.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleFlight = (presetKey: string) => {
    if (!controllerRef.current) return;
    const target = FLIGHT_PRESETS[presetKey];
    if (target) {
      setActivePreset(presetKey);
      flyToTarget(controllerRef.current, target);
    }
  };

  return (
    <div className={`relative flex flex-col h-full w-full overflow-hidden rounded-xl border border-[#1E2D4A] bg-[#080E1A] shadow-2xl ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 font-sans text-xs">
        <div className="flex items-center gap-2 rounded-lg border border-[#1E2D4A] bg-[#111A2C]/90 px-3 py-1.5 text-sky-200 backdrop-blur shadow-lg">
          <Globe className="h-4 w-4 text-[#38BDF8]" />
          <span className="font-semibold text-slate-100">Earth View</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">INSAT-3DR Geostationary</span>
        </div>
      </div>

      {/* Flight Destination Quickbar */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 font-sans text-xs">
        <span className="rounded-lg bg-[#111A2C]/90 border border-[#1E2D4A] px-2.5 py-1 text-slate-400 text-[11px] font-medium">
          Orbital Focus:
        </span>
        {[
          { key: "INDIA_SUBCONTINENT", label: "India Subcontinent" },
          { key: "UTTARAKHAND_HIMALAYAS", label: "Uttarakhand Pilot Zone" },
          { key: "KEDARNATH_VALLEY", label: "Kedarnath Valley" },
          { key: "RISHIKESH_GORGE", label: "Rishikesh Gorge" },
        ].map((preset) => (
          <button
            key={preset.key}
            onClick={() => handleFlight(preset.key)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs transition backdrop-blur shadow-sm font-medium ${
              activePreset === preset.key
                ? "border-sky-400 bg-sky-500/15 text-sky-200 font-semibold"
                : "border-[#1E2D4A] bg-[#111A2C]/80 text-slate-300 hover:border-slate-600 hover:bg-[#16233B] hover:text-white"
            }`}
          >
            <Navigation className="h-3 w-3" />
            <span>{preset.label}</span>
          </button>
        ))}

        {onEnterNowcastGrid && (
          <button
            onClick={onEnterNowcastGrid}
            className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-[#16233B] px-3 py-1 text-xs font-semibold text-sky-200 hover:bg-sky-500/20 transition backdrop-blur shadow-md"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Switch to Weather Map</span>
          </button>
        )}
      </div>

      {/* Active Stations Legend */}
      <div className="absolute top-3 right-3 z-10 hidden sm:flex flex-col gap-1 rounded-xl border border-[#1E2D4A] bg-[#111A2C]/95 p-3 font-sans text-xs text-slate-300 backdrop-blur shadow-xl max-w-xs">
        <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-2 font-semibold text-slate-200">
          <span>Doppler Weather Radars</span>
          <span className="text-[10px] text-emerald-400 font-medium font-sans">7 Online</span>
        </div>
        <div className="space-y-1 mt-1 max-h-36 overflow-y-auto pr-1">
          {MONITORED_STATIONS.map((station) => (
            <div
              key={station.id}
              onClick={() => onSelectStation && onSelectStation(station.name)}
              className="flex items-center justify-between text-slate-400 hover:text-[#38BDF8] cursor-pointer text-xs py-1 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    station.type === "NOWCAST_PILOT" ? "bg-[#38BDF8] ring-2 ring-sky-400/30" : "bg-emerald-400"
                  }`}
                />
                <span>{station.name}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{station.lat.toFixed(1)}°N</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
