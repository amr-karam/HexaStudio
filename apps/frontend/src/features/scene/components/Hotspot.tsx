'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { ProjectHotspot } from '@hexastudio/types';
import { useCameraStore } from '@/features/scene/store/camera-store';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  RingGeometry,
  SphereGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three';

interface HotspotProps {
  hotspot: ProjectHotspot;
}

/**
 * Hotspot renders an interactive 3D marker in the scene.
 *
 * Touch target: An invisible sphere (radius 0.22) ensures the interaction
 * area is at least 44×44 CSS pixels on touch devices (accounting for
 * distanceFactor). The visible indicators are smaller for aesthetics.
 */
export const Hotspot = ({ hotspot }: HotspotProps) => {
  const { setTarget, currentTarget } = useCameraStore();
  const reducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const isActive = currentTarget === hotspot.id;

  const handleActivate = () => {
    setTarget(hotspot.id);
  };

  // Geometries & materials are created once per unique configuration.
  const geometries = useMemo(
    () => ({
      ringOuter: new RingGeometry(0.12, 0.15, 32),
      ringActive: new RingGeometry(0.2, 0.22, 32),
      sphere: new SphereGeometry(0.06, 16, 16),
      // Invisible touch target: 44px at distanceFactor 15 ≈ radius 0.22.
      touchTarget: new SphereGeometry(0.22, 8, 8),
    }),
    [],
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
      // Invisible material for touch target.
      touchTarget: new MeshBasicMaterial({
        visible: false,
      }),
    }),
    [],
  );

  // Dispose all GPU resources on unmount.
  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  return (
    <group position={hotspot.position}>
      {/* Invisible touch target — ensures ≥44×44 CSS px on mobile. */}
      <mesh
        geometry={geometries.touchTarget}
        material={materials.touchTarget}
        onClick={handleActivate}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      />

      {/* Visible ring indicator. */}
      <mesh
        geometry={geometries.ringOuter}
        material={isHovered ? materials.ringOuterHover : materials.ringOuter}
      />

      {/* Visible sphere indicator. */}
      <mesh
        geometry={geometries.sphere}
        material={isHovered ? materials.sphereHover : materials.sphere}
      />

      {/* Active ring overlay. */}
      {isActive && (
        <mesh geometry={geometries.ringActive} material={materials.ringActive} />
      )}

      {/* Tooltip (reduced motion: always show, no animation). */}
      {(isHovered || isActive) && (
        <Html distanceFactor={15} position={[0, 0.4, 0]} center>
          <div
            className="bg-background/90 backdrop-blur-xl border border-border p-4 pointer-events-none"
            style={{
              opacity: reducedMotion ? 1 : undefined,
              transform: reducedMotion ? 'none' : undefined,
            }}
          >
            <p className="text-xs uppercase tracking-widest text-accent mb-1">
              {hotspot.title}
            </p>
            <p className="text-[10px] text-neutral-500">{hotspot.description}</p>
          </div>
        </Html>
      )}
    </group>
  );
};
