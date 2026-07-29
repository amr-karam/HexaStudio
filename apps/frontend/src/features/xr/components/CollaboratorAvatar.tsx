'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Vector3, Quaternion, Group, Mesh, MeshBasicMaterial } from 'three';
import type { Collaborator } from '../utils/xr-constants';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const COLORS = ['#D4AF37', '#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA'];
const LERP_SPEED = 8; // per second
const SLERP_SPEED = 8;
const MAX_DELTA = 0.1;
const SPEAK_PULSE_SPEED = 3; // ring pulse oscillation speed

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CollaboratorAvatar({
  peer,
  isSpeaking = false,
}: {
  peer: Collaborator;
  isSpeaking?: boolean;
}) {
  const color = colorFor(peer.id);
  const groupRef = useRef<Group>(null);
  const ringMeshRef = useRef<Mesh>(null);
  const ringPhase = useRef(Math.random() * Math.PI * 2);

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

    // Speaking ring pulse animation.
    if (ringMeshRef.current) {
      const mat = ringMeshRef.current.material as MeshBasicMaterial;
      ringPhase.current += delta * SPEAK_PULSE_SPEED;
      if (isSpeaking) {
        const pulse = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(ringPhase.current));
        mat.opacity = pulse * 0.8;
        const s = 1 + 0.15 * Math.sin(ringPhase.current);
        ringMeshRef.current.scale.set(s, s, s);
      } else {
        // Fade out when not speaking.
        mat.opacity = Math.max(0, mat.opacity - dt * 2);
        ringMeshRef.current.scale.lerp(
          new Vector3(1, 1, 1),
          Math.min(1, dt * 4),
        );
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Speaking ring — always rendered, driven by opacity */}
      <mesh
        ref={ringMeshRef}
        position={[0, 0.35, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.09, 0.11, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          side={2}
        />
      </mesh>

      {/* Avatar sphere */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>

      {/* Body cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>

      {/* Name label */}
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
