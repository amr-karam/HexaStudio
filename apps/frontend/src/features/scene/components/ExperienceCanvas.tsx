'use client';

import React, { Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
  Environment,
} from '@react-three/drei';

import { SceneContent } from './SceneContent';
import { CameraController } from './CameraController';
const PostProcessing = lazy(() => import('./PostProcessing').then((module) => ({ default: module.PostProcessing })));
import { SceneAccessibility } from './SceneAccessibility';
import * as THREE from 'three';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { ProjectHotspot } from '@hexastudio/types';
import { useCameraStore } from '../store/camera-store';

interface ExperienceCanvasProps {
  projectModelUrl?: string;
  hotspots?: ProjectHotspot[];
  projectTitle?: string;
}

function SceneFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
       <meshStandardMaterial color="#1A1A1A" wireframe />
    </mesh>
  );
}

export const ExperienceCanvas = ({
  projectModelUrl,
  hotspots,
  projectTitle,
}: ExperienceCanvasProps) => {
  const { level, settings } = useAdaptiveQuality();
  const { isTransitioning } = useCameraStore();

  return (
    <div className="absolute inset-0 -z-10 h-full w-full">
      <SceneAccessibility hotspots={hotspots} projectTitle={projectTitle} />
      <Canvas
        shadows={settings.shadows}
        dpr={settings.dpr}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={<SceneFallback />}>
          <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={45} />
          <CameraController />

          {!isTransitioning && (
            <OrbitControls
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
              dampingFactor={0.05}
              enableDamping
            />
          )}

          <Environment preset="city" />
          <SceneContent projectModelUrl={projectModelUrl} hotspots={hotspots} />
          
          <directionalLight
            position={[10, 15, 5]}
            intensity={1.5}
            castShadow={settings.shadows}
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#D4AF37" />

          <fog attach="fog" args={['#050505', 15, 30]} />

          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.6}
            scale={20}
            blur={3}
            far={10}
          />

          <Suspense fallback={null}>
            <PostProcessing quality={level} />
          </Suspense>
        </Suspense>
      </Canvas>
    </div>
  );
};

export type { ExperienceCanvasProps };


