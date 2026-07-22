/**
 * The Living Blueprint — GPGPU particle shaders (S15-FX-002).
 *
 * Shader pipeline:
 *   simulation.vert     → fullscreen quad, passes UV
 *   simulation.frag     → velocity update (curl noise + spline attraction +
 *                          cursor force + damping) → new velocity
 *   position.frag       → Euler integration (pos += vel * dt)
 *   render.vert         → billboarded point sprite from position texture,
 *                          perspective-correct size with per-particle jitter
 *   render.frag         → soft quintic disc falloff + 2-stage gold gradient LUT
 *                          + additive blending
 *
 * All shaders target WebGL2 with highp precision for stable GPGPU math.
 */

/* ========================================================================== */
/*  Shared GLSL — 3D Simplex noise for divergence-free curl fields             */
/* ========================================================================== */

/**
 * Simplex 3D noise — Ian McEwan, Ashima Arts (MIT).
 * Produces values in [-1, 1] with smooth, organic distribution.
 */
const SIMPLEX_3D = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  /**
   * Divergence-free curl of the noise field via central finite differences.
   * Produces swirling, incompressible motion — no sink/source artifacts.
   */
  vec3 curlNoise(vec3 p) {
    const float e = 0.12;
    float n1 = snoise(vec3(p.x, p.y + e, p.z));
    float n2 = snoise(vec3(p.x, p.y - e, p.z));
    float n3 = snoise(vec3(p.x, p.y, p.z + e));
    float n4 = snoise(vec3(p.x, p.y, p.z - e));
    float n5 = snoise(vec3(p.x + e, p.y, p.z));
    float n6 = snoise(vec3(p.x - e, p.y, p.z));

    float x = (n1 - n2) - (n3 - n4);
    float y = (n3 - n4) - (n5 - n6);
    float z = (n5 - n6) - (n1 - n2);
    return normalize(vec3(x, y, z) + 0.0001);
  }
`;

/* ========================================================================== */
/*  S-01: simulation.vert — fullscreen quad pass-through                       */
/* ========================================================================== */

/**
 * Minimal vertex shader used by both simulation passes (velocity update
 * and position integration). Renders a unit quad covering clip space
 * [-1, 1] so every fragment shader invocation processes exactly one
 * simulation texel.
 */
export const SIMULATION_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/* ========================================================================== */
/*  S-02: simulation.frag — velocity update (GPGPU)                            */
/* ========================================================================== */

/**
 * Computes the next-frame velocity for every particle in parallel.
 *
 * Per-particle inputs (from textures):
 *   tPosition  — current world-space position (read from previous frame)
 *   tVelocity  — current velocity (read from previous frame)
 *   tParams    — per-particle: x=splineRow, y=flowOffset, z=flowSpeed, w=seed
 *   tSpline    — baked spline lookup: u=curve parameter t, v=spline row
 *
 * Force contributions (all delta-scaled):
 *   1. Spline attraction — each particle chases a target moving along its
 *      assigned spline via flowOffset + time * flowSpeed
 *   2. Curl noise — divergence-free swirling from 3D simplex noise
 *   3. Cursor repulsion — radial impulse from NDC-converted world cursor
 *   4. Damping — exponential decay to prevent runaway orbits
 *
 * Velocity is clamped at 20 world-units/s to prevent numerical explosion
 * after tab-switch hitch recovery.
 */
export const SIMULATION_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D tPosition;
  uniform sampler2D tVelocity;
  uniform sampler2D tParams;
  uniform sampler2D tSpline;

  uniform float uTime;
  uniform float uDelta;
  uniform float uAttraction;
  uniform float uCurlStrength;
  uniform float uCurlScale;
  uniform float uDamping;

  uniform vec3  uCursorWorld;
  uniform float uCursorStrength;
  uniform float uCursorRadius;
  uniform float uCursorForce;

  varying vec2 vUv;

  ${SIMPLEX_3D}

  void main() {
    vec3 pos    = texture2D(tPosition, vUv).xyz;
    vec3 vel    = texture2D(tVelocity, vUv).xyz;
    vec4 params = texture2D(tParams, vUv);

    // ── 1. Spline flow attraction ─────────────────────────────────────────
    // Each particle is assigned to a spline row (params.x) with a random
    // flow offset (params.y) and individual speed (params.z). The target
    // advances along the spline each frame, creating a continuous flow.
    float flowT  = fract(params.y + uTime * params.z);
    vec3  target = texture2D(tSpline, vec2(flowT, params.x)).xyz;
    vec3  toTarget = target - pos;
    vel += toTarget * uAttraction * uDelta;

    // ── 2. Curl noise drift ───────────────────────────────────────────────
    // Per-particle deterministic noise seed (params.w) creates unique orbits.
    // The curl field is sampled in world space, scaled by uCurlScale for
    // spatial frequency control and animated with time for living motion.
    vec3 curl = curlNoise(pos * uCurlScale + uTime * 0.08 + params.w * 10.0);
    vel += curl * uCurlStrength * uDelta;

    // ── 3. Cursor force field ─────────────────────────────────────────────
    // Radial repulsion from the cursor world position. Uses smoothstep for
    // zero-derivative edge falloff — particles near the boundary feel a
    // smooth fade rather than a hard cutoff.
    vec3  fromCursor = pos - uCursorWorld;
    float dist       = length(fromCursor);
    float falloff    = 1.0 - smoothstep(0.0, uCursorRadius, dist);
    vec3  cursorDir  = normalize(fromCursor + 0.0001);
    // Push particles away from the cursor: outward radial impulse.
    // Strength is modulated by uCursorStrength (0 when cursor is idle).
    vel += cursorDir * falloff * uCursorForce * uCursorStrength * uDelta;

    // ── 4. Damping ────────────────────────────────────────────────────────
    // Framerate-independent exponential decay: vel *= e^(-damping * dt).
    // Higher damping = particles settle faster toward spline targets.
    vel *= exp(-uDamping * uDelta);

    // ── Clamp ─────────────────────────────────────────────────────────────
    float speed = length(vel);
    if (speed > 20.0) {
      vel = (vel / speed) * 20.0;
    }

    gl_FragColor = vec4(vel, 1.0);
  }
`;

