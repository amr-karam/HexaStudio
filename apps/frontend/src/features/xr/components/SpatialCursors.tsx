'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { useXRStore } from '@/features/xr/store/xr-store';
import type { Collaborator } from '@/features/xr/utils/xr-constants';

export function SpatialCursors() {
  const collaborators = useXRStore((s) => s.collaborators);

  return (
    <>
      {Object.values(collaborators).map((peer) => (
        <SpatialCursor key={peer.id} peer={peer} />
      ))}
    </>
  );
}

function SpatialCursor({ peer }: { peer: Collaborator }) {
  const { position } = peer;

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* The Marker */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
      </mesh>
      
      {/* The Label */}
      <Text
        position={[0, 0.15, 0]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="black"
      >
        {peer.user}
      </Text>
    </group>
  );
}
