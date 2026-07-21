'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, BufferAttribute, PointsMaterial, Points, Color } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Props {
  count?: number;
  spread?: number;
  size?: number;
  color?: string;
  opacity?: number;
  /** Accept externally-controlled visibility (e.g. from IntersectionObserver). */
  visible?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ParticleDust({
  count = 200,
  spread = 8,
  size = 0.02,
  color = '#D4AF37',
  opacity = 0.15,
  visible = true,
}: Props) {
  const pointsRef = useRef<Points>(null);
  const reducedMotion = useReducedMotion();

  // Immutable base positions + random phase seeds (set once).
  const { basePositions, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
      pos[i * 3 + 2] = Math.random() * spread * 0.5 - spread * 0.25;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { basePositions: pos, phases: ph };
  }, [count, spread]);

  // Geometry — allocated once, disposed on unmount.
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    // Copy base positions into the initial position attribute.
    const posAttr = new BufferAttribute(new Float32Array(basePositions), 3);
    geo.setAttribute('position', posAttr);
    geo.setAttribute(
      'size',
      new BufferAttribute(new Float32Array(count).fill(size), 1),
    );
    return geo;
  }, [basePositions, count, size]);

  // Material — allocated once, disposed on unmount.
  const material = useMemo(
    () =>
      new PointsMaterial({
        color: new Color(color),
        size,
        transparent: true,
        opacity,
        blending: 2, // AdditiveBlending
        depthWrite: false,
        depthTest: true,
      }),
    [color, size, opacity],
  );

  // Manual disposal of owned GPU resources.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Per-frame motion: elapsed-time based (not cumulative).
  useFrame((state) => {
    if (!pointsRef.current || reducedMotion || !visible) return;

    const elapsed = state.clock.elapsedTime;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const seed = phases[i];

      // Y-axis float: sine wave per particle.
      arr[idx + 1] =
        basePositions[idx + 1] + Math.sin(elapsed * 0.5 + seed * 10) * (spread * 0.02);

      // X-axis drift.
      arr[idx] =
        basePositions[idx] + Math.cos(elapsed * 0.3 + seed * 7) * (spread * 0.015);

      // Z-axis drift.
      arr[idx + 2] =
        basePositions[idx + 2] + Math.sin(elapsed * 0.4 + seed * 8) * (spread * 0.01);
    }
    posAttr.needsUpdate = true;

    // Subtle global rotation (delta-based — derived from elapsed time).
    pointsRef.current.rotation.y = elapsed * 0.02;
    pointsRef.current.rotation.x = elapsed * 0.01;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
