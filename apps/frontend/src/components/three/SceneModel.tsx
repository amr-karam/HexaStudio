'use client';

import React, { useRef, useState } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ModelConfig } from '@/features/scene/config/model-registry';

interface SceneModelProps {
  config: ModelConfig;
}

export function SceneModel({ config }: SceneModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [loaded, setLoaded] = useState(false);

  // Integrate Draco compression via useGLTF
  const { scene } = useGLTF(config.path, undefined, undefined, () => {
    // The loader is automatically configured for Draco if the .glb contains it
    // but we can explicitly define the decoder path if needed.
  });

  React.useEffect(() => {
    setLoaded(true);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.05;
    meshRef.current.position.y = config.position[1] + Math.sin(time * 0.3) * 0.15;
  });

  return (
    <Center ref={meshRef}>
      <primitive
        object={scene}
        scale={config.scale}
        position={config.position}
        rotation={config.rotation}
        // Cinematic fade-in
        onUpdate={() => {
          if (!loaded) setLoaded(true);
        }}
      />
    </Center>
  );
}
