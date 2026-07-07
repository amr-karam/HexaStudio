'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
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
 * It implements dynamic quality scaling by adjusting material properties 
 * based on the detected device performance.
 */
export const ArchitecturalModel = ({ url, position = [0, 0, 0], scale = 1 }: ModelProps) => {
  const { model } = useAssetLoader(url);
  const groupRef = useRef<THREE.Group>(null);
  const { isTransitioning } = useCameraStore();
  const { level } = useAdaptiveQuality();

  useEffect(() => {
    if (!model) return;

    // Implement Adaptive Quality (LOD) on Materials
    model.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material;
        
        // Reduce sampling and complexity for lower quality levels
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
          // High quality: Maximum fidelity
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
  }, [model, level]);

  useFrame(() => {
    if (!groupRef.current || isTransitioning) return;
    groupRef.current.rotation.y += 0.0005; // Slower, more elegant rotation
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={model} />
    </group>
  );
};
