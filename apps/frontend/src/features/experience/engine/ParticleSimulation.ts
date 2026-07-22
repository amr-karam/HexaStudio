/**
 * ParticleSimulation (S15-FX-001) — GPGPU ping-pong particle engine.
 *
 * Architecture:
 * ┌──────────────────┐     ┌──────────────────────────┐
 * │  Position FBO    │────▶│  simulation.frag          │
 * │  (ping-pong 0↔1) │     │  curl + spline + cursor   │
 * └──────────────────┘     │  + damping → new velocity │
 *                          └──────────┬───────────────┘
 * ┌──────────────────┐               │
 * │  Velocity FBO    │◀──────────────┘
 * │  (ping-pong 0↔1) │
 * └────────┬─────────┘
 *          │ updated velocity
 * ┌────────▼─────────┐
 * │  position.frag   │
 * │  Euler integrate │
 * │  pos += vel * dt │
 * └────────┬─────────┘
 *          │
 * ┌────────▼──────────────────────────────────────────┐
 * │  THREE.Points geometry                             │
 * │  render.vert: billboarded, size-attenuated         │
 * │  render.frag: quintic soft disc + 2-stage gold LUT │
 * │  AdditiveBlending, no depthWrite                   │
 * └────────────────────────────────────────────────────┘
 *
 * Zero per-frame garbage-collection allocations.
 * Pure Three.js class — no React / R3F dependency.
 *
 * Quality-tier-driven texture dimensions:
 *   high   = 256² → 65,536 particles
 *   medium = 128² → 16,384 particles
 *   low    = null  → simulation never created
 */
import * as THREE from 'three';

import { type SplineFieldData, bakeSplineField, type BakedSplineField } from './SplineField';
import {
  SIMULATION_VERTEX,
  SIMULATION_FRAGMENT,
  POSITION_FRAGMENT,
  RENDER_VERTEX,
  RENDER_FRAGMENT,
} from './shaders';
import type { QualityLevel } from '@/providers/quality-provider';

/* ========================================================================== */
/*  Constants                                                                  */
/* ========================================================================== */

/** Simulation texture edge length per quality tier. */
const TEXTURE_SIZES: Record<'high' | 'medium', number> = {
  high: 256,
  medium: 128,
};

/** Clamp delta to prevent physics explosion after tab-switch. */
const MAX_DELTA_SEC = 1 / 30;

/** Damped pointer lerp rate (framerate-normalised via exponential decay). */
const POINTER_SMOOTH_RATE = 10;

/** Default world bounds for NDC → world-space mapping. */
interface WorldBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

const DEFAULT_WORLD_BOUNDS: WorldBounds = {
  xMin: -6,
  xMax: 6,
  yMin: -3.5,
  yMax: 3.5,
};

/* ========================================================================== */
/*  Types                                                                      */
/* ========================================================================== */

export interface SimulationParams {
  /** Attraction strength pulling particles toward spline targets. */
  attraction: number;
  /** Magnitude of divergence-free curl noise. */
  curlStrength: number;
  /** Spatial frequency of the curl noise field (higher = more detailed eddies). */
  curlScale: number;
  /** Framerate-independent damping (higher = faster velocity decay). */
  damping: number;
  /** Cursor force radial radius in world units. */
  cursorRadius: number;
  /** Cursor force magnitude multiplier. */
  cursorForce: number;
}

export const DEFAULT_SIM_PARAMS: SimulationParams = {
  attraction: 2.2,
  curlStrength: 0.65,
  curlScale: 0.35,
  damping: 1.6,
  cursorRadius: 1.8,
  cursorForce: 3.0,
};

export interface RenderParams {
  pointSize: number;
  opacity: number;
  /** CSS hex — deep champagne. */
  colorBase: string;
  /** CSS hex — bright ivory-gold for hot particle cores. */
  colorHot: string;
}

const DEFAULT_RENDER_PARAMS: RenderParams = {
  pointSize: 36,
  opacity: 0.55,
  colorBase: '#C5A059',
  colorHot: '#F5E3B3',
};

