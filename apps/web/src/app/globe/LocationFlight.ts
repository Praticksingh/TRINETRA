import { CameraController } from "./CameraController";

export interface FlightTarget {
  name: string;
  theta: number; // azimuth (longitude based)
  phi: number;   // inclination (latitude based)
  radius: number;// zoom distance
}

// Pre-configured flight destinations
export const FLIGHT_PRESETS: Record<string, FlightTarget> = {
  GLOBAL: {
    name: "Global Satellite View",
    theta: 1.36,
    phi: 1.25,
    radius: 3.5,
  },
  INDIA_SUBCONTINENT: {
    name: "Indian Subcontinent (INSAT Footprint)",
    theta: 1.36,
    phi: 1.18,
    radius: 2.35,
  },
  UTTARAKHAND_HIMALAYAS: {
    name: "Uttarakhand Pilot Convective Corridor",
    theta: 1.366,
    phi: 1.045,
    radius: 1.72,
  },
  KEDARNATH_VALLEY: {
    name: "Kedarnath Cirque & Catchment",
    theta: 1.378,
    phi: 1.033,
    radius: 1.62,
  },
  RISHIKESH_GORGE: {
    name: "Rishikesh - Ganga Entry Point",
    theta: 1.364,
    phi: 1.052,
    radius: 1.65,
  },
};

/**
 * Animate camera flight to specific geospatial coordinates
 */
export function flyToTarget(
  controller: CameraController,
  target: FlightTarget,
  onComplete?: () => void
) {
  controller.setView(target.theta, target.phi, target.radius);
  if (onComplete) {
    setTimeout(onComplete, 1200);
  }
}

/**
 * Convert real Longitude/Latitude into spherical angles [theta, phi]
 * on unit sphere.
 */
export function latLngToSpherical(lat: number, lng: number): { theta: number; phi: number } {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180) - Math.PI / 2;
  return { theta, phi };
}
