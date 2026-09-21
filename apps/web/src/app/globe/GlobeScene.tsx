"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CameraController } from "./CameraController";
import { FLIGHT_PRESETS, flyToTarget } from "./LocationFlight";
import { createIndiaStationMarkers, createUttarakhandBoundingBox, MONITORED_STATIONS } from "./IndiaHighlight";
import { Globe, Navigation, Layers, Compass, Radio } from "lucide-react";

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
    scene.background = new THREE.Color(0x040814);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Controller Setup
    const controller = new CameraController(camera, renderer.domElement);
    controllerRef.current = controller;

    // 5. Starfield Background (Deep Space Universe)
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1200;
    const positions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      const r = 35 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // 6. Photorealistic Earth Textures (NASA Blue Marble & Elevation)
    const textureLoader = new THREE.TextureLoader();
    const earthDayTexture = textureLoader.load("/textures/earth-blue-marble.jpg");
    earthDayTexture.colorSpace = THREE.SRGBColorSpace;

    const earthBumpTexture = textureLoader.load("/textures/earth-topology.png");
    const earthCloudsTexture = textureLoader.load("/textures/earth-clouds.png");
    earthCloudsTexture.colorSpace = THREE.SRGBColorSpace;

    // Earth Sphere Mesh
    const earthGeometry = new THREE.SphereGeometry(1.0, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthDayTexture,
      bumpMap: earthBumpTexture,
      bumpScale: 0.04,
      roughness: 0.65,
      metalness: 0.08,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    // Dynamic Cloud Layer Mesh (Slowly rotating above Earth)
    const cloudGeometry = new THREE.SphereGeometry(1.008, 64, 64);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: earthCloudsTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.NormalBlending,
      roughness: 0.9,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);

    // Atmospheric Glow Mesh (Inner celestial halo)
    const innerAtmosphereGeometry = new THREE.SphereGeometry(1.025, 48, 48);
    const innerAtmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
    });
    const innerAtmosphereMesh = new THREE.Mesh(innerAtmosphereGeometry, innerAtmosphereMaterial);
    scene.add(innerAtmosphereMesh);

    // Outer Atmospheric Haze
    const outerAtmosphereGeometry = new THREE.SphereGeometry(1.055, 48, 48);
    const outerAtmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const outerAtmosphereMesh = new THREE.Mesh(outerAtmosphereGeometry, outerAtmosphereMaterial);
    scene.add(outerAtmosphereMesh);

    // Monitoring Station Markers & Bounding Box
    const stationMarkers = createIndiaStationMarkers(1.0);
    const uttarakhandBox = createUttarakhandBoundingBox(1.0);
    scene.add(stationMarkers);
    scene.add(uttarakhandBox);

    // 7. Photorealistic Lighting
    // Ambient Space Light
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.6);
    scene.add(ambientLight);

    // Hemisphere Light (Sky illumination from space)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020617, 0.4);
    scene.add(hemiLight);

    // Directional Sunlight
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Secondary Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // Initial View set to Indian Subcontinent
    flyToTarget(controller, FLIGHT_PRESETS.INDIA_SUBCONTINENT);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Realistic slow cloud movement relative to Earth
      cloudMesh.rotation.y = elapsedTime * 0.012;

      // Gentle pulse for radar station rings
      stationMarkers.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
          const scale = 1.0 + Math.sin(elapsedTime * 3.2 + index) * 0.22;
          child.scale.set(scale, scale, 1);
        }
      });

      controller.update();
      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
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
    <div className={`relative flex flex-col h-full w-full overflow-hidden bg-[#040814] ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Flight Destination Controls (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-1.5 font-sans text-xs">
        <span className="rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-slate-400 text-xs font-medium backdrop-blur-md">
          Focus:
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
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition backdrop-blur-md shadow-sm font-medium ${
              activePreset === preset.key
                ? "border-sky-500/60 bg-sky-950/80 text-sky-200 font-bold shadow-md"
                : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Navigation className="h-3 w-3 text-sky-400" />
            <span>{preset.label}</span>
          </button>
        ))}

        {onEnterNowcastGrid && (
          <button
            onClick={onEnterNowcastGrid}
            className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white transition backdrop-blur-md shadow-md ml-1"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Switch to Weather Map</span>
          </button>
        )}
      </div>

      {/* Active Stations Legend (Top Right) */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-900/95 p-3.5 font-sans text-xs text-slate-300 backdrop-blur-xl shadow-2xl max-w-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-semibold text-slate-200">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-sky-400" />
            <span>Doppler Weather Radars</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium font-mono">7 Online</span>
        </div>
        <div className="space-y-1 mt-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
          {MONITORED_STATIONS.map((station) => (
            <div
              key={station.id}
              onClick={() => onSelectStation && onSelectStation(station.name)}
              className="flex items-center justify-between text-slate-400 hover:text-sky-300 cursor-pointer text-xs py-1 transition-colors rounded-lg hover:bg-slate-800/60 px-1.5"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    station.type === "NOWCAST_PILOT" ? "bg-sky-400 ring-2 ring-sky-400/40" : "bg-emerald-400"
                  }`}
                />
                <span className="truncate">{station.name}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{station.lat.toFixed(1)}°N</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
