'use client';

import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ArchvizModelProps {
  modelPath: string;
  onError?: (err: Error) => void;
}

/**
 * ArchvizModel — Lazy glTF loader for architectural visualization scenes.
 * Uses useGLTF for caching; falls back to a placeholder box on error.
 */
export function ArchvizModel({ modelPath, onError }: ArchvizModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useGLTF.preload(modelPath);

  let scene: THREE.Group | null = null;
  let error: Error | null = null;

  try {
    const gltf = useGLTF(modelPath) as unknown as {
      scene?: THREE.Group;
      nodes?: Record<string, unknown>;
      materials?: Record<string, unknown>;
      animations?: THREE.AnimationClip[];
    };
    scene = gltf.scene ?? null;
  } catch (e) {
    error = e instanceof Error ? e : new Error(String(e));
    onError?.(error);
    scene = null;
  }

  if (error || !scene) {
    // Placeholder box with wireframe to indicate load failure
    return (
      <group ref={groupRef}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color="#D4AF37"
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}
