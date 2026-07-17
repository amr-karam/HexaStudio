'use client';

import { Text } from '@react-three/drei';
import type { Collaborator } from '../utils/xr-constants';

const COLORS = ['#D4AF37', '#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA'];

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

export function CollaboratorAvatar({ peer }: { peer: Collaborator }) {
  const color = colorFor(peer.id);

  return (
    <group position={[peer.position.x, peer.position.y + 0.05, peer.position.z]}>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <Text
        position={[0, 0.6, 0]}
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
