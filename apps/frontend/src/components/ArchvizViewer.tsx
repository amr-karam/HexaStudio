'use client';

import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Loader } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { OBSIDIAN_RAISED, GOLD } from '@/lib/color-tokens';
import { ArchvizModel } from './ArchvizModel';

interface ArchvizViewerProps {
  modelPath: string;
  poster?: string;
  className?: string;
  camera?: [number, number, number];
}

function ModelFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <span className="text-xs text-sl-mist/50">Loading 3D Scene</span>
      </div>
    </Html>
  );
}

/**
 * ArchvizViewer — Production-grade 3D architectural visualization viewer.
 * Gated by useReducedMotion for accessibility; uses glTF for model loading.
 * Built on existing VoidGarden/ArchitecturalVisualization3D patterns.
 */
export function ArchvizViewer({
  modelPath,
  poster,
  className = '',
  camera = [0, 0, 5],
}: ArchvizViewerProps) {
  const reduced = useReducedMotion();
  const handleError = (err: Error) => {
    console.error('[ArchvizViewer] Model load error:', err);
  };

  if (reduced) {
    return (
      <div
        className={`relative flex items-center justify-center bg-sl-void ${className}`}
        style={{ aspectRatio: '16/9' }}
      >
        {poster ? (
          <img src={poster} alt="Architectural visualization" className="h-full w-full object-cover" />
        ) : (
          <div className="text-sl-mist/40">Motion-reduced fallback</div>
        )}
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <Canvas
        camera={{ position: camera, fov: 50 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        className={className}
      >
        <color attach="background" args={['#0a0a0b']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={0.9} />
        <ModelFallback />
        <ArchvizModel modelPath={modelPath} onError={handleError} />
        <Environment preset="city" />
        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.4}
          scale={[10, 10]}
          blur={2}
          far={5}
        />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      <Loader
        dataStyles={{
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(10, 10, 11, 0.8)',
          color: GOLD,
        }}
      />
    </Suspense>
  );
}
