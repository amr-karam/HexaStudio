'use client';

import { Suspense } from 'react';
import { Environment, ContactShadows } from '@react-three/drei';
import { XRSceneContent } from './XRSceneContent';
import { GOLD } from '@/lib/color-tokens';

export function XRView({ modelUrl, sendCursor }: { modelUrl?: string; sendCursor?: (position: { x: number; y: number; z: number }, rotation?: { x: number; y: number; z: number; w: number }) => void }) {
  return (
    <>
      {modelUrl ? (
        <XRSceneContent modelUrl={modelUrl} sendCursor={sendCursor} />
      ) : (
        <Suspense fallback={null}>
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={GOLD} />
          </mesh>
        </Suspense>
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
    </>
  );
}
