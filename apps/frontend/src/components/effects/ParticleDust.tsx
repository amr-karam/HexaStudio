'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  count?: number;
  spread?: number;
  size?: number;
  color?: string;
  opacity?: number;
}

export default function ParticleDust({
  count = 200,
  spread = 8,
  size = 0.02,
  color = '#D4AF37',
  opacity = 0.15,
}: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const r = new Float32Array(count); // random seed per particle
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
      pos[i * 3 + 2] = Math.random() * spread * 0.5 - spread * 0.25;
      r[i] = Math.random();
    }
    return { positions: pos, randoms: r };
  }, [count, spread]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(
      new Float32Array(count).fill(size), 1
    ));
    return geo;
  }, [positions, count, size]);

  const spriteMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
      }),
    [color, size, opacity],
  );

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle drift + subtle turbulence
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const seed = randoms[i];
      const idx = i * 3;

      // Y-axis float: sine wave per particle
      pos[idx + 1] += Math.sin(t * 0.5 + seed * 10) * 0.001;

      // X-axis drift
      pos[idx] += Math.cos(t * 0.3 + seed * 7) * 0.0008;

      // Z-axis drift
      pos[idx + 2] += Math.sin(t * 0.4 + seed * 8) * 0.0006;

      // Loop particles that drift too far
      if (pos[idx + 1] > spread * 0.3) pos[idx + 1] = -spread * 0.3;
      if (pos[idx] > spread * 0.5) pos[idx] = -spread * 0.5;
      if (pos[idx] < -spread * 0.5) pos[idx] = spread * 0.5;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Subtle global rotation
    pointsRef.current.rotation.y += 0.0002;
    pointsRef.current.rotation.x += 0.0001;
  });

  return <points ref={pointsRef} geometry={geometry} material={spriteMaterial} />;
}
