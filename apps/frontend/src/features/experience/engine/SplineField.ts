/**
 * SplineField (S15-FX-003) — flow-path authoring for the Living Blueprint.
 *
 * A field is a named collection of Catmull‑Rom splines. Each spline is baked
 * row-by-row into a Float DataTexture (RGBA, u = curve parameter t, v = spline
 * row index) so the simulation shader can resolve "where should this particle
 * flow to?" with a single texture fetch.
 *
 * Features:
 *  - Catmull‑Rom spline interpolation with configurable tension / curve type
 *  - Pre‑authored named sets: hero‑vortex, architecture‑grid, transition‑dissolve
 *  - JSON‑authorable format: `{ name, tension, closed, points: Vec3[] }`
 *  - Set‑to‑set morphing: lerp control points between two sets, re‑bake
 *  - CPU‑side nearest‑segment query: find closest spline point + tangent
 *  - RepeatWrapping on lookup texture for seamless t=0→1 wrap
 */
import * as THREE from 'three';

/* ========================================================================== */
/*  Types                                                                      */
/* ========================================================================== */

/** A single spline definition — JSON‑authorable. */
export interface SplineDef {
  /** Control points in world space [x, y, z]. */
  points: [number, number, number][];
  /** Catmull‑Rom curve type. Default: 'centripetal' for even-parameterised loops. */
  curveType?: 'centripetal' | 'chordal' | 'catmullrom';
  /** Tension (0..1), only used when curveType is 'catmullrom'. */
  tension?: number;
  /** Whether the spline loops back to its start. Default: true. */
  closed?: boolean;
}

/** A named collection of splines for drop‑in JSON authoring. */
export interface SplineFieldData {
  name: string;
  splines: SplineDef[];
}

/** Baked field ready for GPU consumption. */
export interface BakedSplineField {
  /** Position lookup texture: u = t along curve (0..1), v = spline row index. */
  texture: THREE.DataTexture;
  splineCount: number;
  /** CPU curves — for scattering initial positions and nearest‑segment queries. */
  curves: THREE.CatmullRomCurve3[];
  /** Original field name for debugging / morph tracking. */
  name: string;
  /** Release GPU + CPU resources. */
  dispose: () => void;
}

/** Result of a nearest-point-on-spline query. */
export interface NearestSplinePoint {
  /** Closest world-space point on the spline. */
  point: THREE.Vector3;
  /** Tangent direction at the closest point (for attraction force computation). */
  tangent: THREE.Vector3;
  /** Distance from query point to nearest spline point in world units. */
  distance: number;
  /** Index of the spline within the field (0‑based). */
  splineIndex: number;
  /** Curve parameter t (0‑1) at the closest point. */
  parameterT: number;
}

/* ========================================================================== */
/*  Baking                                                                     */
/* ========================================================================== */

const SAMPLES_PER_SPLINE = 256;

/**
 * Bake a SplineFieldData into GPU textures and CPU curves.
 *
 * Each spline becomes one row (v-coordinate) of the output texture. Within
 * each row, `SAMPLES_PER_SPLINE` points are sampled uniformly by arc‑length
 * (getPointAt), producing a u‑coordinate from 0→1 that wraps via
 * RepeatWrapping.
 */
