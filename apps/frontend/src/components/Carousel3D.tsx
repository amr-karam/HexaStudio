'use client';

import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { OBSIDIAN_RAISED } from '@/lib/color-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function Ring({ images, scrollVelocity, released }: { images: string[]; scrollVelocity: number; released: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = reduced ? 0 : scrollVelocity * 0.35;
    groupRef.current.rotation.y += target * delta;
    if (released) {
      groupRef.current.rotation.y *= 0.995;
    }
  });

  const radius = 3.2;
  const count = images.length;

  return (
    <group ref={groupRef}>
      {images.map((src, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh key={src + i} position={[x, 0, z]} rotation={[0, -angle, 0]}>
            <sphereGeometry args={[0.7, 48, 48]} />
            <MeshDistortMaterial
              color={OBSIDIAN_RAISED}
              distort={0.25}
              speed={1.2}
              roughness={0.2}
              metalness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function Carousel3D({ images = [] }: { images?: string[] }) {
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [released, setReleased] = useState(true);
  const reduced = useReducedMotion();
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    setReleased(false);
    setScrollVelocity((prev) => prev + (Math.sign(e.deltaY) * 0.12));
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => {
      setReleased(true);
    }, 120);
  }, []);

  if (reduced) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {images.map((src, i) => (
          <div key={src + i} className="aspect-square rounded-xl bg-sl-obsidian border border-sl-silver/20" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative h-[420px] w-full"
      onWheel={handleWheel}
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={0.9} />
        <Suspense fallback={null}>
          <Ring images={images} scrollVelocity={scrollVelocity} released={released} />
          <Environment preset="city" />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
