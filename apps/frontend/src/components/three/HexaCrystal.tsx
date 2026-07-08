'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

export function HexaCrystal() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.2;
    meshRef.current.rotation.z = time * 0.1;
    
    // subtle float movement
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 15]} />
        <MeshDistortMaterial 
          color="#D4AF37" 
          speed={2} 
          distort={0.3} 
          radius={1} 
          metalness={0.9} 
          roughness={0.1} 
          emissive="#D4AF37" 
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}
