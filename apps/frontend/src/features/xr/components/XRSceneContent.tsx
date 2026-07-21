'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXRHitTest } from '@react-three/xr';
import { useGLTF } from '@react-three/drei';
import { useXRStore } from '../store/xr-store';
import { useXRInteraction } from '../hooks/useXRInteraction';
import { ARPlacementReticle } from './ARPlacementReticle';
import { CollaboratorAvatar } from './CollaboratorAvatar';
import { Vector3, Quaternion, Matrix4, Group, Box3 } from 'three';

/* -------------------------------------------------------------------------- */
/*  Pre-allocated matrices (module scope — never GC'd)                         */
/* -------------------------------------------------------------------------- */

const _matrix = new Matrix4();
const _pos = new Vector3();
const _quat = new Quaternion();
const _scl = new Vector3();
const STALE_PEER_TIMEOUT = 5000; // ms

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function XRSceneContent({
  modelUrl,
  sendCursor,
}: {
  modelUrl: string;
  sendCursor?: (
    position: { x: number; y: number; z: number },
    rotation?: { x: number; y: number; z: number; w: number },
  ) => void;
}) {
  const { scene } = useGLTF(modelUrl);
  const { camera } = useThree();

  // ─── Mount useXRInteraction so select events actually fire ─────────────
  useXRInteraction();

  const modelRootRef = useRef<Group>(null);
  const worldPeersRef = useRef<Group>(null);
  const placementReticleRootRef = useRef<Group>(null);

  const setModelLoaded = useXRStore((s) => s.setModelLoaded);
  const mode = useXRStore((s) => s.mode);
  const placementPhase = useXRStore((s) => s.placementPhase);
  const placementPosition = useXRStore((s) => s.placementPosition);
  const placementRotation = useXRStore((s) => s.placementRotation);
  const setPlacementPosition = useXRStore((s) => s.setPlacementPosition);
  const setPlacementRotation = useXRStore((s) => s.setPlacementRotation);
  const setPlacementPhase = useXRStore((s) => s.setPlacementPhase);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const isPlacing = mode === 'ar' && placementPhase === 'placing';
  const isPlaced = placementPhase === 'placed' || placementPhase === 'adjusting';

  // Hit-test: gate on a valid pose, debounce duplicate selects.
  const hasHitPose = useRef(false);

  useXRHitTest(
    (results, getWorldMatrix) => {
      if (!isPlacing || results.length === 0) return;
      getWorldMatrix(_matrix, results[0]);
      _matrix.decompose(_pos, _quat, _scl);
      setPlacementPosition({ x: _pos.x, y: _pos.y, z: _pos.z });
      setPlacementRotation({ x: _quat.x, y: _quat.y, z: _quat.z, w: _quat.w });
      hasHitPose.current = true;
    },
    'viewer',
    ['plane', 'mesh'],
  );

  // Model centering + initial placement.
  useEffect(() => {
    if (!clonedScene) return;

    const box = new Box3().setFromObject(clonedScene);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const scl = 1.5 / maxDim;
    clonedScene.position.sub(center.clone().multiplyScalar(scl));
    clonedScene.scale.setScalar(scl);

    if (modelRootRef.current) {
      modelRootRef.current.add(clonedScene);
    }

    if (!mode) {
      const dist = maxDim * scl * 1.8;
      camera.position.set(dist * 0.5, dist * 0.3, dist);
      camera.lookAt(0, 0, 0);
    }

    if (mode === 'ar' && placementPhase === 'idle') {
      setPlacementPhase('placing');
    }

    setModelLoaded(true);
  }, [clonedScene, camera, setModelLoaded, mode]);

  // Apply placement position + rotation to the model root.
  useEffect(() => {
    if (mode === 'ar' && isPlaced && modelRootRef.current && placementPosition) {
      modelRootRef.current.position.set(
        placementPosition.x,
        placementPosition.y,
        placementPosition.z,
      );
      // Apply hit-test quaternion to orient model on surface.
      if (placementRotation) {
        modelRootRef.current.quaternion.set(
          placementRotation.x,
          placementRotation.y,
          placementRotation.z,
          placementRotation.w,
        );
      }
    }
  }, [mode, isPlaced, placementPosition, placementRotation]);

  // ─── VR idle rotation ──────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (modelRootRef.current && !mode) {
      modelRootRef.current.rotation.y += delta * 0.15;
    }
  });

  // ─── Cursor broadcasting (throttled to 15 Hz) ──────────────────────────
  const cursorAccum = useRef(0);

  useFrame((_, delta) => {
    if (!sendCursor) return;
    cursorAccum.current += delta;
    if (cursorAccum.current < 1 / 15) return;
    cursorAccum.current = 0;
    const p = camera.position;
    const q = camera.quaternion;
    sendCursor(
      { x: p.x, y: p.y, z: p.z },
      { x: q.x, y: q.y, z: q.z, w: q.w },
    );
  });

  // ─── Collaborator interpolation (separate root group) ──────────────────
  const collaborators = useXRStore((s) => s.collaborators);
  const peerPositions = useRef<Map<string, { pos: Vector3; quat: Quaternion; lastSeen: number }>>(new Map());

  // Prune stale peers.
  useFrame(() => {
    const now = Date.now();
    for (const [id, data] of peerPositions.current) {
      if (now - data.lastSeen > STALE_PEER_TIMEOUT) {
        peerPositions.current.delete(id);
      }
    }
  });

  return (
    <>
      {/* Separate root groups: world peers, placement reticle, and model placement. */}
      <group ref={worldPeersRef} />
      <group ref={placementReticleRootRef}>
        {isPlacing && <ARPlacementReticle />}
      </group>
      <group ref={modelRootRef}>
        {Object.values(collaborators).map((peer) => (
          <CollaboratorAvatar key={peer.id} peer={peer} />
        ))}
      </group>
    </>
  );
}


