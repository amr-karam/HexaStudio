/**
 * ParticleSimulation (S15-FX-001) — GPGPU engine for The Living Blueprint.
 *
 * Architecture:
 * ┌──────────────┐    ┌─────────────────┐    ┌───────────────┐
 * │  Position FBO │───▶│ simulation.frag │───▶│ Velocity FBO  │
 * │  (ping-pong)  │◀───│  curl + spline  │    │  (ping-pong)  │
 * └──────────────┘    │  + cursor force │    └───────────────┘
 *                     │  + damping      │
 *                     └────────┬────────┘
 *                              │ updated velocity
 *                     ┌────────▼────────┐
 *                     │ position.frag   │
 *                     │ Euler integrate │
 *                     └────────┬────────┘
 *                              │
 *              ┌───────────────▼──────────────┐
 *              │     Points geometry           │
 *              │  render.vert + render.frag   │
 *              │  soft additive gold sprites   │
 *              └──────────────────────────────┘
 *
 * Pure Three.js class (no React) — zero per-frame GC allocations.
 * Quality-tier-driven texture sizing via static TEXTURE_SIZES map.
 * Context-lost recovery: reinitialize on webglcontextrestored.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  FloatType,
  HalfFloatType,
  LinearFilter,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  RGBAFormat,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';

import { bakeSplineField, type BakedSplineField, type SplineFieldData } from './SplineField';
import {
  POSITION_FRAGMENT,
  RENDER_FRAGMENT,
  RENDER_VERTEX,
  SIMULATION_FRAGMENT,
  SIM_VERTEX,
} from './shaders';
import type { QualityLevel } from '@/providers/quality-provider';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Simulation texture edge per quality tier.
 *   256² = 65,536 particles (high)
 *   128² = 16,384 particles (medium)
 *   null  = static poster fallback (low tier never creates a simulation)
 */
export const TEXTURE_SIZE: Record<'high' | 'medium', number> = {
  high: 256,
  medium: 128,
};

/** Clamp delta to prevent physics explosion after tab-switch / hitch. */
const MAX_DELTA_SEC = 1 / 30;

/** Damped pointer lerp rate (framerate-normalised via exp) — prevents twitchy forces. */
const POINTER_SMOOTH_RATE = 8;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface SimulationParams {
  /** Attraction strength towards spline targets. */
  attraction: number;
  /** Magnitude of divergence-free curl noise. */
  curlStrength: number;
  /** Spatial frequency of the curl noise field. */
  curlScale: number;
  /** Framerate-independent damping (higher = faster decay). */
  damping: number;
  /** Cursor force radial radius in world units. */
  pointerRadius: number;
  /** Cursor force magnitude multiplier. */
  pointerForce: number;
}

export const DEFAULT_SIM_PARAMS: SimulationParams = {
  attraction: 2.2,
  curlStrength: 0.65,
  curlScale: 0.35,
  damping: 1.6,
  pointerRadius: 1.8,
  pointerForce: 3.0,
};

export interface RenderParams {
  pointSize: number;
  opacity: number;
  colorBase: string;
  colorHot: string;
}

const DEFAULT_RENDER_PARAMS: RenderParams = {
  pointSize: 36,
  opacity: 0.55,
  colorBase: '#C5A059',
  colorHot: '#F5E3B3',
};

/** Texture-backed simulation reference; the Points object is what R3F renders. */
export interface ParticleSimulationHandle {
  readonly points: Points;
  readonly simSize: number;
  readonly particleCount: number;
  update(delta: number, renderer: WebGLRenderer, pixelRatio: number): void;
  setPointer(world: Vector3, strength: number): void;
  setSplines(data: SplineFieldData): void;
  setSimParams(partial: Partial<SimulationParams>): void;
  setRenderParams(partial: Partial<RenderParams>): void;
  resizePoints(pixelRatio: number): void;
  dispose(): void;
}

/* -------------------------------------------------------------------------- */
/*  ParticleSimulation                                                         */
/* -------------------------------------------------------------------------- */

