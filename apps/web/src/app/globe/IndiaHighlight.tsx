import * as THREE from "three";

export interface RadarStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "DWR" | "INSAT_CAL" | "NOWCAST_PILOT";
  status: "ACTIVE" | "STANDBY";
}

export const MONITORED_STATIONS: RadarStation[] = [
  { id: "st_ddn", name: "Dehradun DWR & Nowcast Hub", lat: 30.316, lng: 78.032, type: "NOWCAST_PILOT", status: "ACTIVE" },
  { id: "st_sri", name: "Srinagar Doppler Radar", lat: 34.083, lng: 74.797, type: "DWR", status: "ACTIVE" },
  { id: "st_del", name: "Delhi Palam Radar", lat: 28.584, lng: 77.108, type: "DWR", status: "ACTIVE" },
  { id: "st_pat", name: "Patna Gangetic Basin Radar", lat: 25.594, lng: 85.137, type: "DWR", status: "ACTIVE" },
  { id: "st_kol", name: "Kolkata Radar", lat: 22.572, lng: 88.363, type: "DWR", status: "ACTIVE" },
  { id: "st_che", name: "Cherrapunji Orographic Radar", lat: 25.298, lng: 91.708, type: "DWR", status: "ACTIVE" },
  { id: "st_mum", name: "Mumbai Coastal Radar", lat: 18.922, lng: 72.834, type: "DWR", status: "ACTIVE" },
];

/**
 * Converts Latitude/Longitude on a globe of given radius to Cartesian Vector3
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Creates 3D visual markers on the Three.js globe for monitoring stations
 */
export function createIndiaStationMarkers(radius: number): THREE.Group {
  const group = new THREE.Group();

  MONITORED_STATIONS.forEach((station) => {
    const pos = latLngToVector3(station.lat, station.lng, radius * 1.002);
    const isPilot = station.type === "NOWCAST_PILOT";

    // Pin core
    const pinGeometry = new THREE.SphereGeometry(isPilot ? 0.024 : 0.014, 16, 16);
    const pinMaterial = new THREE.MeshBasicMaterial({
      color: isPilot ? 0x38bdf8 : 0x10b981,
    });
    const pinMesh = new THREE.Mesh(pinGeometry, pinMaterial);
    pinMesh.position.copy(pos);

    // Pulse ring around the station
    const ringGeometry = new THREE.RingGeometry(isPilot ? 0.026 : 0.016, isPilot ? 0.042 : 0.026, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: isPilot ? 0x38bdf8 : 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.position.copy(pos.clone().multiplyScalar(1.001));
    ringMesh.lookAt(new THREE.Vector3(0, 0, 0));

    // Store metadata on mesh for raycasting
    pinMesh.userData = station;

    group.add(pinMesh);
    group.add(ringMesh);
  });

  return group;
}

/**
 * Creates a glowing boundary arc for the Uttarakhand pilot region
 */
export function createUttarakhandBoundingBox(radius: number): THREE.Line {
  const coords = [
    [28.5, 77.5],
    [31.5, 77.5],
    [31.5, 81.0],
    [28.5, 81.0],
    [28.5, 77.5],
  ];

  const points = coords.map(([lat, lng]) => latLngToVector3(lat, lng, radius * 1.003));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    linewidth: 2,
    transparent: true,
    opacity: 0.9,
  });

  return new THREE.Line(geometry, material);
}

export default function IndiaHighlight() {
  return null; // Logic integrated directly into GlobeScene
}
