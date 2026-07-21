'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Vector3, Quaternion, Group } from 'three';
import type { Collaborator } from '../utils/xr-constants';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const COLORS = ['#D4AF37', '#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA'];
const LERP_SPEED = 8; // per second
const SLERP_SPEED = 8;
const MAX_DELTA = 0.1;

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CollaboratorAvatar({ peer }: { peer: Collaborator }) {
  const color = colorFor(peer.id);
  const groupRef = useRef<Group>(null);
  const targetPos = useRef(new Vector3(peer.position.x, peer.position.y, peer.position.z));
  const targetQuat = useRef(
    peer.rotation
      ? new Quaternion(peer.rotation.x, peer.rotation.y, peer.rotation.z, peer.rotation.w)
      : new Quaternion(),
  );

  // Update targets when peer data changes.
  targetPos.current.set(peer.position.x, peer.position.y + 0.05, peer.position.z);
  if (peer.rotation) {
    targetQuat.current.set(peer.rotation.x, peer.rotation.y, peer.rotation.z, peer.rotation.w);
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, MAX_DELTA);

    // Lerp position.
    groupRef.current.position.lerp(targetPos.current, Math.min(1, dt * LERP_SPEED));

    // Slerp rotation.
    groupRef.current.quaternion.slerp(targetQuat.current, Math.min(1, dt * SLERP_SPEED));
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <Text
        position={[0, 0.55, 0]}
        fontSize={0.08}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        {peer.user}
      </Text>
    </group>
  );
}