/* ========================================================================== */
/*  S-03: position.frag — Euler integration                                    */
/* ========================================================================== */

/**
 * Reads the position from the previous frame and the just-computed velocity,
 * then performs a simple forward Euler step: pos' = pos + vel * dt.
 *
 * This is run as a second fullscreen pass for two reasons:
 *   1. WebGL1 compatibility (avoids MRT requirement)
 *   2. Clear separation of concerns — velocity logic stays isolated
 */
export const POSITION_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D tPosition;
  uniform sampler2D tVelocity;
  uniform float uDelta;

  varying vec2 vUv;

  void main() {
    vec3 pos = texture2D(tPosition, vUv).xyz;
    vec3 vel = texture2D(tVelocity, vUv).xyz;
    gl_FragColor = vec4(pos + vel * uDelta, 1.0);
  }
`;

/* ========================================================================== */
/*  S-04: render.vert — billboarded point sprite from sim texture              */
/* ========================================================================== */

/**
 * Transforms GPU-simulated particle positions into clip space for rendering.
 *
 * Key features:
 *  - Reads world-space position from the simulation texture (tPosition)
 *  - Reads velocity for energy-driven brightness in the fragment shader
 *  - Perspective-correct point sizing: size *= pixelRatio / -mvPosition.z
 *  - Per-particle deterministic jitter via a seed from the lookup UV
 *  - Billboarded by nature of GL_POINTS rendering
 */
export const RENDER_VERTEX = /* glsl */ `
  precision highp float;

  uniform sampler2D tPosition;
  uniform sampler2D tVelocity;
  uniform float uPointSize;
  uniform float uPixelRatio;

  attribute vec2 aRef;

  varying float vEnergy;
  varying float vSeed;

  void main() {
    // Fetch the actual world-space position from the simulation texture.
    vec3 pos = texture2D(tPosition, aRef).xyz;
    vec3 vel = texture2D(tVelocity, aRef).xyz;

    // Energy drives brightness + warmth in the fragment shader.
    // Faster particles = hotter, brighter cores (champagne → gold → white).
    vEnergy = clamp(length(vel) * 0.6, 0.0, 1.0);

    // Deterministic per-particle seed from lookup reference UV.
    // Powers subtle brightness variation in the fragment shader so the
    // field feels alive rather than uniformly lit.
    vSeed = fract(aRef.x * 157.31 + aRef.y * 113.97);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective-correct point size with per-particle jitter.
    // Larger particles on medium tier (fewer particles → larger to fill space).
    float size = uPointSize * (0.6 + vSeed * 0.8);
    gl_PointSize = size * uPixelRatio * (1.0 / -mvPosition.z);
  }
