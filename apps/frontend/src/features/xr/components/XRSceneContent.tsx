'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXRHitTest } from '@react-three/xr';
import { useGLTF } from '@react-three/drei';
import { useXRStore } from '../store/xr-store';
import { ARPlacementReticle } from './ARPlacementReticle';
import { CollaboratorAvatar } from './CollaboratorAvatar';
import * as THREE from 'three';

const _matrix = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scl = new THREE.Vector3();

export function XRSceneContent({ modelUrl, sendCursor }: { modelUrl: string; sendCursor?: (position: { x: number; y: number; z: number }, rotation?: { x: number; y: number; z: number; w: number }) => void }) {
  const { scene } = useGLTF(modelUrl);
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const setModelLoaded = useXRStore((s) => s.setModelLoaded);
  const mode = useXRStore((s) => s.mode);
  const placementPhase = useXRStore((s) => s.placementPhase);
  const placementPosition = useXRStore((s) => s.placementPosition);
  const setPlacementPosition = useXRStore((s) => s.setPlacementPosition);
  const setPlacementRotation = useXRStore((s) => s.setPlacementRotation);
  const setPlacementPhase = useXRStore((s) => s.setPlacementPhase);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const isPlacing = mode === 'ar' && placementPhase === 'placing';
  const isPlaced = placementPhase === 'placed' || placementPhase === 'adjusting';

  useXRHitTest(
    (results, getWorldMatrix) => {
      if (!isPlacing || results.length === 0) return;
      getWorldMatrix(_matrix, results[0]);
      _matrix.decompose(_pos, _quat, _scl);
      setPlacementPosition({ x: _pos.x, y: _pos.y, z: _pos.z });
      setPlacementRotation({ x: _quat.x, y: _quat.y, z: _quat.z, w: _quat.w });
    },
    'viewer',
    ['plane', 'mesh'],
  );

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

    if (mode === 'ar' && placementPhase === 'idle') {
      setPlacementPhase('placing');
    }

    setModelLoaded(true);
  }, [clonedScene, camera, setModelLoaded, mode]);

  useEffect(() => {
    if (mode === 'ar' && placementPhase === 'placed' && groupRef.current && placementPosition) {
      groupRef.current.position.set(placementPosition.x, placementPosition.y, placementPosition.z);
    }
  }, [mode, placementPhase, placementPosition]);

  useFrame((_, delta) => {
    if (groupRef.current && !mode) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const targetPosition = isPlaced && placementPosition
    ? [placementPosition.x, placementPosition.y, placementPosition.z] as const
    : [0, 0, 0] as const;

  const collaborators = useXRStore((s) => s.collaborators);

  useFrame((_, delta) => {
    if (groupRef.current && !mode) {
      groupRef.current.rotation.y += delta * 0.15;
    }
    if (sendCursor) {
      const p = camera.position;
      const q = camera.quaternion;
      sendCursor(
        { x: p.x, y: p.y, z: p.z },
        { x: q.x, y: q.y, z: q.z, w: q.w },
      );
    }
  });

  return (
    <group ref={groupRef} position={targetPosition}>
      {isPlacing && <ARPlacementReticle />}
      {Object.values(collaborators).map((peer) => (
        <CollaboratorAvatar key={peer.id} peer={peer} />
      ))}
    </group>
  );
}
