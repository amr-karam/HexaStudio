'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { HexaCrystal } from './HexaCrystal';
import { SceneModel } from './SceneModel';
import { getModelConfig } from '@/features/scene/config/model-registry';

function SceneContent() {
  const config = getModelConfig();

  return (
    <Suspense fallback={<HexaCrystal />}>
      <SceneModel config={config} />
    </Suspense>
  );
}

export function Scene() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <Canvas 
        dpr={[1, 2]} 
        shadows 
        gl={{ 
          antialias: true, 
          powerPreference: 'high-performance',
          stencil: false,
          depth: true 
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} color="#D4AF37" intensity={0.5} />

        <Suspense fallback={null}>
          <SceneContent />
          <Environment preset="city" />
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
