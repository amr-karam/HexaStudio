'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXRStore } from '../store/xr-store';
import * as THREE from 'three';

export function ARPlacementReticle() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const placementPhase = useXRStore((s) => s.placementPhase);
  const position = useXRStore((s) => s.placementPosition);

  const isVisible = placementPhase === 'placing' && position;

  useFrame((_, delta) => {
    if (ringRef.current && isVisible) {
      ringRef.current.rotation.x += delta * 0.5;
    }
  });

  if (!isVisible) return null;

  const pos = position ? new THREE.Vector3(position.x, position.y, position.z) : undefined;

  return (
    <group position={pos}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.13, 0.15, 32]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
