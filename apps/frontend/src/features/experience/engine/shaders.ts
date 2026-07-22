/**
 * The Living Blueprint — GPGPU particle shaders (S15-FX-002).
 *
 * Shader pipeline:
 *   SIM_VERTEX        → fullscreen quad pass-through
 *   SIMULATION_FRAGMENT → velocity update (curl + spline + cursor + damping)
 *   POSITION_FRAGMENT → Euler integration (pos += vel * dt)
 *   RENDER_VERTEX     → transform from sim texture to clip space
 *   RENDER_FRAGMENT   → soft additive gold sprite with LUT gradient
 *
 * All motion is delta-scaled — no cumulative frame-rate-dependent drift.
 */

/* -------------------------------------------------------------------------- */
/*  Shared GLSL chunks                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Simplex 3D noise — Ian McEwan, Ashima Arts (MIT).
 * Embedded GLSL standard for deriving divergence-free curl fields.
 */
const SIMPLEX_NOISE = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
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
    vec3 ns = n_ * D.wyz - D.xzx;

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

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  /**
   * Divergence-free curl of the noise field via central finite differences.
   * This produces swirling, incompressible motion — no sink/source artifacts.
   */
  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
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

/* -------------------------------------------------------------------------- */
/*  S-01: Fullscreen quad vertex                                               */
/* -------------------------------------------------------------------------- */

/** Passes UV through; used by both simulation passes. */
export const SIM_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

/* -------------------------------------------------------------------------- */
/*  S-02: Simulation fragment — velocity update (GPGPU)                        */
/* -------------------------------------------------------------------------- */

export const SIMULATION_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D tPosition;
  uniform sampler2D tVelocity;
  /** Per-particle: x = splineRow, y = flowOffset, z = flowSpeed, w = seed */
  uniform sampler2D tParams;
  /** Baked spline lookup: u = curve t, v = spline row index */
  uniform sampler2D tSpline;

  uniform float uTime;
  uniform float uDelta;
  uniform float uAttraction;
  uniform float uCurlStrength;
  uniform float uCurlScale;
  uniform float uDamping;

  uniform vec3  uPointer;
  uniform float uPointerStrength;
  uniform float uPointerRadius;
  uniform float uPointerForce;

  varying vec2 vUv;

  ${SIMPLEX_NOISE}

  void main() {
    vec3 pos    = texture2D(tPosition, vUv).xyz;
    vec3 vel    = texture2D(tVelocity, vUv).xyz;
    vec4 params = texture2D(tParams, vUv);

    // ── Spline flow attraction ──────────────────────────────────────────
    // Each particle chases a target that moves along its assigned spline.
    // flowT wraps thanks to the spline texture's RepeatWrapping.
    float flowT   = fract(params.y + uTime * params.z);
    vec3  target  = texture2D(tSpline, vec2(flowT, params.x)).xyz;
    vec3  toTarget = target - pos;
    vel += toTarget * uAttraction * uDelta;

    // ── Curl noise drift (divergence-free, organic swirling) ────────────
    // Seed varies per particle, creating unique orbits that never collide.
    vec3 curl = curlNoise(pos * uCurlScale + uTime * 0.08 + params.w * 10.0);
    vel += curl * uCurlStrength * uDelta;

    // ── Cursor force field (S15-FX-004) ─────────────────────────────────
    // Radial impulse radiating from the pointer intersection point.
    // Uses smoothstep for a soft, zero-derivative edge.
    vec3  fromPtr = pos - uPointer;
    float dist    = length(fromPtr);
    float falloff = 1.0 - smoothstep(0.0, uPointerRadius, dist);
    // Combine falloff with configured force and delta scaling.
    vel += normalize(fromPtr + 0.0001) * falloff * uPointerForce * uPointerStrength * uDelta;

    // ── Damping (framerate-independent exponential decay) ───────────────
    vel *= exp(-uDamping * uDelta);

    // Clamp extreme velocities to prevent numerical explosion.
    float speed = length(vel);
    if (speed > 20.0) {
      vel = (vel / speed) * 20.0;
    }

    gl_FragColor = vec4(vel, 1.0);
  }
`;

/* -------------------------------------------------------------------------- */
/*  S-03: Position integration                                                 */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  S-04: Render vertex — position fetch + clip-space transform                */
/* -------------------------------------------------------------------------- */

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

    // "Energy" drives brightness + warmth in the fragment shader.
    // Faster particles = hotter cores (champagne → gold → white).
    vEnergy = clamp(length(vel) * 0.6, 0.0, 1.0);
    // Deterministic per-particle seed from the lookup reference UV.
    vSeed = fract(aRef.x * 157.31 + aRef.y * 113.97);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective-correct point size with per-particle jitter.
    // Larger points on medium tier (fewer particles → larger to fill space).
    float size = uPointSize * (0.6 + vSeed * 0.8);
    gl_PointSize = size * uPixelRatio * (1.0 / -mvPosition.z);
  }
`;

/* -------------------------------------------------------------------------- */
/*  S-05: Render fragment — soft additive gold sprite + LUT gradient           */
/* -------------------------------------------------------------------------- */

export const RENDER_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec3 uColorBase;   // deep champagne (#C5A059)
  uniform vec3 uColorHot;    // bright ivory-gold (#F5E3B3)
  uniform float uOpacity;

  varying float vEnergy;
  varying float vSeed;

  void main() {
    // ── Soft radial disc (no texture fetch) ─────────────────────────────
    vec2 cxy = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) discard;

    // Quintic smoothstep disc for a buttery falloff (zero derivative at edge).
    // Feels far more premium than the quadratic alternative.
    float disc = 1.0 - r2;
    float alpha = disc * disc * disc;

    // ── Gold gradient LUT ───────────────────────────────────────────────
    // Ramp: deep champagne (base) → bright gold (hot) → white (peak energy).
    // The 't' parameter maps energy through a hand-tuned curve:
    //   low energy → stays near deep champagne
    //   mid energy → shifts toward bright gold
    //   high energy → pushes toward ivory-white glow
    //
    // This creates a natural "glow core" on fast particles that feeds
    // beautifully into the bloom pass.
    float t = vEnergy;
    // Subtle per-particle variation so the field feels alive, not uniform.
    t += vSeed * 0.12;

    // Two-stage gradient:
    //   stage 1 (champagne → gold):  0.0 → 0.65
    //   stage 2 (gold → white):      0.65 → 1.0
    float stage1T = smoothstep(0.0, 0.65, t);
    float stage2T = smoothstep(0.65, 1.0, t);
    vec3 gold = mix(uColorBase, uColorHot, stage1T);
    vec3 finalColor = mix(gold, vec3(1.0, 0.95, 0.85), stage2T * 0.7);

    // Boost luminance for high-energy particles (bloom pass lives on luminance).
    finalColor *= 0.8 + vEnergy * 0.9;

    gl_FragColor = vec4(finalColor, alpha * uOpacity);
  }
`;
