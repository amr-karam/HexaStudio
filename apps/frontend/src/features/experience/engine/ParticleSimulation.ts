/**
 * ParticleSimulation (S15-FX-001) — GPGPU engine for The Living Blueprint.
 *
 * Architecture: two ping-pong FBO pairs (position, velocity). Each frame:
 *   1. velocity pass — spline attraction + curl noise + cursor force, damped
 *   2. position pass — Euler integration
 *   3. render pass  — Points geometry reads the fresh position texture
 *
 * Pure Three.js class (no React) so the persistent stage of S-016 can own
 * one instance across scenes. Zero per-frame allocations after construction.
 * All GPU resources are released via dispose() — the anti-leak protocol of
 * THREEJS_GUIDE.md applies.
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  FloatType,
  HalfFloatType,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';

import { bakeSplineField, type BakedSplineField, type SplineFieldData } from './SplineField';
import {
  POSITION_FRAGMENT,
  RENDER_FRAGMENT,
  RENDER_VERTEX,
  SIM_VERTEX,
  VELOCITY_FRAGMENT,
} from './shaders';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ParticleSimulationOptions {
  /** Simulation texture edge — particle count is size². 128 → 16k, 256 → 65k. */
  size: number;
  field: SplineFieldData;
  colorBase?: string;
  colorHot?: string;
  pointSize?: number;
  opacity?: number;
  attraction?: number;
  curlStrength?: number;
  curlScale?: number;
  damping?: number;
}

const MAX_DELTA = 1 / 30; // clamp integration after tab switches / hitches

/* -------------------------------------------------------------------------- */
/*  Simulation                                                                 */
/* -------------------------------------------------------------------------- */

export class ParticleSimulation {
  readonly points: Points;

  private readonly simScene: Scene;
  private readonly simCamera: OrthographicCamera;
  private readonly simMesh: Mesh;

  private posTargets: [WebGLRenderTarget, WebGLRenderTarget];
  private velTargets: [WebGLRenderTarget, WebGLRenderTarget];
  private cur = 0; // index of the CURRENT (read) target

  private readonly velocityMaterial: ShaderMaterial;
  private readonly positionMaterial: ShaderMaterial;
  private readonly renderMaterial: ShaderMaterial;

  private readonly initialPositions: DataTexture;
  private readonly initialVelocities: DataTexture;
  private readonly params: DataTexture;
  private readonly field: BakedSplineField;
  private readonly geometry: BufferGeometry;

  private time = 0;
  private seeded = false;

  /** Smoothed pointer state — written from React, consumed in step(). */
  readonly pointerTarget = new Vector3(0, 0, 0);
  private pointerStrengthTarget = 0;
  private readonly pointer = new Vector3(0, 0, 0);
  private pointerStrength = 0;