export class ParticleSimulation implements ParticleSimulationHandle {
  readonly simSize: number;
  readonly particleCount: number;
  readonly points: Points;

  /* ---- FBO ping-pong targets ---------------------------------------------- */
  private posTargets: [WebGLRenderTarget, WebGLRenderTarget];
  private velTargets: [WebGLRenderTarget, WebGLRenderTarget];
  private cur = 0; // index of READ target in ping-pong

  /* ---- Simulation pass infrastructure ------------------------------------- */
  private readonly simScene: Scene;
  private readonly simCamera: OrthographicCamera;
  private readonly simMesh: Mesh;

  /* ---- Materials ----------------------------------------------------------- */
  private readonly simMaterial: ShaderMaterial;
  private readonly posMaterial: ShaderMaterial;
  private readonly renderMaterial: ShaderMaterial;

  /* ---- Pre-allocated textures --------------------------------------------- */
  private initialPositions: DataTexture;
  private initialVelocities: DataTexture;
  private paramsTexture: DataTexture;
  private field: BakedSplineField | null = null;

  /* ---- Pre-allocated geometry --------------------------------------------- */
  private readonly pointsGeometry: BufferGeometry;

  /* ---- State --------------------------------------------------------------- */
  private time = 0;
  private seeded = false;

  /** Smoothed mouse position in world-space — damped each frame. */
  private readonly pointer = new Vector3(0, 0, 0);
  private readonly pointerTarget = new Vector3(0, 0, 0);
  private pointerStrength = 0;
  private pointerStrengthTarget = 0;

  /* ---- Simulation tunables ------------------------------------------------- */
  private simParams: SimulationParams;
  private renderParams: RenderParams;

  /* ---- Context-lost recovery ---------------------------------------------- */
  private glContextLost = false;
  private onContextLost: () => void;
  private onContextRestored: () => void;
  private gl: WebGLRenderer | null = null;