`;

/* ========================================================================== */
/*  S-05: render.frag — soft additive gold sprite + 2-stage gradient LUT       */
/* ========================================================================== */

/**
 * Renders each particle as a soft, additive-blended disc with a hand-tuned
 * gold gradient that grades from deep champagne (#C5A059) through bright
 * gold (#F5E3B3) to warm ivory-white at peak energy.
 *
 * Design decisions:
 *  - Quintic (^5) falloff: zero first + second derivatives at the disc edge
 *    for buttery-smooth blending with no visible halo boundary
 *  - Two-stage gradient LUT: stage 1 (champagne→gold, energy 0→0.65) and
 *    stage 2 (gold→ivory, energy 0.65→1.0) for natural metallic sheen
 *  - Per-particle energy variation: fast particles glow brighter and warmer,
 *    creating natural "core" highlights that feed the bloom pass
 *  - AdditiveBlending: particles accumulate in screen space, so dense
 *    regions glow brighter without saturating (film-like roll-off)
 */
export const RENDER_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec3 uColorBase;   // deep champagne #C5A059
  uniform vec3 uColorHot;    // bright ivory-gold #F5E3B3
  uniform float uOpacity;

  varying float vEnergy;
  varying float vSeed;

  void main() {
    // ── Soft radial disc (no texture fetch needed) ────────────────────────
    // gl_PointCoord ranges [0,1] in the point sprite. Transform to [-1,1]
    // for a centered radial distance check.
    vec2 cxy = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) discard;

    // Quintic smoothstep: disc = (1 - r²)^5
    // This gives a buttery-soft edge with zero derivatives at r=1,
    // eliminating the harsh ring that quadratic (^2) or cubic (^3)
    // falloffs produce against dark backgrounds.
    float disc = 1.0 - r2;
    float alpha = disc * disc * disc * disc * disc;

    // ── 2-stage gold gradient LUT ─────────────────────────────────────────
    // Stage 1 (0.0 → 0.65): deep champagne → bright gold
    // Stage 2 (0.65 → 1.0): bright gold → ivory-white glow
    //
    // The energy value drives the transition: slow particles stay cool
    // and deep-champagne; fast particles heat up through gold to white.
    float t = vEnergy;

    // Subtle per-particle variation (±6%) so the field breathes with
    // organic micro-diversity rather than looking procedurally uniform.
    t += vSeed * 0.12;

    float stage1T = smoothstep(0.0, 0.65, t);
    float stage2T = smoothstep(0.65, 1.0, t);

    vec3 gold = mix(uColorBase, uColorHot, stage1T);
    // Warm ivory-white (not pure white — keeps the metallic character).
    vec3 ivory = vec3(1.0, 0.95, 0.85);
    vec3 finalColor = mix(gold, ivory, stage2T * 0.7);

    // Boost luminance for high-energy cores (feeds the bloom pass).
    // Multiplier ramps from 0.8 (low energy) to 1.7 (peak energy).
    finalColor *= 0.8 + vEnergy * 0.9;

    gl_FragColor = vec4(finalColor, alpha * uOpacity);
  }
`;

/* ========================================================================== */
/*  Re-exports under both naming conventions for backward compatibility        */
/* ========================================================================== */

/** @deprecated Use SIMULATION_VERTEX */
export const SIM_VERTEX = SIMULATION_VERTEX;
