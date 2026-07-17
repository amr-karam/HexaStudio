'use client';

import React, { useMemo, useEffect } from 'react';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ArchitecturalModel } from './ArchitecturalModel';
import { Hotspot } from './Hotspot';
import { ProjectHotspot } from '@hexastudio/types';

interface SceneContentProps {
  projectModelUrl?: string;
  hotspots?: ProjectHotspot[];
  status?: string;
}

/**
 * Maps a raw Odoo stage name (e.g. "Proposal Sent", "Active") to a
 * brand-aligned accent color used to tint the procedural model + badge.
 */
function statusAccent(status?: string): string {
  const s = (status ?? '').toLowerCase();
  if (s.includes('won') || s.includes('active') || s.includes('deliver') || s.includes('completed'))
    return '#D4AF37'; // gold — live / delivered
  if (s.includes('proposal') || s.includes('negotiation') || s.includes('review'))
    return '#7BA7FF'; // blue — in progress / review
  if (s.includes('consult') || s.includes('qualif') || s.includes('contact'))
    return '#9B8CFF'; // violet — early pipeline
  if (s.includes('lost') || s.includes('archiv'))
    return '#6B7280'; // gray — closed
  return '#D4AF37'; // default gold
}

function ProceduralArchitecture({ accent }: { accent: string }) {
  // Optimization: Use InstancedMesh for repetitive elements to reduce draw calls
  const floatElements = useMemo(() => {
    const positions = [];
    const rotations = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 3;
      positions.push(Math.cos(angle) * radius, 1.5 + Math.sin(i) * 0.5, Math.sin(angle) * radius);
      rotations.push(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    }
    return { positions, rotations };
  }, []);

  const lightPositions = useMemo(() => {
    return [0, 90, 180, 270].map(deg => {
      const rad = (deg * Math.PI) / 180;
      return [Math.cos(rad) * 1.5, 0.1, Math.sin(rad) * 1.5];
    });
  }, []);

  const { floatGeom, floatMat, lightGeom, lightMat } = useMemo(() => {
    return {
      floatGeom: new THREE.BoxGeometry(0.1, 0.5, 0.1),
      floatMat: new THREE.MeshPhysicalMaterial({ color: '#D4AF37', roughness: 0, metalness: 1, envMapIntensity: 2 }),
      lightGeom: new THREE.SphereGeometry(0.04, 16, 16),
      lightMat: new THREE.MeshPhysicalMaterial({ color: '#D4AF37', emissive: '#D4AF37', emissiveIntensity: 5 }),
    };
  }, []);

  useEffect(() => {
    return () => {
      floatGeom.dispose();
      floatMat.dispose();
      lightGeom.dispose();
      lightMat.dispose();
    };
  }, [floatGeom, floatMat, lightGeom, lightMat]);


  return (
    <Float speed={0.6} rotationIntensity={0.1} floatIntensity={0.1}>
      <group position={[0, 1.8, 0]}>
        
        <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[6, 0.2, 4]} />
          <meshPhysicalMaterial
            color="#0a0a0f"
            roughness={0.2}
            metalness={0.8}
            envMapIntensity={1.5}
          />
        </mesh>

        
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

        
        <mesh castShadow receiveShadow position={[1.8, 1.5, 0]}>
          <boxGeometry args={[0.2, 3, 0.2]} />
          <meshPhysicalMaterial
            color={accent}
            roughness={0.1}
            metalness={1}
            emissive={accent}
            emissiveIntensity={0.2}
            envMapIntensity={2}
          />
        </mesh>

        
        {floatElements.positions.map((_, i) => (
          <mesh 
            key={`float-opt-${i}`} 
            castShadow 
            position={[
              floatElements.positions[i * 3],
              floatElements.positions[i * 3 + 1],
              floatElements.positions[i * 3 + 2]
            ]}
            rotation={[
              floatElements.rotations[i * 3],
              floatElements.rotations[i * 3 + 1],
              floatElements.rotations[i * 3 + 2]
            ]}
            geometry={floatGeom}
            material={floatMat}
          />
        ))}

        
        {lightPositions.map((pos, i) => (
          <mesh
            key={`base-light-opt-${i}`}
            position={pos as [number, number, number]}
            geometry={lightGeom}
            material={lightMat}
          />
        ))}
      </group>
    </Float>
  );
}

export const SceneContent = ({
  projectModelUrl,
  hotspots = [],
  status,
}: SceneContentProps) => {
  const accent = useMemo(() => statusAccent(status), [status]);

  return (
    <group>
      {projectModelUrl ? (
        <ArchitecturalModel url={projectModelUrl} />
      ) : (
        <ProceduralArchitecture accent={accent} />
      )}

      {hotspots.map((hotspot) => (
        <Hotspot key={hotspot.id} hotspot={hotspot} />
      ))}

      {status && (
        <Html position={[-3.4, 2.4, 0]} center distanceFactor={10} occlude>
          <div className="pointer-events-none select-none rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.3em] backdrop-blur-md" style={{ color: accent }}>
            {status}
          </div>
        </Html>
      )}

       <mesh
         receiveShadow
         rotation={[-Math.PI / 2, 0, 0]}
         position={[0, -0.01, 0]}
       >
         <planeGeometry args={[100, 100]} />
         <meshPhysicalMaterial
           color="#050505"
           roughness={0.4}
           metalness={0.1}
         />
      </mesh>

    </group>
  );
};