export interface ParticleSimulationHandle {
  readonly points: THREE.Points;
  readonly simSize: number;
  readonly particleCount: number;
  update(delta: number, mouseNDC: THREE.Vector2, qualityTier: QualityLevel): void;
  setCursor(world: THREE.Vector3, strength: number): void;
  setCursorActive(active: boolean): void;
  setSplines(data: SplineFieldData): void;
  setSimParams(partial: Partial<SimulationParams>): void;
  setRenderParams(partial: Partial<RenderParams>): void;
  dispose(): void;
}

/* ========================================================================== */
/*  ParticleSimulation                                                         */
/* ========================================================================== */

export class ParticleSimulation implements ParticleSimulationHandle {
  readonly simSize: number;
  readonly particleCount: number;
  readonly points: THREE.Points;

  /* ---- GPGPU renderer (passed at construction, stored for compute passes) - */
  private readonly renderer: THREE.WebGLRenderer;

  /* ---- FBO ping-pong pairs — [0] and [1] swapped each frame -------------- */
  private readonly posTargets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private readonly velTargets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private cur = 0;

  /* ---- Simulation pass infrastructure ------------------------------------- */
  private readonly simScene: THREE.Scene;
  private readonly simCamera: THREE.OrthographicCamera;
  private readonly simMesh: THREE.Mesh;

  /* ---- Materials ----------------------------------------------------------- */
  private readonly simMaterial: THREE.ShaderMaterial;
  private readonly posMaterial: THREE.ShaderMaterial;
  private readonly renderMaterial: THREE.ShaderMaterial;

  /* ---- Data textures — seeded once, updated on spline swap ---------------- */
  private initialPositions: THREE.DataTexture;
  private initialVelocities: THREE.DataTexture;
  private paramsTexture: THREE.DataTexture;

  /* ---- Baked spline field -------------------------------------------------- */
  private field: BakedSplineField | null = null;

  /* ---- Points geometry (dummy positions, lookup refs) --------------------- */
  private readonly pointsGeometry: THREE.BufferGeometry;

  /* ---- Pre-allocated state vectors (no per-frame allocation) -------------- */
  private time = 0;
  private seeded = false;
  private readonly cursorWorld = new THREE.Vector3();
  private readonly cursorSmooth = new THREE.Vector3();
  private readonly cursorTarget = new THREE.Vector3();
  private cursorStrengthTarget = 0;
  private cursorStrength = 0;

  /* ---- World bounds for NDC → world mapping ------------------------------- */
  private readonly worldBounds: WorldBounds;

  /* ---- Simulation + render tunables --------------------------------------- */
  private simParams: SimulationParams;
  private renderParams: RenderParams;

  /* ---- Context-lost recovery state ---------------------------------------- */
  private contextLost = false;
  private readonly onContextLost: () => void;
  private readonly onContextRestored: () => void;

  constructor(options: {
    renderer: THREE.WebGLRenderer;
    qualityTier: 'medium' | 'high';
    splineField: SplineFieldData;
    worldBounds?: Partial<WorldBounds>;
    simOverrides?: Partial<SimulationParams>;
    renderOverrides?: Partial<RenderParams>;
  }) {
    const {
      renderer,
      qualityTier,
      splineField,
      worldBounds: wbOverrides,
      simOverrides,
      renderOverrides,
    } = options;

    this.renderer = renderer;
    this.simParams = { ...DEFAULT_SIM_PARAMS, ...simOverrides };
    this.renderParams = { ...DEFAULT_RENDER_PARAMS, ...renderOverrides };
    this.worldBounds = { ...DEFAULT_WORLD_BOUNDS, ...wbOverrides };

    const size = TEXTURE_SIZES[qualityTier];
    this.simSize = size;
    this.particleCount = size * size;

    /* -- Seed spline field texture ------------------------------------------ */
    this.field = bakeSplineField(splineField);

    /* -- Allocate pixel buffers (4 floats per particle: x, y, z, w) -------- */
    const count = this.particleCount;
    const posBuffer = new Float32Array(count * 4);
    const velBuffer = new Float32Array(count * 4);
    const paramBuffer = new Float32Array(count * 4);

    const scatter = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const splineIdx = i % this.field.splineCount;
      const t = Math.random();
      this.field.curves[splineIdx].getPointAt(t, scatter);

      const idx = i * 4;
      // Position: on-spline with small jitter for organic feel
      posBuffer[idx] = scatter.x + (Math.random() - 0.5) * 0.4;
      posBuffer[idx + 1] = scatter.y + (Math.random() - 0.5) * 0.4;
      posBuffer[idx + 2] = scatter.z + (Math.random() - 0.5) * 0.4;
      posBuffer[idx + 3] = 1;

      // Per-particle metadata for the simulation shader:
      //   x = spline row v-coordinate (normalised 0..1)
      //   y = flow offset along spline (random initial t)
      //   z = individual flow speed
      //   w = noise seed for deterministic curl offset
      paramBuffer[idx] = (splineIdx + 0.5) / this.field.splineCount;
      paramBuffer[idx + 1] = t;
      paramBuffer[idx + 2] = 0.015 + Math.random() * 0.03;
      paramBuffer[idx + 3] = Math.random();
    }

