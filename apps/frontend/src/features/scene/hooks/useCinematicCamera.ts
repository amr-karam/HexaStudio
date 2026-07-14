import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useCameraStore } from '@/features/scene/store/camera-store';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getModelConfig } from '@/features/scene/config/model-registry';

const IDLE_RADIUS = 12;
const IDLE_HEIGHT = 8;
const PARALLAX_FACTOR = 0.3;
const PARALLAX_SMOOTHING = 0.04;
const TRANSITION_DURATION = 1.8;
const EASE_OUT_EXPO = 'power3.out';

function buildTargets() {
  const config = getModelConfig();
  const targets: Record<string, { position: [number, number, number]; lookAt: [number, number, number] }> = {};
  for (const point of config.cinematicPoints) {
    targets[point.name] = { position: point.position, lookAt: point.lookAt };
  }
  targets.overview = { position: [10, 10, 10], lookAt: [0, 0, 0] };
  return targets;
}

export function useCinematicCamera() {
  const { camera, gl } = useThree();
  const store = useCameraStore();
  const currentTarget = store.currentTarget;
  const setTarget = store.setTarget;
  const setTransitioning = store.setTransitioning;
  const reducedMotion = useReducedMotion();

  const mouse = useRef({ x: 0, y: 0 });
  const idleAngle = useRef(0);
  const parallaxPos = useRef({ x: 0, y: 0 });
  const transitioning = useRef(false);

  const targets = useMemo(buildTargets, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    gl.domElement.addEventListener('pointermove', handleMouseMove);
    return () => gl.domElement.removeEventListener('pointermove', handleMouseMove);
  }, [gl]);

  const goToTarget = useCallback((
    targetName: string,
    duration: number = TRANSITION_DURATION,
  ) => {
    const target = targets[targetName];
    if (!target) return;

    setTarget(targetName);

    if (reducedMotion) {
      camera.position.set(...target.position);
      camera.lookAt(new THREE.Vector3(...target.lookAt));
      return;
    }

    transitioning.current = true;
    setTransitioning(true);
    gsap.killTweensOf(camera.position);

    const lookProxy = new THREE.Vector3(...target.lookAt);
    gsap.to(camera.position, {
      x: target.position[0],
      y: target.position[1],
      z: target.position[2],
      duration,
      ease: EASE_OUT_EXPO,
      overwrite: 'auto',
    });
    gsap.to(lookProxy, {
      x: target.lookAt[0],
      y: target.lookAt[1],
      z: target.lookAt[2],
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: () => camera.lookAt(lookProxy),
      onComplete: () => {
        transitioning.current = false;
        setTransitioning(false);
      },
    });
  }, [camera, targets, reducedMotion, setTarget, setTransitioning]);

  useFrame(() => {
    if (transitioning.current) return;

    if (!currentTarget) {
      if (!reducedMotion) {
        idleAngle.current += 0.0005;
      }
      const cx = IDLE_RADIUS * Math.sin(idleAngle.current);
      const cz = IDLE_RADIUS * Math.cos(idleAngle.current);
      const tx = cx + parallaxPos.current.x;
      const ty = IDLE_HEIGHT + parallaxPos.current.y;
      camera.position.x += (tx - camera.position.x) * 0.02;
      camera.position.y += (ty - camera.position.y) * 0.02;
      camera.position.z += (cz - camera.position.z) * 0.02;
      camera.lookAt(0, 0, 0);
    } else {
      const px = mouse.current.x * PARALLAX_FACTOR;
      const py = mouse.current.y * PARALLAX_FACTOR;
      parallaxPos.current.x += (px - parallaxPos.current.x) * PARALLAX_SMOOTHING;
      parallaxPos.current.y += (py - parallaxPos.current.y) * PARALLAX_SMOOTHING;
      camera.position.x += parallaxPos.current.x;
      camera.position.y += parallaxPos.current.y;
    }
  });

  return { goToTarget, targets, isTransitioning: transitioning.current };
}
