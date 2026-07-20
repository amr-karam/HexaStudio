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
  status?: string;
  milestones?: { total: number; completed: number };
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
  status,
  milestones,
}: ExperienceCanvasProps) => {
  const { level, settings } = useAdaptiveQuality();
  const { isTransitioning } = useCameraStore();

  return (
    <div className="absolute inset-0 -z-10 h-full w-full" data-cursor="drag">
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

          <Environment preset="warehouse" />
          <SceneContent projectModelUrl={projectModelUrl} hotspots={hotspots} status={status} milestones={milestones} />

          {/* Key light — crisp white from upper right, casting the hero shadow. */}
          <directionalLight
            position={[8, 12, 4]}
            intensity={2}
            color="#ffffff"
            castShadow={settings.shadows}
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          {/* Warm gold fill from the opposite side to lift shadow detail. */}
          <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#D4AF37" />
          {/* Cool blue rim light for separation from the background. */}
          <directionalLight position={[0, 6, -8]} intensity={0.6} color="#7BA7FF" />
          {/* Overhead spotlight — architectural accent from above. */}
          <spotLight
            position={[0, 15, 0]}
            angle={0.4}
            penumbra={1}
            intensity={0.5}
            color="#ffffff"
            castShadow={settings.shadows}
          />

          <fog attach="fog" args={['#050505', 12, 35]} />

          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.5}
            scale={25}
            blur={4}
            far={15}
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


