/**
 * The Living Blueprint — GPGPU particle shaders (S15-FX-002).
 *
 * Two simulation passes (velocity, then position) ping-pong between float
 * render targets; the render pass draws each texel of the position texture
 * as a soft additive sprite. All motion is delta-scaled — no cumulative
 * frame-rate-dependent drift.
 */

/* -------------------------------------------------------------------------- */
/*  Shared chunks                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Simplex 3D noise by Ian McEwan, Ashima Arts (MIT). The de-facto standard
 * embedded GLSL noise — used here to derive a divergence-free curl field.
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

  /** Divergence-free curl of the noise field via finite differences. */
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

/** Fullscreen quad vertex shader shared by both simulation passes. */
export const SIM_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

/* -------------------------------------------------------------------------- */
/*  Pass 1 — velocity update                                                   */
/* -------------------------------------------------------------------------- */

export const VELOCITY_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D tPosition;
  uniform sampler2D tVelocity;
  /** Per-particle static params: x = spline row (0..1), y = t offset, z = flow speed, w = seed. */
  uniform sampler2D tParams;
  /** Baked spline samples: u = curve parameter t, v = spline row. */
  uniform sampler2D tSpline;

  uniform float uTime;
  uniform float uDelta;
  uniform float uAttraction;
  uniform float uCurlStrength;
  uniform float uCurlScale;
  uniform float uDamping;

  uniform vec3 uPointer;
  uniform float uPointerStrength;
  uniform float uPointerRadius;

  varying vec2 vUv;

  ${SIMPLEX_NOISE}

  void main() {
    vec3 pos = texture2D(tPosition, vUv).xyz;
    vec3 vel = texture2D(tVelocity, vUv).xyz;
    vec4 params = texture2D(tParams, vUv);

    // --- Spline flow attraction -------------------------------------------
    // Each particle chases a target point that travels along its spline.
    float flowT = fract(params.y + uTime * params.z);
    vec3 target = texture2D(tSpline, vec2(flowT, params.x)).xyz;
    vec3 toTarget = target - pos;
    vel += toTarget * uAttraction * uDelta;

    // --- Curl noise drift (organic, divergence-free) ----------------------
    vec3 curl = curlNoise(pos * uCurlScale + uTime * 0.08 + params.w * 10.0);
    vel += curl * uCurlStrength * uDelta;

    // --- Cursor force field (S15-FX-004) ----------------------------------
    // Radial repulsion with smooth falloff; strength driven from JS and is
    // zero on coarse pointers / low tiers.
    vec3 fromPointer = pos - uPointer;
    float dist = length(fromPointer);
    float falloff = 1.0 - smoothstep(0.0, uPointerRadius, dist);
    vel += normalize(fromPointer + 0.0001) * falloff * uPointerStrength * uDelta;

    // --- Damping (frame-rate independent) ---------------------------------
    vel *= exp(-uDamping * uDelta);

    gl_FragColor = vec4(vel, 1.0);
  }
`;

/* -------------------------------------------------------------------------- */
/*  Pass 2 — position integration                                              */
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
/*  Render pass — soft additive gold sprites                                   */
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
    vec3 pos = texture2D(tPosition, aRef).xyz;
    vec3 vel = texture2D(tVelocity, aRef).xyz;

    // "Energy" drives brightness + hue: fast particles glow hotter.
    vEnergy = clamp(length(vel) * 0.6, 0.0, 1.0);
    vSeed = fract(aRef.x * 157.31 + aRef.y * 113.97);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective-correct sizing with a slight per-particle variance.
    float size = uPointSize * (0.6 + vSeed * 0.8);
    gl_PointSize = size * uPixelRatio * (1.0 / -mvPosition.z);
  }
`;

export const RENDER_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec3 uColorBase;
  uniform vec3 uColorHot;
  uniform float uOpacity;

  varying float vEnergy;
  varying float vSeed;

  void main() {
    // Soft radial sprite — no texture fetch needed.
    vec2 cxy = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) discard;
    float alpha = (1.0 - r2) * (1.0 - r2);

    // Champagne base -> brighter gold at high energy (feeds bloom on high tier).
    vec3 color = mix(uColorBase, uColorHot, vEnergy * 0.85 + vSeed * 0.15);
    color *= 0.8 + vEnergy * 0.9;

    gl_FragColor = vec4(color, alpha * uOpacity);
  }
`;
