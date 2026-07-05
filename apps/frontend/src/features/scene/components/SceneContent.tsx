'use client';

import React from 'react';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { ArchitecturalModel } from './ArchitecturalModel';
import { Hotspot } from './Hotspot';
import { ProjectHotspot } from '@hexastudio/types';

interface SceneContentProps {
  projectModelUrl?: string;
  hotspots?: ProjectHotspot[];
}

function ProceduralArchitecture() {
  return (
    <Float speed={0.6} rotationIntensity={0.1} floatIntensity={0.1}>
      <group position={[0, 1.8, 0]}>
        {/* Main Architectural Base */}
        <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[6, 0.2, 4]} />
          <meshPhysicalMaterial
            color="#0a0a0f"
            roughness={0.2}
            metalness={0.8}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Primary Monolith */}
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          <boxGeometry args={[3, 2, 2]} />
          <meshPhysicalMaterial
            color="#0f0f1a"
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Accent Column */}
        <mesh castShadow receiveShadow position={[1.8, 1.5, 0]}>
          <boxGeometry args={[0.2, 3, 0.2]} />
          <meshPhysicalMaterial
            color="#c9a96e"
            roughness={0.1}
            metalness={1}
            emissive="#c9a96e"
            emissiveIntensity={0.2}
            envMapIntensity={2}
          />
        </mesh>

        {/* Floating Geometric Elements */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 3;
          return (
            <mesh 
              key={`float-${i}`} 
              castShadow 
              position={[Math.cos(angle) * radius, 1.5 + Math.sin(i) * 0.5, Math.sin(angle) * radius]}
              rotation={[Math.random(), Math.random(), Math.random()]}
            >
              <boxGeometry args={[0.1, 0.5, 0.1]} />
              <meshPhysicalMaterial
                color="#c9a96e"
                roughness={0}
                metalness={1}
                envMapIntensity={2}
              />
            </mesh>
          );
        })}

        {/* Base Lights */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh
              key={`base-light-${i}`}
              position={[Math.cos(rad) * 1.5, 0.1, Math.sin(rad) * 1.5]}
            >
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshPhysicalMaterial
                color="#c9a96e"
                emissive="#c9a96e"
                emissiveIntensity={5}
              />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

export const SceneContent = ({
  projectModelUrl,
  hotspots = [],
}: SceneContentProps) => {
  return (
    <group>
      {projectModelUrl ? (
        <ArchitecturalModel url={projectModelUrl} />
      ) : (
        <ProceduralArchitecture />
      )}

      {hotspots.map((hotspot) => (
        <Hotspot key={hotspot.id} hotspot={hotspot} />
      ))}

      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
      >
        <planeGeometry args={[100, 100]} />
        <meshPhysicalMaterial
          color="#050508"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};
