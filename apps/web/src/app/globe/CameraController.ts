import * as THREE from "three";

export interface CameraState {
  radius: number;
  theta: number; // azimuthal angle
  phi: number;   // polar angle
  target: THREE.Vector3;
}

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Spherical coordinates
  public radius: number = 3.2;
  public theta: number = 1.35; // centered approximately towards India longitude (~78° E)
  public phi: number = 1.15;   // ~25° N latitude

  private targetRadius: number = 3.2;
  private targetTheta: number = 1.35;
  private targetPhi: number = 1.15;

  private isDragging: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };
  private damping: number = 0.08;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.initEventListeners();
    this.updateCameraPosition();
  }

  private initEventListeners() {
    this.domElement.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    this.domElement.addEventListener("wheel", this.onWheel, { passive: false });

    // Touch support
    this.domElement.addEventListener("touchstart", this.onTouchStart, { passive: false });
    window.addEventListener("touchmove", this.onTouchMove, { passive: false });
    window.addEventListener("touchend", this.onTouchEnd);
  }

  public dispose() {
    this.domElement.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    this.domElement.removeEventListener("wheel", this.onWheel);

    this.domElement.removeEventListener("touchstart", this.onTouchStart);
    window.removeEventListener("touchmove", this.onTouchMove);
    window.removeEventListener("touchend", this.onTouchEnd);
  }

  private onMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.previousMousePosition.x;
    const deltaY = e.clientY - this.previousMousePosition.y;

    this.targetTheta -= deltaX * 0.005;
    this.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.targetPhi - deltaY * 0.005));

    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  private onMouseUp = () => {
    this.isDragging = false;
  };

  private initialPinchDistance: number = 0;
  private initialPinchRadius: number = 3.2;

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.0025;
    this.targetRadius = Math.max(1.15, Math.min(6.0, this.targetRadius + e.deltaY * zoomSpeed));
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      this.isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.initialPinchDistance = Math.hypot(dx, dy);
      this.initialPinchRadius = this.targetRadius;
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && this.isDragging) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.targetTheta -= deltaX * 0.006;
      this.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.targetPhi - deltaY * 0.006));

      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && this.initialPinchDistance > 0) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const ratio = this.initialPinchDistance / Math.max(currentDist, 1);
      this.targetRadius = Math.max(1.15, Math.min(6.0, this.initialPinchRadius * ratio));
    }
  };

  private onTouchEnd = () => {
    this.isDragging = false;
    this.initialPinchDistance = 0;
  };

  public zoomIn(delta: number = 0.3) {
    this.targetRadius = Math.max(1.15, Math.min(6.0, this.targetRadius - delta));
  }

  public zoomOut(delta: number = 0.3) {
    this.targetRadius = Math.max(1.15, Math.min(6.0, this.targetRadius + delta));
  }

  public resetView() {
    this.setView(1.36, 1.18, 2.35);
  }

  public setView(theta: number, phi: number, radius: number) {
    this.targetTheta = theta;
    this.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
    this.targetRadius = Math.max(1.15, Math.min(6.0, radius));
  }

  public update(): void {
    // Smooth damping interpolation
    this.theta += (this.targetTheta - this.theta) * this.damping;
    this.phi += (this.targetPhi - this.phi) * this.damping;
    this.radius += (this.targetRadius - this.radius) * this.damping;

    this.updateCameraPosition();
  }

  private updateCameraPosition() {
    const x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.radius * Math.cos(this.phi);
    const z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }
}