export function bakeSplineField(data: SplineFieldData): BakedSplineField {
  const splineCount = data.splines.length;
  const pixels = new Float32Array(SAMPLES_PER_SPLINE * splineCount * 4);

  const curves = data.splines.map((def) => {
    const pts = def.points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const closed = def.closed ?? true;
    const curveType = def.curveType ?? 'centripetal';
    const tension = def.tension ?? 0.5;
    return new THREE.CatmullRomCurve3(pts, closed, curveType, tension);
  });

  const sample = new THREE.Vector3();
  curves.forEach((curve, row) => {
    for (let i = 0; i < SAMPLES_PER_SPLINE; i++) {
      const t = i / (SAMPLES_PER_SPLINE - 1);
      curve.getPointAt(t, sample);
      const idx = (row * SAMPLES_PER_SPLINE + i) * 4;
      pixels[idx] = sample.x;
      pixels[idx + 1] = sample.y;
      pixels[idx + 2] = sample.z;
      pixels[idx + 3] = 1;
    }
  });

  const texture = new THREE.DataTexture(
    pixels,
    SAMPLES_PER_SPLINE,
    splineCount,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  return {
    texture,
    splineCount,
    curves,
    name: data.name,
    dispose: () => texture.dispose(),
  };
}

/* ========================================================================== */
/*  Nearest‑point query (CPU)                                                  */
/* ========================================================================== */

const _scratchVec = new THREE.Vector3();
const _scratchTan = new THREE.Vector3();

/**
 * Find the nearest point on any spline in the baked field to the given
 * world-space position. Returns the point, tangent, distance, and spline
 * metadata — useful for cursor attraction, editor snapping, and force
 * field computations.
 *
 * @param worldPos        Query position in world space.
 * @param field           Pre‑baked spline field.
 * @param samplesPerCurve Number of sample points per curve for the search
 *                        (default 64 — adequate for smooth fields).
 */
export function nearestSegment(
  worldPos: THREE.Vector3,
  field: BakedSplineField,
  samplesPerCurve = 64,
): NearestSplinePoint {
  const best: NearestSplinePoint = {
    point: new THREE.Vector3(),
    tangent: new THREE.Vector3(),
    distance: Infinity,
    splineIndex: 0,
    parameterT: 0,
  };

  for (let s = 0; s < field.curves.length; s++) {
    const curve = field.curves[s];
    for (let i = 0; i <= samplesPerCurve; i++) {
      const t = i / samplesPerCurve;
      curve.getPointAt(t, _scratchVec);
      const d = worldPos.distanceToSquared(_scratchVec);
      if (d < best.distance) {
        best.distance = d;
        best.point.copy(_scratchVec);
        curve.getTangentAt(t, _scratchTan);
        best.tangent.copy(_scratchTan);
        best.splineIndex = s;
        best.parameterT = t;
      }
    }
  }

  best.distance = Math.sqrt(best.distance);
  return best;
}

/**
 * Convenience alias for {@link nearestSegment} — matches the API described
 * in S15-FX-003: `getNearestPoint(worldPos)` → closest spline point + tangent.
 */
export const getNearestPoint = nearestSegment;

/* ========================================================================== */
/*  Morphing between two spline fields                                         */
/* ========================================================================== */

/**
 * Linearly interpolate the *control points* of two spline fields and produce
 * a new SplineFieldData suitable for re‑baking.
 *
 * Both fields must have the same number of splines with the same number of
 * control points per spline — otherwise an Error is thrown. The caller is
 * responsible for maintaining matching topology.
 *
 * @param from  Source field (blend factor 0).
 * @param to    Target field (blend factor 1).
 * @param blend Normalised value 0..1 controlling the interpolation.
 * @param name  Optional label for the resulting field (auto‑generated if omitted).
 */
export function morphSplineFields(
  from: SplineFieldData,
  to: SplineFieldData,
  blend: number,
  name?: string,
): SplineFieldData {
  if (from.splines.length !== to.splines.length) {
    throw new Error(
      `Cannot morph fields with mismatched spline counts: ` +
        `${from.name}(${from.splines.length}) vs ${to.name}(${to.splines.length})`,
    );
  }

  const t = THREE.MathUtils.clamp(blend, 0, 1);
  const morphed: SplineDef[] = [];

  for (let i = 0; i < from.splines.length; i++) {
    const fDef = from.splines[i];
    const tDef = to.splines[i];

    if (fDef.points.length !== tDef.points.length) {
      throw new Error(
        `Spline ${i}: mismatched control-point counts — ` +
          `${from.name}[${i}]=${fDef.points.length}, ` +
          `${to.name}[${i}]=${tDef.points.length}`,
      );
    }

    const morphedPoints: [number, number, number][] = fDef.points.map((fp, j) => {
      const tp = tDef.points[j];
      return [
        fp[0] + (tp[0] - fp[0]) * t,
        fp[1] + (tp[1] - fp[1]) * t,
        fp[2] + (tp[2] - fp[2]) * t,
      ];
    });

    // Interpolate curve type: use 'from' when t < 0.5, 'to' otherwise.
    const curveType = t < 0.5
      ? (fDef.curveType ?? 'centripetal')
      : (tDef.curveType ?? 'centripetal');

    morphed.push({
      points: morphedPoints,
      curveType,
      tension:
        (fDef.tension ?? 0.5) + ((tDef.tension ?? 0.5) - (fDef.tension ?? 0.5)) * t,
      closed: t < 0.5 ? (fDef.closed ?? true) : (tDef.closed ?? true),
    });
  }

  return {
    name: name ?? `morph:${from.name}→${to.name}@${t.toFixed(2)}`,
    splines: morphed,
  };
}

/**
 * Convenience alias for {@link morphSplineFields} — matches the API described
 * in S15-FX-003: `morph(setA, setB, t)` → lerp control points between two sets.
 */
export const morph = morphSplineFields;

/* ========================================================================== */
/*  Pre‑authored spline sets                                                   */
/* ========================================================================== */

/** Helper to generate elliptical ring control points. */
function ellipseRing(
  radiusX: number,
  radiusY: number,
  zOffset: number,
  tiltRad: number,
  segments = 12,
  wobbleAmp = 0,
  wobbleFreq = 3,
  phase = 0,
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const wobble = wobbleAmp ? Math.sin(a * wobbleFreq + phase) * wobbleAmp : 0;
    const rX = radiusX + wobble;
    const rY = radiusY + wobble;
    const x = Math.cos(a) * rX;
    const y = Math.sin(a) * rY;
    const z = zOffset;
    // Tilt around X axis
    const cosT = Math.cos(tiltRad);
    const sinT = Math.sin(tiltRad);
    pts.push([x, y * cosT - z * sinT, y * sinT + z * cosT]);
  }
  return pts;
}

