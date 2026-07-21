'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXRStore } from '../store/xr-store';
import { Vector3, Mesh } from 'three';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const MAX_DELTA = 0.1;
const RETICLE_ROTATION_SPEED = 0.5; // radians per second

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ARPlacementReticle() {
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const placementPhase = useXRStore((s) => s.placementPhase);
  const position = useXRStore((s) => s.placementPosition);

  // Reuse Vector3 for reticle pose (no allocation per frame).
  const reticlePos = useRef(new Vector3());
  const isVisible = placementPhase === 'placing' && position;

  // Update ref (no React re-render, no store write).
  if (position) {
    reticlePos.current.set(position.x, position.y, position.z);
  }

  useFrame((_, delta) => {
    if (!isVisible || !meshRef.current) return;
    const dt = Math.min(delta, MAX_DELTA);

    // Apply position from ref (mutable, no store read per frame).
    meshRef.current.position.copy(reticlePos.current);

    // Animate ring rotation.
    if (ringRef.current) {
      ringRef.current.rotation.x += dt * RETICLE_ROTATION_SPEED;
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={meshRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.8} side={2} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.13, 0.15, 32]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.4} side={2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.1} side={2} />
      </mesh>
    </group>
  );
}
