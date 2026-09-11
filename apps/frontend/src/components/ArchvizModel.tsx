'use client';

import { useRef } from 'react';
import { Group } from 'three';

interface ArchvizModelProps {
  fallbackId?: string;
}

/**
 * ArchvizModel — Egyptian material placeholder visualization.
 *
 * Note: dynamic glTF loading is deferred because the installed
 * `@react-three/drei` API surface is causing repeated typecheck
 * failures in this branch. This stable placeholder keeps the
 * production build green while we schedule a dedicated R3F upgrade.
 */
export default function ArchvizModel({ fallbackId = 'marble-carrara-proxy' }: ArchvizModelProps) {
  const groupRef = useRef<Group>(null);

  const fallbackColors: Record<string, string> = {
    'mashrabiya-wood': '#b8a17a',
    'limestone-nile': '#e0d0b0',
    'granite-red-aswan': '#9a3000',
    'marble-carrara-proxy': '#f5efe0',
    'cotton-damask-egyptian': '#f8f3e8',
  };

  const color = fallbackColors[fallbackId] ?? '#9a3000';

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh receiveShadow castShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[4, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh receiveShadow castShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 3, 2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}
