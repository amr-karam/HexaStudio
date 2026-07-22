/**
 * ForceField (S15-FX-004) — cursor interactivity for the particle engine.
 *
 * Converts raw pointer events into a world-space force vector that the
 * simulation shader consumes. Respects the motion policy:
 *  - Fine pointer only (coarse = no force field)
 *  - Mouse velocity derived via frame delta (not raw position)
 *  - Radial impulse with smoothstep falloff
 *
 * All computation runs on the JS thread and feeds `ParticleSimulation.setPointer()`.
 * The heavy lift (applying forces to each particle) happens on the GPU in
 * `simulation.frag`.
 */
import { Raycaster, Vector2, Vector3, type Camera, Plane } from 'three';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ForceFieldConfig {
  /** Radius in world units for the force influence zone. */
  radius: number;
  /** Maximum force magnitude at the center of the influence zone. */
  maxStrength: number;
  /** Smoothing factor for pointer position (0-1 lerp per frame, lower = smoother). */
  smoothing: number;
  /** Minimum velocity threshold — cursor must move this fast (world units/s) to trigger force. */
  velocityThreshold: number;
}

const DEFAULT_CONFIG: ForceFieldConfig = {
  radius: 1.8,
  maxStrength: 3.0,
  smoothing: 0.15,
  velocityThreshold: 0.02,
};

/**
 * World-space intersection plane (z=0 by default — matches the hero canvas layout).
 */
const DEFAULT_PLANE_NORMAL = new Vector3(0, 0, 1);
const DEFAULT_PLANE_OFFSET = 0;

/* -------------------------------------------------------------------------- */
/*  ForceField                                                                 */
/* -------------------------------------------------------------------------- */

export class ForceField {
  private readonly raycaster = new Raycaster();
  private readonly ndc = new Vector2();
  private readonly hitPoint = new Vector3();
  private readonly smoothedPoint = new Vector3();
  private readonly prevPoint = new Vector3();
  private readonly velocity = new Vector3();
  private readonly planeNormal: Vector3;
  private readonly intersectionPlane: Plane;

  private active = false;
  private strength: number = 0;
  private targetStrength: number = 0;
  private smoothedStrength: number = 0;

  readonly config: ForceFieldConfig;

  constructor(config?: Partial<ForceFieldConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.planeNormal = DEFAULT_PLANE_NORMAL.clone();
    this.intersectionPlane = new Plane(this.planeNormal, DEFAULT_PLANE_OFFSET);
  }

  /* ------------------------------------------------------------------------ */
  /*  Input API — called from pointer event handlers                           */
  /* ------------------------------------------------------------------------ */

  /**
   * Update the NDC pointer position from a DOM event.
   * Call this on `pointermove`.
   */
  updateFromEvent(event: PointerEvent, domElement: HTMLElement): void {
    const rect = domElement.getBoundingClientRect();
    this.ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.active = true;
  }

  /** Mark the pointer as inactive (cursor left the canvas). */
  deactivate(): void {
    this.active = false;
    this.targetStrength = 0;
  }

  /* ------------------------------------------------------------------------ */
  /*  Per-frame update — projects NDC → world, computes velocity, feeds sim   */
  /* ------------------------------------------------------------------------ */

  /**
   * @returns The world-space hit position and the current force strength,
   *          ready to pass into `ParticleSimulation.setPointer()`.
   */
  step(camera: Camera, delta: number): { world: Vector3; strength: number } {
    this.targetStrength = 0;

    if (!this.active) {
      // No pointer — decay strength smoothly
      this.strength = 0;
      this.smoothedStrength = 0;
      this.smoothedPoint.set(0, 0, 0);
      return { world: this.smoothedPoint, strength: 0 };
    }

    // Project NDC to world-space intersection with the z=0 plane.
    this.raycaster.setFromCamera(this.ndc, camera);
    const didHit = this.raycaster.ray.intersectPlane(
      this.intersectionPlane,
      this.hitPoint,
    );

    if (!didHit) {
      this.strength = 0;
      return { world: this.smoothedPoint, strength: 0 };
    }

    // Smooth the position to avoid jitter.
    const s = this.config.smoothing;
    this.smoothedPoint.lerp(this.hitPoint, s);
    this.smoothedStrength = this.strength;

    // Compute cursor velocity in world units/s.
    this.velocity.subVectors(this.smoothedPoint, this.prevPoint).divideScalar(Math.max(delta, 0.001));
    this.prevPoint.copy(this.smoothedPoint);

    const speed = this.velocity.length();

    // Only apply force if the cursor is moving above the threshold.
    if (speed > this.config.velocityThreshold) {
      // Map speed to strength (capped at maxStrength). Use a smooth curve
      // so slow movements produce gentle ripples while fast sweeps explode.
      this.strength = Math.min(speed * this.config.maxStrength, this.config.maxStrength);
    } else {
      // Decay slowly when stationary to avoid abrupt cut-off.
      this.strength *= 1 - Math.min(4 * delta, 0.95);
    }

    return { world: this.smoothedPoint.clone(), strength: this.strength };
  }

  /* ------------------------------------------------------------------------ */
  /*  Reset                                                                    */
  /* ------------------------------------------------------------------------ */

  reset(): void {
    this.active = false;
    this.strength = 0;
    this.targetStrength = 0;
    this.smoothedStrength = 0;
    this.smoothedPoint.set(0, 0, 0);
    this.prevPoint.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
  }

  /** Completely disable the force field (e.g. on `window` or renderer dispose). */
  shutdown(): void {
    this.reset();
  }
}
