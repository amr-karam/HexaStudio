/**
 * SplineField (S15-FX-003) — flow-path authoring for the particle engine.
 *
 * A field is a set of closed Catmull-Rom splines. Each spline is baked into
 * one row of a DataTexture (RGBA float, x/y/z = position) so the velocity
 * shader can look up "where should this particle be heading" with a single
 * texture fetch: u = curve parameter t, v = spline row.
 *
 * Fields are plain data (JSON-serializable control points), mirroring the
 * `-SPLINES.json` authoring pattern of the reference site — future scenes
 * (S-017) swap fields, not code.
 */

import {
  CatmullRomCurve3,
  DataTexture,
  FloatType,
  LinearFilter,
  RepeatWrapping,
  RGBAFormat,
  Vector3,
} from 'three';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface SplineFieldData {
  name: string;
  /** One array of [x, y, z] control points per spline. All splines closed. */
  splines: [number, number, number][][];
}

export interface BakedSplineField {
  /** Position lookup texture: u = t along curve, v = spline index. */
  texture: DataTexture;
  splineCount: number;
  /** CPU-side curves, reused to scatter initial particle positions. */
  curves: CatmullRomCurve3[];
  dispose: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Baking                                                                     */
/* -------------------------------------------------------------------------- */

const SAMPLES_PER_SPLINE = 256;

export function bakeSplineField(data: SplineFieldData): BakedSplineField {
  const splineCount = data.splines.length;
  const pixels = new Float32Array(SAMPLES_PER_SPLINE * splineCount * 4);

  const curves = data.splines.map(
    (points) =>
      new CatmullRomCurve3(
        points.map(([x, y, z]) => new Vector3(x, y, z)),
        true, // closed loop — flowT wraps seamlessly
        'centripetal',
      ),
  );

  const sample = new Vector3();
  curves.forEach((curve, row) => {
    for (let i = 0; i < SAMPLES_PER_SPLINE; i++) {
      curve.getPointAt(i / (SAMPLES_PER_SPLINE - 1), sample);
      const idx = (row * SAMPLES_PER_SPLINE + i) * 4;
      pixels[idx] = sample.x;
      pixels[idx + 1] = sample.y;
      pixels[idx + 2] = sample.z;
      pixels[idx + 3] = 1;
    }
  });

  const texture = new DataTexture(
    pixels,
    SAMPLES_PER_SPLINE,
    splineCount,
    RGBAFormat,
    FloatType,
  );
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = RepeatWrapping; // flowT wraps around the closed loop
  texture.needsUpdate = true;

  return {
    texture,
    splineCount,
    curves,
    dispose: () => texture.dispose(),
  };
}

/* -------------------------------------------------------------------------- */
/*  Field: "hero vortex" (S-015)                                               */
/* -------------------------------------------------------------------------- */

/**
 * Interleaved elliptical orbits around the hero headline: three tilted rings
 * plus a wide outer sweep. Generated procedurally for precision; hand-tuned
 * constants are the design decisions.
 */
function ellipse(
  radiusX: number,
  radiusY: number,
  z: number,
  tiltRad: number,
  segments = 12,
  wobble = 0,
  seed = 0,
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const w = wobble ? Math.sin(a * 3 + seed) * wobble : 0;
    const x = Math.cos(a) * (radiusX + w);
    const y = Math.sin(a) * (radiusY + w);
    // Tilt around the X axis.
    pts.push([
      x,
      y * Math.cos(tiltRad) - z * Math.sin(tiltRad),
      y * Math.sin(tiltRad) + z * Math.cos(tiltRad),
    ]);
  }
  return pts;
}

export const HERO_VORTEX: SplineFieldData = {
  name: 'hero-vortex',
  splines: [
    ellipse(3.2, 1.4, 0, 0.35, 12, 0.25, 1.7),
    ellipse(2.6, 1.8, 0.4, -0.5, 12, 0.2, 4.1),
    ellipse(3.8, 1.1, -0.3, 0.15, 12, 0.3, 2.3),
    ellipse(4.6, 2.2, 0.6, -0.2, 12, 0.4, 5.9),
  ],
};
