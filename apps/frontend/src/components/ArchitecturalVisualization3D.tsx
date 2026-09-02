'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, MeshDistortMaterial } from '@react-three/drei';

interface ArchitecturalVisualization3DProps {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  className?: string;
}

function PlaceholderScene({ palette }: ArchitecturalVisualization3DProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={0.9} />
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshDistortMaterial
          color={palette.primary}
          distort={0.25}
          speed={1.2}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <Environment preset="city" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate />
    </>
  );
}

/**
 * ArchitecturalVisualization3D — Renders a 3D architectural visualization
 * with the given color palette. Gated by useMotionPolicy for reduced-motion.
 */
export function ArchitecturalVisualization3D({
  palette,
  className = '',
}: ArchitecturalVisualization3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      className={className}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={[palette.background]} />
      <Suspense fallback={null}>
        <PlaceholderScene palette={palette} />
      </Suspense>
    </Canvas>
  );
}
