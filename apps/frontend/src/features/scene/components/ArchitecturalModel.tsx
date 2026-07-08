'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAssetLoader } from '@/features/scene/hooks/useAssetLoader';
import { useCameraStore } from '../store/camera-store';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';

interface ModelProps {
  url: string;
  position?: [number, number, number];
  scale?: number;
}

/**
 * ArchitecturalModel loads and displays a 3D project model with Draco compression.
 * It implements dynamic quality scaling and a cinematic entrance animation.
 */
export const ArchitecturalModel = ({ url, position = [0, 0, 0], scale = 1 }: ModelProps) => {
  const { model } = useAssetLoader(url);
  const groupRef = useRef<THREE.Group>(null);
  const { isTransitioning } = useCameraStore();
  const { level } = useAdaptiveQuality();

  useEffect(() => {
    if (!model) return;

    // 1. Cinematic Entrance Animation
    if (groupRef.current) {
      groupRef.current.scale.set(0, 0, 0);
      gsap.to(groupRef.current.scale, {
        x: scale,
        y: scale,
        z: scale,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.2,
      });
      
      gsap.from(groupRef.current.rotation, {
        y: Math.PI * 0.2,
        duration: 2,
        ease: 'power2.out',
      });
    }

    // 2. Adaptive Quality (LOD) on Materials
    model.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material;
        
        if (level === 'low') {
          if (mat instanceof THREE.MeshPhysicalMaterial) {
            mat.clearcoat = 0;
            mat.roughness = 0.5;
            mat.envMapIntensity = 0.5;
          }
        } else if (level === 'medium') {
          if (mat instanceof THREE.MeshPhysicalMaterial) {
            mat.clearcoat = 0.5;
            mat.roughness = 0.3;
            mat.envMapIntensity = 1.0;
          }
        } else {
          if (mat instanceof THREE.MeshPhysicalMaterial) {
            mat.clearcoat = 1;
            mat.roughness = 0.1;
            mat.envMapIntensity = 1.5;
          }
        }
      }
    });

    return () => {
      if (groupRef.current) {
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [model, level, scale]);

  useFrame(() => {
    if (!groupRef.current || isTransitioning) return;
    groupRef.current.rotation.y += 0.0005;
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={model} scale={scale} />
    </group>
  );
};
