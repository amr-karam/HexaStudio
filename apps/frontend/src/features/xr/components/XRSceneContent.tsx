'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useXRStore } from '../store/xr-store';
import { DEFAULT_MODEL_SCALE } from '../config/xr-config';
import * as THREE from 'three';

export function XRSceneContent({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ y: 0 });
  const setModelLoaded = useXRStore((s) => s.setModelLoaded);
  const mode = useXRStore((s) => s.mode);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!clonedScene) return;

    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const scale = 1.5 / maxDim;
    clonedScene.position.sub(center.clone().multiplyScalar(scale));
    clonedScene.scale.setScalar(scale);

    if (groupRef.current) {
      groupRef.current.add(clonedScene);
    }

    if (!mode) {
      const dist = maxDim * scale * 1.8;
      camera.position.set(dist * 0.5, dist * 0.3, dist);
      camera.lookAt(0, 0, 0);
    }

    setModelLoaded(true);
  }, [clonedScene, camera, setModelLoaded, mode]);

  useFrame((_, delta) => {
    if (groupRef.current && !mode) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return <group ref={groupRef} />;
}