  constructor(options: ParticleSimulationOptions) {
    const {
      size,
      field,
      colorBase = '#C5A059',
      colorHot = '#F5E3B3',
      pointSize = 36,
      opacity = 0.55,
      attraction = 2.2,
      curlStrength = 0.65,
      curlScale = 0.35,
      damping = 1.6,
    } = options;

    const count = size * size;
    this.field = bakeSplineField(field);

    /* ---- Seed textures (positions scattered along splines) --------------- */

    const posData = new Float32Array(count * 4);
    const velData = new Float32Array(count * 4); // zeros
    const paramData = new Float32Array(count * 4);
    const scatter = new Vector3();

    for (let i = 0; i < count; i++) {
      const splineIdx = i % this.field.splineCount;
      const t = Math.random();
      this.field.curves[splineIdx].getPointAt(t, scatter);

      const idx = i * 4;
      posData[idx] = scatter.x + (Math.random() - 0.5) * 0.4;
      posData[idx + 1] = scatter.y + (Math.random() - 0.5) * 0.4;
      posData[idx + 2] = scatter.z + (Math.random() - 0.5) * 0.4;
      posData[idx + 3] = 1;

      // x: spline row center in v-space, y: flow offset, z: flow speed, w: seed
      paramData[idx] = (splineIdx + 0.5) / this.field.splineCount;
      paramData[idx + 1] = t;
      paramData[idx + 2] = 0.015 + Math.random() * 0.03;
      paramData[idx + 3] = Math.random();
    }

    this.initialPositions = makeDataTexture(posData, size);
    this.initialVelocities = makeDataTexture(velData, size);
    this.params = makeDataTexture(paramData, size);

    /* ---- Render targets --------------------------------------------------- */

    this.posTargets = [makeTarget(size), makeTarget(size)];
    this.velTargets = [makeTarget(size), makeTarget(size)];

    /* ---- Simulation pass plumbing ----------------------------------------- */

    this.simScene = new Scene();
    this.simCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.velocityMaterial = new ShaderMaterial({
      vertexShader: SIM_VERTEX,
      fragmentShader: VELOCITY_FRAGMENT,
      uniforms: {
        tPosition: { value: null },
        tVelocity: { value: null },
        tParams: { value: this.params },
        tSpline: { value: this.field.texture },
        uTime: { value: 0 },
        uDelta: { value: 0 },
        uAttraction: { value: attraction },
        uCurlStrength: { value: curlStrength },
        uCurlScale: { value: curlScale },
        uDamping: { value: damping },
        uPointer: { value: new Vector3() },
        uPointerStrength: { value: 0 },
        uPointerRadius: { value: 1.6 },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.positionMaterial = new ShaderMaterial({
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

    this.simMesh = new Mesh(new PlaneGeometry(2, 2), this.velocityMaterial);
    this.simMesh.frustumCulled = false;
    this.simScene.add(this.simMesh);

    /* ---- Render pass ------------------------------------------------------ */

    // Each vertex is a reference UV into the simulation textures. The
    // position attribute exists only because BufferGeometry requires one.
    this.geometry = new BufferGeometry();
    const refs = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      refs[i * 2] = ((i % size) + 0.5) / size;
      refs[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size;
    }
    this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
    this.geometry.setAttribute('aRef', new BufferAttribute(refs, 2));
    // The GPU decides real positions; disable culling so points never vanish.
    this.geometry.boundingSphere = null;

    this.renderMaterial = new ShaderMaterial({
      vertexShader: RENDER_VERTEX,
      fragmentShader: RENDER_FRAGMENT,
      uniforms: {
        tPosition: { value: this.initialPositions },
        tVelocity: { value: this.initialVelocities },
        uPointSize: { value: pointSize },
        uPixelRatio: { value: 1 },
        uColorBase: { value: new Color(colorBase) },
        uColorHot: { value: new Color(colorHot) },
        uOpacity: { value: opacity },
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    });

    this.points = new Points(this.geometry, this.renderMaterial);
    this.points.frustumCulled = false;
  }

  /* ------------------------------------------------------------------------ */
  /*  Per-frame step                                                           */
  /* ------------------------------------------------------------------------ */

  /**
   * Advance the simulation. Callers gate this on the motion policy: when the
   * scene is paused/reduced, simply don't call step() — the render material
   * keeps sampling the last written textures, freezing the field in place.
   */
  step(renderer: WebGLRenderer, rawDelta: number, pixelRatio: number): void {
    const delta = Math.min(rawDelta, MAX_DELTA);
    this.time += delta;

    // Smooth the pointer toward its target (framerate-normalized lerp) so
    // force application feels damped, never twitchy.
    const alpha = 1 - Math.exp(-8 * delta);
    this.pointer.lerp(this.pointerTarget, alpha);
    this.pointerStrength += (this.pointerStrengthTarget - this.pointerStrength) * alpha;

    const read = this.cur;
    const write = 1 - this.cur;

    const posRead = this.seeded ? this.posTargets[read].texture : this.initialPositions;
    const velRead = this.seeded ? this.velTargets[read].texture : this.initialVelocities;

    // --- Pass 1: velocity ---------------------------------------------------
    const vu = this.velocityMaterial.uniforms;
    vu.tPosition.value = posRead;
    vu.tVelocity.value = velRead;
    vu.uTime.value = this.time;
    vu.uDelta.value = delta;
    (vu.uPointer.value as Vector3).copy(this.pointer);
    vu.uPointerStrength.value = this.pointerStrength;

    this.simMesh.material = this.velocityMaterial;
    renderer.setRenderTarget(this.velTargets[write]);
    renderer.render(this.simScene, this.simCamera);

    // --- Pass 2: position ----------------------------------------------------
    const pu = this.positionMaterial.uniforms;
    pu.tPosition.value = posRead;
    pu.tVelocity.value = this.velTargets[write].texture;
    pu.uDelta.value = delta;

    this.simMesh.material = this.positionMaterial;
    renderer.setRenderTarget(this.posTargets[write]);
    renderer.render(this.simScene, this.simCamera);

    renderer.setRenderTarget(null);

    // --- Feed render pass -----------------------------------------------------
    const ru = this.renderMaterial.uniforms;
    ru.tPosition.value = this.posTargets[write].texture;
    ru.tVelocity.value = this.velTargets[write].texture;
    ru.uPixelRatio.value = pixelRatio;

    this.cur = write;
    this.seeded = true;
  }

  /** Cursor force field input (S15-FX-004). World-space point + strength. */
  setPointer(world: Vector3, strength: number): void {
    this.pointerTarget.copy(world);
    this.pointerStrengthTarget = strength;
  }

  /* ------------------------------------------------------------------------ */
  /*  Disposal — anti-leak protocol                                            */
  /* ------------------------------------------------------------------------ */

  dispose(): void {
    this.posTargets.forEach((t) => t.dispose());
    this.velTargets.forEach((t) => t.dispose());
    this.velocityMaterial.dispose();
    this.positionMaterial.dispose();
    this.renderMaterial.dispose();
    this.simMesh.geometry.dispose();
    this.geometry.dispose();
    this.initialPositions.dispose();
    this.initialVelocities.dispose();
    this.params.dispose();
    this.field.dispose();
  }
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function makeDataTexture(data: Float32Array<ArrayBuffer>, size: number): DataTexture {
  const tex = new DataTexture(data, size, size, RGBAFormat, FloatType);
  tex.minFilter = NearestFilter;
  tex.magFilter = NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function makeTarget(size: number): WebGLRenderTarget {
  return new WebGLRenderTarget(size, size, {
    format: RGBAFormat,
    // HalfFloat: renderable on effectively all WebGL2 devices, half the VRAM.
    type: HalfFloatType,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
}
