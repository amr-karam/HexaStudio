'use client';

import React, { useRef } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SceneModelProps {
  modelUrl?: string;
}

export function SceneModel({ modelUrl = '/models/tower.glb' }: SceneModelProps) {
  const meshRef = useRef<THREE.Group>(null);

  const { scene } = useGLTF(modelUrl);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.05;
    meshRef.current.position.y = Math.sin(time * 0.3) * 0.15;
  });

  return (
    <Center ref={meshRef}>
      <primitive
        object={scene}
        scale={1}
        position={[0, -0.5, 0]}
      />
    </Center>
  );
}