    this.initialPositions = this.createDataTexture(posBuffer);
    this.initialVelocities = this.createDataTexture(velBuffer);
    this.paramsTexture = this.createDataTexture(paramBuffer);

    /* -- Render targets (ping-pong pairs) ---------------------------------- */
    this.posTargets = [this.createTarget(), this.createTarget()];
    this.velTargets = [this.createTarget(), this.createTarget()];

    /* -- Simulation pass --------------------------------------------------- */
    this.simScene = new THREE.Scene();
    this.simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.simMaterial = new THREE.ShaderMaterial({
      vertexShader: SIMULATION_VERTEX,
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
        uCursorWorld: { value: new THREE.Vector3() },
        uCursorStrength: { value: 0 },
        uCursorRadius: { value: this.simParams.cursorRadius },
        uCursorForce: { value: this.simParams.cursorForce },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.posMaterial = new THREE.ShaderMaterial({
      vertexShader: SIMULATION_VERTEX,
      fragmentShader: POSITION_FRAGMENT,
      uniforms: {
        tPosition: { value: null },
        tVelocity: { value: null },
        uDelta: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.simMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.simMaterial);
    this.simMesh.frustumCulled = false;
    this.simScene.add(this.simMesh);

    /* -- Render-pass geometry ---------------------------------------------- */
    this.pointsGeometry = new THREE.BufferGeometry();

    // Dummy position buffer (unused — shader fetches from sim texture).
    const dummyPositions = new Float32Array(count * 3);
    this.pointsGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(dummyPositions, 3),
    );

    // Texture-lookup refs: maps each vertex to a texel in the sim texture.
    const refs = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      refs[i * 2] = ((i % size) + 0.5) / size;
      refs[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size;
    }
    this.pointsGeometry.setAttribute('aRef', new THREE.BufferAttribute(refs, 2));

    // Null bounding sphere — particles are GPU-positioned, so frustum
    // culling must be disabled.
    (this.pointsGeometry as unknown as Record<string, unknown>).boundingSphere = null;

    this.renderMaterial = new THREE.ShaderMaterial({
      vertexShader: RENDER_VERTEX,
      fragmentShader: RENDER_FRAGMENT,
      uniforms: {
        tPosition: { value: this.initialPositions },
        tVelocity: { value: this.initialVelocities },
        uPointSize: { value: this.renderParams.pointSize },
        uPixelRatio: { value: 1 },
        uColorBase: { value: new THREE.Color(this.renderParams.colorBase) },
        uColorHot: { value: new THREE.Color(this.renderParams.colorHot) },
        uOpacity: { value: this.renderParams.opacity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    });

    this.points = new THREE.Points(this.pointsGeometry, this.renderMaterial);
    this.points.frustumCulled = false;

    /* -- Context-loss handlers --------------------------------------------- */
    this.onContextLost = () => {
      this.contextLost = true;
    };
    this.onContextRestored = () => {
      this.contextLost = false;
      this.seeded = false;
    };
  }

  /* ======================================================================== */
  /*  Public API                                                               */
  /* ======================================================================== */

  /**
   * Advance one simulation frame. Call once per animation frame.
   *
   * Performs two GPGPU passes on the stored renderer:
   *   1. Velocity update (simulation.frag)
   *   2. Position integration (position.frag)
   *
   * After both passes, the render material is fed the latest textures
   * for the display Points object.
   *
   * @param delta       Frame delta in seconds (clamped to 1/30s max).
   * @param mouseNDC    Normalised device coordinates [-1, 1] for cursor force.
   * @param qualityTier Current quality tier (used to gate update fidelity).
   */
  update(delta: number, mouseNDC: THREE.Vector2, qualityTier: QualityLevel): void {
    if (this.contextLost) return;
    if (qualityTier === 'low') return;

    const dt = Math.min(delta, MAX_DELTA_SEC);
    this.time += dt;

    // ── Convert NDC → world-space cursor position ────────────────────────
    const { xMin, xMax, yMin, yMax } = this.worldBounds;
    this.cursorTarget.set(
      THREE.MathUtils.mapLinear(mouseNDC.x, -1, 1, xMin, xMax),
      THREE.MathUtils.mapLinear(mouseNDC.y, -1, 1, yMin, yMax),
      0,
    );

    // Damped pointer smoothing — prevents twitchy force application.
    const alpha = 1 - Math.exp(-POINTER_SMOOTH_RATE * dt);
    this.cursorSmooth.lerp(this.cursorTarget, alpha);
    this.cursorStrength += (this.cursorStrengthTarget - this.cursorStrength) * alpha;

    const read = this.cur;
    const write = 1 - this.cur;

    // On the first frame (or after context restore), use the seed textures.
    const posRead = this.seeded
      ? this.posTargets[read].texture
      : this.initialPositions;
    const velRead = this.seeded
      ? this.velTargets[read].texture
      : this.initialVelocities;

    // ── Pass 1: Velocity update ───────────────────────────────────────────
    const su = this.simMaterial.uniforms;
    su.tPosition.value = posRead;
    su.tVelocity.value = velRead;
    su.uTime.value = this.time;
    su.uDelta.value = dt;
    (su.uCursorWorld.value as THREE.Vector3).copy(this.cursorSmooth);
    su.uCursorStrength.value = this.cursorStrength;

    this.simMesh.material = this.simMaterial;
    this.renderer.setRenderTarget(this.velTargets[write]);
    this.renderer.render(this.simScene, this.simCamera);

    // ── Pass 2: Position integration ──────────────────────────────────────
    const pu = this.posMaterial.uniforms;
    pu.tPosition.value = posRead;
    pu.tVelocity.value = this.velTargets[write].texture;
    pu.uDelta.value = dt;

    this.simMesh.material = this.posMaterial;
    this.renderer.setRenderTarget(this.posTargets[write]);
    this.renderer.render(this.simScene, this.simCamera);

    this.renderer.setRenderTarget(null);

    // ── Feed render material with latest textures ─────────────────────────
    const ru = this.renderMaterial.uniforms;
    ru.tPosition.value = this.posTargets[write].texture;
    ru.tVelocity.value = this.velTargets[write].texture;

    this.cur = write;
    this.seeded = true;
  }

  /**
   * Feed pre-computed cursor state from an external ForceField.
   * Use instead of `update()` when ForceField handles NDC→world projection.
   */
  setCursor(world: THREE.Vector3, strength: number): void {
    this.cursorTarget.copy(world);
    this.cursorStrengthTarget = strength;
  }

  /** Set cursor active state — used by ForceField to signal pointer presence. */
  setCursorActive(active: boolean): void {
    this.cursorStrengthTarget = active ? 1 : 0;
  }

  /** Hot-swap the spline field and re-seed particle positions. */
  setSplines(data: SplineFieldData): void {
    if (this.field) {
      this.field.dispose();
    }
    this.field = bakeSplineField(data);
    this.simMaterial.uniforms.tSpline.value = this.field.texture;

    const count = this.particleCount;
    const posBuffer = new Float32Array(count * 4);
    const paramBuffer = new Float32Array(count * 4);
    const scatter = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      const splineIdx = i % this.field.splineCount;
      const t = Math.random();
      this.field.curves[splineIdx].getPointAt(t, scatter);

      const idx = i * 4;
      posBuffer[idx] = scatter.x + (Math.random() - 0.5) * 0.3;
      posBuffer[idx + 1] = scatter.y + (Math.random() - 0.5) * 0.3;
      posBuffer[idx + 2] = scatter.z + (Math.random() - 0.5) * 0.3;
      posBuffer[idx + 3] = 1;

      paramBuffer[idx] = (splineIdx + 0.5) / this.field.splineCount;
      paramBuffer[idx + 1] = t;
      paramBuffer[idx + 2] = 0.015 + Math.random() * 0.03;
      paramBuffer[idx + 3] = Math.random();
    }

    this.initialPositions.dispose();
    this.paramsTexture.dispose();
    this.initialPositions = this.createDataTexture(posBuffer);
    this.paramsTexture = this.createDataTexture(paramBuffer);

    this.simMaterial.uniforms.tParams.value = this.paramsTexture;
    this.seeded = false;
  }

  /** Update simulation tunables without recreating materials. */
  setSimParams(partial: Partial<SimulationParams>): void {
    Object.assign(this.simParams, partial);
    const su = this.simMaterial.uniforms;
    if (partial.attraction !== undefined) su.uAttraction.value = partial.attraction;
    if (partial.curlStrength !== undefined) su.uCurlStrength.value = partial.curlStrength;
    if (partial.curlScale !== undefined) su.uCurlScale.value = partial.curlScale;
    if (partial.damping !== undefined) su.uDamping.value = partial.damping;
    if (partial.cursorRadius !== undefined) su.uCursorRadius.value = partial.cursorRadius;
    if (partial.cursorForce !== undefined) su.uCursorForce.value = partial.cursorForce;
  }

  /** Update render parameters at runtime (point size, opacity, colors). */
  setRenderParams(partial: Partial<RenderParams>): void {
    Object.assign(this.renderParams, partial);
    const ru = this.renderMaterial.uniforms;
    if (partial.pointSize !== undefined) ru.uPointSize.value = partial.pointSize;
    if (partial.opacity !== undefined) ru.uOpacity.value = partial.opacity;
    if (partial.colorBase !== undefined) (ru.uColorBase.value as THREE.Color).set(partial.colorBase);
    if (partial.colorHot !== undefined) (ru.uColorHot.value as THREE.Color).set(partial.colorHot);
  }

  /** Signal that the viewport device-pixel-ratio changed. */
  setPixelRatio(ratio: number): void {
    this.renderMaterial.uniforms.uPixelRatio.value = ratio;
  }

  /* ======================================================================== */
  /*  Context-loss recovery                                                    */
  /* ======================================================================== */

  /** Register WebGL context event listeners. Call after mounting. */
  bindContextRecovery(domElement: HTMLCanvasElement): void {
    domElement.addEventListener('webglcontextlost', this.onContextLost);
    domElement.addEventListener('webglcontextrestored', this.onContextRestored);
  }

  /** Remove WebGL context event listeners. Call before unmounting. */
  unbindContextRecovery(domElement: HTMLCanvasElement): void {
    domElement.removeEventListener('webglcontextlost', this.onContextLost);
    domElement.removeEventListener('webglcontextrestored', this.onContextRestored);
  }

  /* ======================================================================== */
  /*  Disposal — full resource cleanup (no leaks)                              */
  /* ======================================================================== */

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

  /* ======================================================================== */
  /*  Private helpers                                                          */
  /* ======================================================================== */

  private createDataTexture(data: Float32Array): THREE.DataTexture {
    const tex = new THREE.DataTexture(
      data as unknown as BufferSource,
      this.simSize,
      this.simSize,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }

  private createTarget(): THREE.WebGLRenderTarget {
    return new THREE.WebGLRenderTarget(this.simSize, this.simSize, {
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }
}

/* ========================================================================== */
/*  Factory — quality-tier-aware constructor                                  */
/* ========================================================================== */

/**
 * Create a ParticleSimulation for the given quality tier.
 * Returns null for 'low' tier — the caller should render a static fallback.
 */
export function createParticleSimulation(
  tier: QualityLevel,
  renderer: THREE.WebGLRenderer,
  field: SplineFieldData,
  simOverrides?: Partial<SimulationParams>,
  renderOverrides?: Partial<RenderParams>,
): ParticleSimulation | null {
  if (tier === 'low') return null;
  return new ParticleSimulation({
    renderer,
    qualityTier: tier,
    splineField: field,
    simOverrides,
    renderOverrides,
  });
}

export { TEXTURE_SIZES as TEXTURE_SIZE };
