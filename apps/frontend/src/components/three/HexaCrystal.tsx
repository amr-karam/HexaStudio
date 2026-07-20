'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export function HexaCrystal() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    // Slow faceted spin with a subtle z-axis wobble.
    meshRef.current.rotation.y = time * 0.15;
    meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.08;

    // Subtle scale pulsation (0.98 ↔ 1.02) — a "breathing" crystal.
    const pulse = 1 + Math.sin(time * 1.2) * 0.02;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshPhysicalMaterial
          color="#D4AF37"
          metalness={0.95}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2.5}
          flatShading
        />
      </mesh>
    </Float>
  );
}
