'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CinematicCameraProps {
  /** Target position the camera looks at */
  lookAt?: [number, number, number];
  /** Camera position offset from scroll-driven base position */
  position?: [number, number, number];
  /** Smoothing factor (0-1, higher = smoother) */
  smoothing?: number;
  /** Field of view */
  fov?: number;
  /** Enable subtle mouse parallax */
  parallax?: boolean;
  /** Parallax intensity */
  parallaxIntensity?: number;
}

/**
 * CinematicCamera — Smooth-follow camera rig with scroll-driven movement,
 * mouse parallax, and cinematic depth of field feel.
 *
 * The camera position is driven by a base position (typically scroll-linked)
 * plus smooth interpolation toward target. Mouse parallax adds subtle
 * offset for immersion.
 */
export function CinematicCamera({
  lookAt = [0, 0, 0],
  position = [0, 0, 5],
  smoothing = 0.08,
  fov = 45,
  parallax = true,
  parallaxIntensity = 0.3,
}: CinematicCameraProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...position));
  const targetLookAt = useRef(new THREE.Vector3(...lookAt));
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef(new THREE.Vector3(...position));
  const currentLookAt = useRef(new THREE.Vector3(...lookAt));

  // Update FOV
  useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }, [camera, fov]);

  // Track mouse for parallax
  useFrame((state) => {
    if (parallax) {
      mousePos.current.x = (state.pointer.x) * parallaxIntensity;
      mousePos.current.y = (state.pointer.y) * parallaxIntensity * 0.5;
    }

    // Smooth interpolation toward target position
    targetPos.current.set(
      position[0] + mousePos.current.x,
      position[1] + mousePos.current.y,
      position[2]
    );

    currentPos.current.lerp(targetPos.current, smoothing);
    currentLookAt.current.lerp(targetLookAt.current, smoothing * 0.7);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
