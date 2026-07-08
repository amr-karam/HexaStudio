'use client';

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { ProjectHotspot } from '@hexastudio/types';
import { useCameraStore } from '@/features/scene/store/camera-store';
import { motion } from 'framer-motion';

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

  return (
    <group position={hotspot.position}>
      <mesh
        onClick={handleActivate}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshBasicMaterial
          color="#c9a96e"
          transparent
          opacity={isHovered ? 1 : 0.4}
        />
      </mesh>

      <mesh
        onClick={handleActivate}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={isHovered ? '#c9a96e' : '#ffffff'}
          emissive={isHovered ? '#c9a96e' : '#ffffff'}
          emissiveIntensity={2}
        />
      </mesh>

      {isActive && (
        <mesh>
          <ringGeometry args={[0.2, 0.22, 32]} />
          <meshBasicMaterial
            color="#c9a96e"
            transparent
            opacity={0.8}
          />
        </mesh>
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