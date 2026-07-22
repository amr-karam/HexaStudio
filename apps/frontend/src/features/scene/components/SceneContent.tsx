'use client';

import React, { useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { Float, Html, RoundedBox } from '@react-three/drei';
import { BoxGeometry, Color, CylinderGeometry, InstancedMesh, Matrix4, MeshPhysicalMaterial, Object3D, SphereGeometry } from 'three';
import { ArchitecturalModel } from './ArchitecturalModel';
import { Hotspot } from './Hotspot';
import { ProjectHotspot } from '@hexastudio/types';

interface SceneContentProps {
  projectModelUrl?: string;
  hotspots?: ProjectHotspot[];
  status?: string;
  milestones?: { total: number; completed: number };
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

// Column footprints: 4 corners + 2 mid-points along the long edges.
const COLUMN_FOOTPRINTS: Array<[number, number]> = [
  [2.6, 1.6],
  [-2.6, 1.6],
  [2.6, -1.6],
  [-2.6, -1.6],
  [0, 1.6],
  [0, -1.6],
];

// Glass facade panel layout: front + back of the main volume, split into segments.
const GLASS_PANELS: Array<[number, number, number]> = [
  [0.75, 1.4, 1.01],
  [-0.75, 1.4, 1.01],
  [0.75, 1.4, -1.01],
  [-0.75, 1.4, -1.01],
  [1.2, 1.4, 0.6],
  [-1.2, 1.4, -0.6],
];

function ProceduralArchitecture({ accent }: { accent: string }) {
  // Optimization: Use InstancedMesh for repetitive elements to reduce draw calls.
  // Each instanced mesh is a single draw call regardless of instance count.

  // Per-instance transforms for the slender gold columns (position only).
  const columnMatrices = useMemo(() => {
    const matrices: Matrix4[] = [];
    const dummy = new Object3D();
    for (const [x, z] of COLUMN_FOOTPRINTS) {
      // Columns rise from the top of the foundation slab (y = 0.4) up to the
      // cantilever soffit (y = 3.0). Height 2.6 → centered at 1.7.
      dummy.position.set(x, 1.7, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, []);

  // Per-instance transforms for the glass facade panels (position only).
  const glassMatrices = useMemo(() => {
    const matrices: Matrix4[] = [];
    const dummy = new Object3D();
    for (const [x, y, z] of GLASS_PANELS) {
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, []);

  // Per-instance transforms for the light spheres (base accents under columns).
  const lightMatrices = useMemo(() => {
    const matrices: Matrix4[] = [];
    const dummy = new Object3D();
    for (const [x, z] of COLUMN_FOOTPRINTS) {
      dummy.position.set(x, 0.46, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, []);

  // Manually-allocated GPU resources (geometries + materials for the instanced
  // meshes). These are NOT auto-disposed by R3F, so we own their lifecycle.
  // The accent color drives the status-tinted gold elements (columns + base
  // lights), preserving the original per-status theming contract.
  const accentColor = useMemo(() => new Color(accent), [accent]);
  const {
    columnGeom,
    columnMat,
    glassGeom,
    glassMat,
    lightGeom,
    lightMat,
  } = useMemo(() => {
    return {
      // Slender cylindrical gold-accent columns.
      columnGeom: new CylinderGeometry(0.045, 0.045, 2.6, 16),
      columnMat: new MeshPhysicalMaterial({
        color: accentColor.clone(),
        roughness: 0.1,
        metalness: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        emissive: accentColor.clone(),
        emissiveIntensity: 0.15,
        envMapIntensity: 2,
      }),
      // Glass facade panels (thin flat glazing).
      glassGeom: new BoxGeometry(1.4, 1.8, 0.04),
      glassMat: new MeshPhysicalMaterial({
        color: new Color('#ffffff'),
        roughness: 0.05,
        metalness: 0,
        transmission: 0.9,
        thickness: 0.5,
        ior: 1.4,
        transparent: true,
        opacity: 0.3,
        envMapIntensity: 1.5,
      }),
      // Glowing accent spheres at the column bases.
      lightGeom: new SphereGeometry(0.05, 16, 16),
      lightMat: new MeshPhysicalMaterial({
        color: accentColor.clone(),
        emissive: accentColor.clone(),
        emissiveIntensity: 5,
        roughness: 0.2,
        metalness: 0,
      }),
    };
  }, [accentColor]);

  const columnRef = useRef<InstancedMesh>(null);
  const glassRef = useRef<InstancedMesh>(null);
  const lightRef = useRef<InstancedMesh>(null);

  // Write per-instance matrices once after mount / on data change.
  useLayoutEffect(() => {
    if (columnRef.current) {
      columnMatrices.forEach((m, i) => columnRef.current!.setMatrixAt(i, m));
      columnRef.current.instanceMatrix.needsUpdate = true;
      columnRef.current.computeBoundingSphere();
    }
    if (glassRef.current) {
      glassMatrices.forEach((m, i) => glassRef.current!.setMatrixAt(i, m));
      glassRef.current.instanceMatrix.needsUpdate = true;
      glassRef.current.computeBoundingSphere();
    }
    if (lightRef.current) {
      lightMatrices.forEach((m, i) => lightRef.current!.setMatrixAt(i, m));
      lightRef.current.instanceMatrix.needsUpdate = true;
      lightRef.current.computeBoundingSphere();
    }
  }, [columnMatrices, glassMatrices, lightMatrices]);

  // Manual disposal of GPU resources we allocated in useMemo.
  useEffect(() => {
    return () => {
      columnGeom.dispose();
      columnMat.dispose();
      glassGeom.dispose();
      glassMat.dispose();
      lightGeom.dispose();
      lightMat.dispose();
    };
  }, [columnGeom, columnMat, glassGeom, glassMat, lightGeom, lightMat]);

  return (
    <Float speed={0.4} rotationIntensity={0.05} floatIntensity={0.08}>
      <group position={[0, 1.8, 0]}>

        {/* Foundation slab — dark concrete, thin platform. */}
        <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[6, 0.2, 4]} />
          <meshPhysicalMaterial
            color="#1a1a1f"
            roughness={0.7}
            metalness={0.1}
            envMapIntensity={1}
          />
        </mesh>

        {/* Main volume — beveled dark-metal pavilion body. */}
        <RoundedBox
          args={[3, 2, 2]}
          radius={0.08}
          smoothness={4}
          bevelSegments={3}
          creaseAngle={0.4}
          castShadow
          receiveShadow
          position={[0, 1.4, 0]}
        >
          <meshPhysicalMaterial
            color="#0f0f1a"
            roughness={0.15}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.2}
          />
        </RoundedBox>

        {/* Floating cantilever element — offset, hovering above. */}
        <RoundedBox
          args={[2.6, 0.2, 1.8]}
          radius={0.05}
          smoothness={4}
          bevelSegments={3}
          creaseAngle={0.4}
          castShadow
          receiveShadow
          position={[-0.8, 3.05, 0.4]}
        >
          <meshPhysicalMaterial
            color="#0f0f1a"
            roughness={0.15}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.4}
          />
        </RoundedBox>

        {/* Slender gold-accent columns (instanced). */}
        <instancedMesh
          ref={columnRef}
          args={[columnGeom, columnMat, columnMatrices.length]}
          castShadow
        />

        {/* Glass facade panels (instanced, transparent). */}
        <instancedMesh
          ref={glassRef}
          args={[glassGeom, glassMat, glassMatrices.length]}
        />

        {/* Glowing accent spheres at column bases (instanced). */}
        <instancedMesh
          ref={lightRef}
          args={[lightGeom, lightMat, lightMatrices.length]}
        />
      </group>
    </Float>
  );
}

export const SceneContent = ({
  projectModelUrl,
  hotspots = [],
  status,
  milestones,
}: SceneContentProps) => {
  const accent = useMemo(() => statusAccent(status), [status]);
  const progress = milestones && milestones.total > 0
    ? Math.round((milestones.completed / milestones.total) * 100)
    : null;

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

      {progress !== null && (
        <Html position={[3.4, 2.4, 0]} center distanceFactor={10} occlude>
          <div className="pointer-events-none flex select-none items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-mono text-white/70 backdrop-blur-md">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
            {progress}% · {milestones!.completed}/{milestones!.total}
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