// ── Hero‑Vortex (S‑015) ────────────────────────────────────────────────────

/**
 * Interleaved elliptical orbits around the hero headline region.
 * Four tilted rings at varying scales create a layered, organic 3D vortex
 * that flows champagne-gold particles around and through the headline text.
 *
 * This is the default spline set for the Living Blueprint hero experience.
 */
export const HERO_VORTEX: SplineFieldData = {
  name: 'hero-vortex',
  splines: [
    {
      points: ellipseRing(3.2, 1.4, 0, 0.35, 12, 0.25, 3, 1.7),
      tension: 0.5,
    },
    {
      points: ellipseRing(2.6, 1.8, 0.4, -0.5, 12, 0.2, 3, 4.1),
      tension: 0.5,
    },
    {
      points: ellipseRing(3.8, 1.1, -0.3, 0.15, 12, 0.3, 3, 2.3),
      tension: 0.5,
    },
    {
      points: ellipseRing(4.6, 2.2, 0.6, -0.2, 12, 0.4, 3, 5.9),
      tension: 0.5,
    },
  ],
};

// ── Architecture‑Grid (S‑015) ───────────────────────────────────────────────

/**
 * Blueprint‑style rectilinear grid with construction‑line aesthetics.
 * Horizontal sweep lines + vertical pillars + central crossing diagonals
 * form an architectural cage echoing the blueprint UX overlays.
 */
