import { useEffect, useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useCameraStore } from '@/features/scene/store/camera-store';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function useCinematicCamera() {
  const { camera, gl } = useThree();
  const { currentTarget, isTransitioning, setTransitioning } = useCameraStore();
  const mouse = useRef({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();

  const targets: Record<
    string,
    { position: [number, number, number]; lookAt: [number, number, number] }
  > = {
    hero: { position: [5, 5, 5], lookAt: [0, 0, 0] },
    'detail-1': { position: [2, 1, 2], lookAt: [0, 0.5, 0] },
    'detail-2': { position: [-3, 2, 1], lookAt: [0, 0.5, 0] },
    overview: { position: [10, 10, 10], lookAt: [0, 0, 0] },
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    gl.domElement.addEventListener('pointermove', handleMouseMove);
    return () => gl.domElement.removeEventListener('pointermove', handleMouseMove);
  }, [gl]);

  // Parallax effect using useFrame (no dual rAF loop)
  useFrame(() => {
    if (isTransitioning || reducedMotion) return;

    const targetX = 5 + mouse.current.x * 0.3;
    const targetY = 5 + mouse.current.y * 0.2;

    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  // Camera transition via GSAP
  useEffect(() => {
    if (!currentTarget || !targets[currentTarget]) return;

    const target = targets[currentTarget];
    const duration = reducedMotion ? 0 : 2;

    if (duration === 0) {
      camera.position.set(...target.position);
      camera.lookAt(new THREE.Vector3(...target.lookAt));
      setTransitioning(false);
      return;
    }

    setTransitioning(true);

    gsap.to(camera.position, {
      x: target.position[0],
      y: target.position[1],
      z: target.position[2],
      duration,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onComplete: () => setTransitioning(false),
    });

    const proxy = new THREE.Vector3(...target.lookAt);
    gsap.to(proxy, {
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        camera.lookAt(proxy);
      },
    });
  }, [currentTarget, camera, setTransitioning, reducedMotion]);
}
