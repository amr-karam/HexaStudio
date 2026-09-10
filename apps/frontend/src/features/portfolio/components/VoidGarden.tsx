'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const GOLDEN_ANGLE = 137.508 * (Math.PI / 180);

interface MonolithProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  delay: number;
}

function Monolith({ position, rotation, scale, delay }: MonolithProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + delay;
    // Subtle floating motion
    meshRef.current.position.y += Math.sin(t * 0.5) * 0.002;
    meshRef.current.rotation.y += 0.001;
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="var(--color-gold)"
          metalness={0.9}
          roughness={0.1}
          emissive="var(--color-gold)"
          emissiveIntensity={0.05}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

export function VoidGarden({ mouse }: { mouse: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);

  // Generate Monoliths based on Golden Angle
  const monoliths = useMemo(() => {
    const items = [];
    for (let i = 0; i < 32; i++) {
      const radius = 2 + i * 0.2;
      const angle = i * GOLDEN_ANGLE;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.sin(i * 0.7) * 2);
      
      items.push({
        position: [x, y, z] as [number, number, number],
        rotation: [0, angle + Math.PI / 4, 0] as [number, number, number],
        scale: [0.1 + (i % 3) * 0.05, 0.3 + (i % 5) * 0.1, 0.05 + (i % 2) * 0.03] as [number, number, number],
        delay: i * 0.1,
      });
    }
    return items;
  }, []);

  useFrame((_state) => {
    if (!groupRef.current) return;
    // Smooth parallax based on mouse position
    const targetX = (mouse.x - 0.5) * 0.5;
    const targetY = (mouse.y - 0.5) * -0.5;
    groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetY - groupRef.current.rotation.x) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {monoliths.map((props, i) => (
        <Monolith key={i} {...props} />
      ))}
    </group>
  );
}
