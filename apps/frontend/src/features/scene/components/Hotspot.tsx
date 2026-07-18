'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { ProjectHotspot } from '@hexastudio/types';
import { useCameraStore } from '@/features/scene/store/camera-store';
import { motion } from 'framer-motion';
import {
  RingGeometry,
  SphereGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three';

interface HotspotProps {
  hotspot: ProjectHotspot;
}

export const Hotspot = ({ hotspot }: HotspotProps) => {
  const { setTarget, currentTarget } = useCameraStore();
  const [isHovered, setIsHovered] = useState(false);
  const isActive = currentTarget === hotspot.id;

  const handleActivate = () => {
    setTarget(hotspot.id);
  };

  // Geometries & materials are created once per unique configuration and
  // reused across hover/active state changes to avoid unbounded GPU memory growth.
  const geometries = useMemo(
    () => ({
      ringOuter: new RingGeometry(0.12, 0.15, 32),
      ringActive: new RingGeometry(0.2, 0.22, 32),
      sphere: new SphereGeometry(0.06, 16, 16),
    }),
    []
  );

  const materials = useMemo(
    () => ({
      ringOuter: new MeshBasicMaterial({
        color: '#c9a96e',
        transparent: true,
        opacity: 0.4,
      }),
      ringOuterHover: new MeshBasicMaterial({
        color: '#c9a96e',
        transparent: true,
        opacity: 1,
      }),
      ringActive: new MeshBasicMaterial({
        color: '#c9a96e',
        transparent: true,
        opacity: 0.8,
      }),
      sphere: new MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveIntensity: 2,
      }),
      sphereHover: new MeshStandardMaterial({
        color: '#c9a96e',
        emissive: '#c9a96e',
        emissiveIntensity: 2,
      }),
    }),
    []
  );

  // Dispose all GPU resources when the component unmounts or the memoized
  // values change, preventing leaks across re-renders.
  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  return (
    <group position={hotspot.position}>
      <mesh
        geometry={geometries.ringOuter}
        material={isHovered ? materials.ringOuterHover : materials.ringOuter}
        onClick={handleActivate}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      />

      <mesh
        geometry={geometries.sphere}
        material={isHovered ? materials.sphereHover : materials.sphere}
        onClick={handleActivate}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      />

      {isActive && (
        <mesh geometry={geometries.ringActive} material={materials.ringActive} />
      )}

      {(isHovered || isActive) && (
        <Html distanceFactor={15} position={[0, 0.4, 0]} center>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-background/90 backdrop-blur-xl border border-border p-4 pointer-events-none"
          >
            <p className="text-xs uppercase tracking-widest text-accent mb-1">{hotspot.title}</p>
            <p className="text-[10px] text-neutral-500">{hotspot.description}</p>
          </motion.div>
        </Html>
      )}
    </group>
  );
};