  constructor(
    tier: 'medium' | 'high',
    field: SplineFieldData,
    simOverrides?: Partial<SimulationParams>,
    renderOverrides?: Partial<RenderParams>,
  ) {
    this.simParams = { ...DEFAULT_SIM_PARAMS, ...simOverrides };
    this.renderParams = { ...DEFAULT_RENDER_PARAMS, ...renderOverrides };

    const size = TEXTURE_SIZE[tier];
    this.simSize = size;
    this.particleCount = size * size;

    /* ---- Seed textures and field ------------------------------------------- */
    this.field = bakeSplineField(field);

    const posArray = new Float32Array(this.particleCount * 4);
    const velArray = new Float32Array(this.particleCount * 4);
    const paramArray = new Float32Array(this.particleCount * 4);
    const scatter = new Vector3();

    // Scatter all particles along their assigned spline segments.
    for (let i = 0; i < this.particleCount; i++) {
      const splineIdx = i % this.field.splineCount;
      const t = Math.random();
      this.field.curves[splineIdx].getPointAt(t, scatter);

      const idx = i * 4;
      // Position: on-spline with small jitter for organic feel.
      posArray[idx] = scatter.x + (Math.random() - 0.5) * 0.4;
      posArray[idx + 1] = scatter.y + (Math.random() - 0.5) * 0.4;
      posArray[idx + 2] = scatter.z + (Math.random() - 0.5) * 0.4;
      posArray[idx + 3] = 1;

      // Per-particle metadata for the simulation shader.
      // x = spline row in v-coordinate (0..1), y = flow offset t,
      // z = individual flow speed, w = noise seed.
      paramArray[idx] = (splineIdx + 0.5) / this.field.splineCount;
      paramArray[idx + 1] = t;
      paramArray[idx + 2] = 0.015 + Math.random() * 0.03;
      paramArray[idx + 3] = Math.random();
    }

    this.initialPositions = this._makeDataTexture(posArray);
    this.initialVelocities = this._makeDataTexture(velArray);
    this.paramsTexture = this._makeDataTexture(paramArray);

    /* ---- Render targets --------------------------------------------------- */
    this.posTargets = [this._makeTarget(), this._makeTarget()];
    this.velTargets = [this._makeTarget(), this._makeTarget()];

    /* ---- Simulation pass -------------------------------------------------- */
    this.simScene = new Scene();
    this.simCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.simMaterial = new ShaderMaterial({
      vertexShader: SIM_VERTEX,
      fragmentShader: SIMULATION_FRAGMENT,
      uniforms: {
        tPosition: { value: null },
        tVelocity: { value: null },
        tParams: { value: this.paramsTexture },
        tSpline: { value: this.field.texture },
        uTime: { value: 0 },
        uDelta: { value: 0 },
        uAttraction: { value: this.simParams.attraction },
        uCurlStrength: { value: this.simParams.curlStrength },
        uCurlScale: { value: this.simParams.curlScale },
        uDamping: { value: this.simParams.damping },
        uPointer: { value: new Vector3() },
        uPointerStrength: { value: 0 },
        uPointerRadius: { value: this.simParams.pointerRadius },
        uPointerForce: { value: this.simParams.pointerForce },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.posMaterial = new ShaderMaterial({
      vertexShader: SIM_VERTEX,
      fragmentShader: POSITION_FRAGMENT,
      uniforms: {
        tPosition: { value: null },
        tVelocity: { value: null },
        uDelta: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.simMesh = new Mesh(new PlaneGeometry(2, 2), this.simMaterial);
    this.simMesh.frustumCulled = false;
    this.simScene.add(this.simMesh);

    /* ---- Render pass geometry --------------------------------------------- */
    // Each vertex is a lookup ref (UV) into the position texture.
    // The GPU computes actual vertex positions from the sim texture.
    this.pointsGeometry = new BufferGeometry();
    const refs = new Float32Array(this.particleCount * 2);
    for (let i = 0; i < this.particleCount; i++) {
      refs[i * 2] = ((i % size) + 0.5) / size;
      refs[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size;
    }
    // Dummy position attribute — required by BufferGeometry but unused
    // since the vertex shader fetches from the simulation texture.
    this.pointsGeometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(this.particleCount * 3), 3),
    );
    this.pointsGeometry.setAttribute('aRef', new BufferAttribute(refs, 2));
    // Null bounding sphere disables frustum culling — particles must always
    // render regardless of their GPU-computed positions.
    (this.pointsGeometry as unknown as { boundingSphere: null }).boundingSphere = null;

    this.renderMaterial = new ShaderMaterial({
      vertexShader: RENDER_VERTEX,
      fragmentShader: RENDER_FRAGMENT,
      uniforms: {
        tPosition: { value: this.initialPositions },
        tVelocity: { value: this.initialVelocities },
        uPointSize: { value: this.renderParams.pointSize },
        uPixelRatio: { value: 1 },
        uColorBase: { value: new Color(this.renderParams.colorBase) },
        uColorHot: { value: new Color(this.renderParams.colorHot) },
        uOpacity: { value: this.renderParams.opacity },
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    });

    this.points = new Points(this.pointsGeometry, this.renderMaterial);
    this.points.frustumCulled = false;

    /* ---- Context loss handlers -------------------------------------------- */
    this.onContextLost = () => {
      this.glContextLost = true;
    };
    this.onContextRestored = () => {
      this.glContextLost = false;
      this.seeded = false;
    };
  }

  /* ------------------------------------------------------------------------ */
  /*  Public API                                                               */
  /* ------------------------------------------------------------------------ */

  /**
   * Advance one simulation step. Call once per animation frame.
   *
   * @param delta   Frame delta in seconds (clamped internally).
   * @param renderer The Three.js WebGLRenderer (set via `bindRenderer`).
   * @param pixelRatio Current device pixel ratio for point sizing.
   */
  update(delta: number, renderer: WebGLRenderer, pixelRatio: number): void {
    if (this.glContextLost) return;

    const dt = Math.min(delta, MAX_DELTA_SEC);
    this.time += dt;

    // Damped pointer smoothing — framerate-normalized exponential decay.
    const alpha = 1 - Math.exp(-POINTER_SMOOTH_RATE * dt);
    this.pointer.lerp(this.pointerTarget, alpha);
    this.pointerStrength +=
      (this.pointerStrengthTarget - this.pointerStrength) * alpha;

    // Ensure renderer binding for context-lost recovery.
    this.gl = renderer;

    const read = this.cur;
    const write = 1 - this.cur;

    const posRead = this.seeded
      ? this.posTargets[read].texture
      : this.initialPositions;
    const velRead = this.seeded
      ? this.velTargets[read].texture
      : this.initialVelocities;

    // ── Pass 1: velocity (curl + spline + cursor + damping) ────────────────
    const su = this.simMaterial.uniforms;
    su.tPosition.value = posRead;
    su.tVelocity.value = velRead;
    su.uTime.value = this.time;
    su.uDelta.value = dt;
    (su.uPointer.value as Vector3).copy(this.pointer);
    su.uPointerStrength.value = this.pointerStrength;

    this.simMesh.material = this.simMaterial;
    renderer.setRenderTarget(this.velTargets[write]);
    renderer.render(this.simScene, this.simCamera);

    // ── Pass 2: position (Euler integration) ───────────────────────────────
    const pu = this.posMaterial.uniforms;
    pu.tPosition.value = posRead;
    pu.tVelocity.value = this.velTargets[write].texture;
    pu.uDelta.value = dt;

    this.simMesh.material = this.posMaterial;
    renderer.setRenderTarget(this.posTargets[write]);
    renderer.render(this.simScene, this.simCamera);

    renderer.setRenderTarget(null);

    // ── Feed render material with latest position/velocity textures ────────
    const ru = this.renderMaterial.uniforms;
    ru.tPosition.value = this.posTargets[write].texture;
    ru.tVelocity.value = this.velTargets[write].texture;
    ru.uPixelRatio.value = pixelRatio;

    this.cur = write;
    this.seeded = true;
  }

  /** Set the cursor force field origin (world space) + strength (0 = off). */
  setPointer(world: Vector3, strength: number): void {
    this.pointerTarget.copy(world);
    this.pointerStrengthTarget = strength;
  }

  /** Hot-swap the entire spline field at runtime (e.g. morph transition). */
  setSplines(data: SplineFieldData): void {
    if (this.field) {
      this.field.dispose();
    }
    this.field = bakeSplineField(data);
    this.simMaterial.uniforms.tSpline.value = this.field.texture;

    // Re-seed particle positions along the new splines so particles "snap"
    // into valid flow paths immediately rather than slowly drifting back.
    const count = this.particleCount;
    const posArray = new Float32Array(count * 4);
    const paramArray = new Float32Array(count * 4);
    const scatter = new Vector3();

    for (let i = 0; i < count; i++) {
      const splineIdx = i % this.field.splineCount;
      const t = Math.random();
      this.field.curves[splineIdx].getPointAt(t, scatter);
      const idx = i * 4;
      posArray[idx] = scatter.x + (Math.random() - 0.5) * 0.3;
      posArray[idx + 1] = scatter.y + (Math.random() - 0.5) * 0.3;
      posArray[idx + 2] = scatter.z + (Math.random() - 0.5) * 0.3;
      posArray[idx + 3] = 1;
      paramArray[idx] = (splineIdx + 0.5) / this.field.splineCount;
      paramArray[idx + 1] = t;
      paramArray[idx + 2] = 0.015 + Math.random() * 0.03;
      paramArray[idx + 3] = Math.random();
    }

    this.initialPositions.dispose();
    this.paramsTexture.dispose();
    this.initialPositions = this._makeDataTexture(posArray);
    this.paramsTexture = this._makeDataTexture(paramArray);

    this.simMaterial.uniforms.tParams.value = this.paramsTexture;
    // Re-trigger seeding so simulation picks up new initial positions.
    this.seeded = false;
  }

  /** Update simulation tunables at runtime without recreating materials. */
  setSimParams(partial: Partial<SimulationParams>): void {
    Object.assign(this.simParams, partial);
    const su = this.simMaterial.uniforms;
    if (partial.attraction !== undefined) su.uAttraction.value = partial.attraction;
    if (partial.curlStrength !== undefined) su.uCurlStrength.value = partial.curlStrength;
    if (partial.curlScale !== undefined) su.uCurlScale.value = partial.curlScale;
    if (partial.damping !== undefined) su.uDamping.value = partial.damping;
    if (partial.pointerRadius !== undefined) su.uPointerRadius.value = partial.pointerRadius;
    if (partial.pointerForce !== undefined) su.uPointerForce.value = partial.pointerForce;
  }

  /** Update render parameters at runtime (point size, opacity, colors). */
  setRenderParams(partial: Partial<RenderParams>): void {
    Object.assign(this.renderParams, partial);
    const ru = this.renderMaterial.uniforms;
    if (partial.pointSize !== undefined) ru.uPointSize.value = partial.pointSize;
    if (partial.opacity !== undefined) ru.uOpacity.value = partial.opacity;
    if (partial.colorBase !== undefined) (ru.uColorBase.value as Color).set(partial.colorBase);
    if (partial.colorHot !== undefined) (ru.uColorHot.value as Color).set(partial.colorHot);
  }

  /** Signal resize — the render material re-reads pixelRatio from uniforms. */
  resizePoints(pixelRatio: number): void {
    this.renderMaterial.uniforms.uPixelRatio.value = pixelRatio;
  }

  /* ------------------------------------------------------------------------ */
  /*  Context-lost recovery                                                    */
  /* ------------------------------------------------------------------------ */

  /**
   * Register WebGL context event listeners on the canvas' DOM element.
   * Call once after the Points object is mounted in the scene graph.
   */
  bindContextRecovery(domElement: HTMLCanvasElement): void {
    domElement.addEventListener('webglcontextlost', this.onContextLost);
    domElement.addEventListener('webglcontextrestored', this.onContextRestored);
  }

  unbindContextRecovery(domElement: HTMLCanvasElement): void {
    domElement.removeEventListener('webglcontextlost', this.onContextLost);
    domElement.removeEventListener('webglcontextrestored', this.onContextRestored);
  }

  /* ------------------------------------------------------------------------ */
  /*  Disposal — anti-leak protocol                                            */
  /* ------------------------------------------------------------------------ */

  dispose(): void {
    this.posTargets.forEach((t) => t.dispose());
    this.velTargets.forEach((t) => t.dispose());
    this.simMaterial.dispose();
    this.posMaterial.dispose();
    this.renderMaterial.dispose();
    this.simMesh.geometry.dispose();
    this.pointsGeometry.dispose();
    this.initialPositions.dispose();
    this.initialVelocities.dispose();
    this.paramsTexture.dispose();
    if (this.field) this.field.dispose();
    this.simScene.clear();
  }

  /* ------------------------------------------------------------------------ */
  /*  Private helpers                                                          */
  /* ------------------------------------------------------------------------ */

  private _makeDataTexture(data: Float32Array): DataTexture {
    const tex = new DataTexture(
      data as unknown as BufferSource,
      this.simSize,
      this.simSize,
      RGBAFormat,
      FloatType,
    );
    tex.minFilter = NearestFilter;
    tex.magFilter = NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }

  private _makeTarget(): WebGLRenderTarget {
    return new WebGLRenderTarget(this.simSize, this.simSize, {
      format: RGBAFormat,
      type: HalfFloatType,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }
}

/* -------------------------------------------------------------------------- */
/*  Factory — quality-tier-aware constructor                                  */
/* -------------------------------------------------------------------------- */

/**
 * Create a ParticleSimulation for the given quality tier.
 * Returns null for 'low' tier (static poster fallback path).
 */
export function createParticleSimulation(
  tier: QualityLevel,
  field: SplineFieldData,
  simOverrides?: Partial<SimulationParams>,
  renderOverrides?: Partial<RenderParams>,
): ParticleSimulation | null {
  if (tier === 'low') return null;
  return new ParticleSimulation(tier, field, simOverrides, renderOverrides);
}
