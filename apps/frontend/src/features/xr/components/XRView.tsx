'use client';

import { Suspense } from 'react';
import { Environment, ContactShadows } from '@react-three/drei';
import { XRSceneContent } from './XRSceneContent';
import { XRLoadingScreen } from './XRLoadingScreen';

export function XRView({ modelUrl, modelName }: { modelUrl?: string; modelName?: string }) {
  return (
    <Suspense fallback={<XRLoadingScreen modelName={modelName} />}>
      {modelUrl ? (
        <XRSceneContent modelUrl={modelUrl} />
      ) : (
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#D4AF37" />
        </mesh>
      )}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
      />
      <Environment preset="city" />
    </Suspense>
  );
}