export const ARCHITECTURE_GRID: SplineFieldData = {
  name: 'architecture-grid',
  splines: [
    // Horizontal sweep — wide bottom arc
    {
      points: [
        [-5, -2.0, 0],
        [-3, -1.8, 0.2],
        [0, -1.7, 0],
        [3, -1.8, -0.2],
        [5, -2.0, 0],
      ],
      tension: 0.5,
    },
    // Mid‑horizon line
    {
      points: [
        [-5, 0, -0.5],
        [-2.5, 0.1, -0.2],
        [0, 0, 0],
        [2.5, -0.1, 0.2],
        [5, 0, 0.5],
      ],
      tension: 0.5,
    },
    // Upper framing sweep
    {
      points: [
        [-4.5, 1.8, 0],
        [-2, 2.0, 0.3],
        [0, 2.1, 0],
        [2, 2.0, -0.3],
        [4.5, 1.8, 0],
      ],
      tension: 0.5,
    },
    // Left vertical pillar
    {
      points: [
        [-3.5, -2.5, -0.3],
        [-3.3, -1.0, -0.1],
        [-3.6, 1.0, 0.1],
        [-3.4, 2.5, 0.3],
      ],
      curveType: 'chordal',
      tension: 0.5,
      closed: false,
    },
    // Right vertical pillar
    {
      points: [
        [3.5, -2.5, 0.3],
        [3.3, -1.0, 0.1],
        [3.6, 1.0, -0.1],
        [3.4, 2.5, -0.3],
      ],
      curveType: 'chordal',
      tension: 0.5,
      closed: false,
    },
    // Central crossing diagonals (construction marks)
    {
      points: [
        [-4, -1.5, 0],
        [0, 0.5, 0.1],
        [4, 2.5, 0],
      ],
      curveType: 'catmullrom',
      tension: 0.3,
      closed: false,
    },
  ],
};

// ── Transition‑Dissolve (S‑015) ─────────────────────────────────────────────

/**
 * Sparse, divergent rays that emanate outward — designed for scroll‑driven
 * dissolve / page‑transition effects where particles "evaporate" or
 * "condense" between two states.
 */
export const TRANSITION_DISSOLVE: SplineFieldData = {
  name: 'transition-dissolve',
  splines: [
    // 6 radial spokes at ~60° intervals + orbital decay ring
    {
      points: [
        [0, 0, 0],
        [1.0, 0.6, 0.1],
        [2.2, 1.4, 0.3],
        [4.0, 2.5, 0.6],
      ],
      curveType: 'catmullrom',
      tension: 0.4,
      closed: false,
    },
    {
      points: [
        [0, 0, 0],
        [0.6, 1.0, -0.1],
        [1.4, 2.2, -0.3],
        [2.5, 4.0, -0.6],
      ],
      curveType: 'catmullrom',
      tension: 0.4,
      closed: false,
    },
    {
      points: [
        [0, 0, 0],
        [-0.6, 1.0, 0.2],
        [-1.4, 2.2, 0.4],
        [-2.5, 4.0, 0.8],
      ],
      curveType: 'catmullrom',
      tension: 0.4,
      closed: false,
    },
    {
      points: [
        [0, 0, 0],
        [-1.0, 0.6, -0.2],
        [-2.2, 1.4, -0.4],
        [-4.0, 2.5, -0.8],
      ],
      curveType: 'catmullrom',
      tension: 0.4,
      closed: false,
    },
    {
      points: [
        [0, 0, 0],
        [1.0, -0.6, 0.15],
        [2.2, -1.4, 0.35],
        [4.0, -2.5, 0.65],
      ],
      curveType: 'catmullrom',
      tension: 0.4,
      closed: false,
    },
    {
      points: [
        [0, 0, 0],
        [-1.0, -0.6, -0.15],
        [-2.2, -1.4, -0.35],
        [-4.0, -2.5, -0.65],
      ],
      curveType: 'catmullrom',
      tension: 0.4,
      closed: false,
    },
    // Orbital decay ring (outer, counter‑clockwise)
    {
      points: ellipseRing(3.0, 1.8, 0.1, 0.2, 16, 0.15, 5, 0),
      tension: 0.5,
    },
  ],
};

/* ========================================================================== */
/*  Spline‑set registry                                                        */
/* ========================================================================== */

export const SPLINE_SETS = {
  'hero-vortex': HERO_VORTEX,
  'architecture-grid': ARCHITECTURE_GRID,
  'transition-dissolve': TRANSITION_DISSOLVE,
} as const;

export type SplineSetName = keyof typeof SPLINE_SETS;

/** Lookup a named spline set by its string key. Returns undefined if unknown. */
export function getSplineSet(name: string): SplineFieldData | undefined {
  return SPLINE_SETS[name as SplineSetName];
}
