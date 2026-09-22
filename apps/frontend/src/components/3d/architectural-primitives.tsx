'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Points } from 'three';
import { COLOR_TOKENS } from '@/lib/color-tokens';

/**
 * ArchitecturalPrimitives — Abstract 3D geometric forms for story scenes.
 * Each primitive is a reusable, animated mesh with PBR materials
 * matching the HEXA Silent Luxury design system.
 */

// ─── Gold Monolith ───────────────────────────────────────────────
export function GoldMonolith({
  position = [0, 0, 0],
  scale = 1,
  speed = 0.3,
}: {
  position?: [number, number, number];
  scale?: number;
  speed?: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.002 * speed;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.15;
  });

  return (
    <mesh ref={ref} position={position} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[1, 2.5, 0.1]} />
      <meshPhysicalMaterial
        color={COLOR_TOKENS.GOLD}
        metalness={1}
        roughness={0.15}
        clearcoat={0.8}
        clearcoatRoughness={0.1}
        reflectivity={0.9}
      />
    </mesh>
  );
}

// ─── Concrete Panel ──────────────────────────────────────────────
export function ConcretePanel({
  position = [0, 0, 0],
  size = [3, 2, 0.1],
  rotation = 0,
}: {
  position?: [number, number, number];
  size?: [number, number, number];
  rotation?: number;
}) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="#1a1a1a"
        roughness={0.9}
        metalness={0.05}
        envMapIntensity={0.3}
      />
    </mesh>
  );
}

// ─── Glass Pillar ────────────────────────────────────────────────
export function GlassPillar({
  position = [0, 0, 0],
  height = 3,
  radius = 0.2,
}: {
  position?: [number, number, number];
  height?: number;
  radius?: number;
}) {
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]} castShadow>
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={0.1}
        roughness={0.05}
        transmission={0.85}
        thickness={0.5}
        transparent
        opacity={0.6}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

// ─── Floating Ring ──────────────────────────────────────────────
export function FloatingRing({
  position = [0, 0, 0],
  radius = 1.5,
  tube = 0.03,
  color = COLOR_TOKENS.GOLD_BRIGHT,
  speed = 0.5,
}: {
  position?: [number, number, number];
  radius?: number;
  tube?: number;
  color?: string;
  speed?: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 * speed) * 0.3 + 0.5;
    ref.current.rotation.z += 0.001 * speed;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 * speed) * 0.2;
  });

  return (
    <mesh ref={ref} position={position} castShadow>
      <torusGeometry args={[radius, tube, 16, 64]} />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

// ─── Grid Floor ─────────────────────────────────────────────────
export function GridFloor({
  position = [0, -1.5, 0],
  size = 20,
  divisions = 20,
  color = COLOR_TOKENS.OBSIDIAN_RAISED,
}: {
  position?: [number, number, number];
  size?: number;
  divisions?: number;
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color={color}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      <gridHelper
        args={[size, divisions, COLOR_TOKENS.GOLD_DEEP, COLOR_TOKENS.OBSIDIAN_RAISED]}
        position={[0, 0.001, 0]}
      />
    </group>
  );
}

// ─── Particle Field ─────────────────────────────────────────────
export function ParticleField({
  position = [0, 0, 0],
  count = 200,
  spread = 5,
  size = 0.02,
  color = COLOR_TOKENS.GOLD_BRIGHT,
}: {
  position?: [number, number, number];
  count?: number;
  spread?: number;
  size?: number;
  color?: string;
}) {
  const ref = useRef<Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return arr;
  }, [count, spread]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Scene 1: The Vision ───────────────────────────────────────
export function SceneOneVision() {
  return (
    <group>
      <GridFloor position={[0, -2, 0]} size={16} divisions={16} />
      <GoldMonolith position={[0, 0, -2]} scale={0.8} speed={0.2} />
      <FloatingRing position={[2.5, 0.5, -1]} radius={1.2} speed={0.3} />
      <FloatingRing position={[-2, -0.3, -0.5]} radius={0.8} speed={0.4} color={COLOR_TOKENS.GOLD_DEEP} />
      <ParticleField position={[0, 0, 0]} count={150} spread={4} size={0.015} />
      <pointLight position={[0, 3, 3]} intensity={1.5} color={COLOR_TOKENS.GOLD} distance={10} />
    </group>
  );
}

// ─── Scene 2: Materiality ──────────────────────────────────────
export function SceneTwoMateriality() {
  return (
    <group>
      <ConcretePanel position={[-2, 0, -3]} size={[2, 3, 0.15]} rotation={0.15} />
      <ConcretePanel position={[1.5, -0.5, -2]} size={[1.5, 2.5, 0.1]} rotation={-0.1} />
      <GlassPillar position={[0.5, 0, -1.5]} height={2.5} radius={0.15} />
      <GlassPillar position={[-1, 0, -1]} height={2} radius={0.12} />
      <GoldMonolith position={[2.5, 0, -2.5]} scale={0.5} speed={0.15} />
      <FloatingRing position={[0, 1.5, -1]} radius={2} tube={0.025} speed={0.25} />
      <pointLight position={[-1, 2, 2]} intensity={1.2} color="#fff5e6" distance={8} />
      <pointLight position={[2, 0, 1]} intensity={0.8} color={COLOR_TOKENS.GOLD_DEEP} distance={6} />
    </group>
  );
}

// ─── Scene 3: The Process ──────────────────────────────────────
export function SceneThreeProcess() {
  return (
    <group>
      <FloatingRing position={[0, 0, -2]} radius={2.5} tube={0.04} speed={0.3} />
      <FloatingRing position={[0, 0, -2]} radius={1.8} tube={0.02} speed={-0.2} color={COLOR_TOKENS.SURFACE_LIGHT} />
      <FloatingRing position={[0, 0, -2]} radius={1.1} tube={0.015} speed={0.4} color={COLOR_TOKENS.GOLD_DEEP} />
      <GoldMonolith position={[0, 0, -1]} scale={0.6} speed={0.5} />
      <ParticleField position={[0, 0, 0]} count={300} spread={6} size={0.02} color={COLOR_TOKENS.GOLD_BRIGHT} />
      <GridFloor position={[0, -2.5, 0]} size={20} divisions={20} />
      <pointLight position={[0, 4, 4]} intensity={2} color={COLOR_TOKENS.GOLD_BRIGHT} distance={12} />
    </group>
  );
}

// ─── Scene 4: The Finality ─────────────────────────────────────
export function SceneFourFinality() {
  return (
    <group>
      <GoldMonolith position={[0, 0, -3]} scale={1.2} speed={0.1} />
      <ConcretePanel position={[-3, -0.5, -4]} size={[1.5, 3, 0.1]} rotation={0.2} />
      <ConcretePanel position={[3, 0, -4.5]} size={[2, 2.5, 0.12]} rotation={-0.15} />
      <FloatingRing position={[0, 1, -2]} radius={3} tube={0.035} speed={0.15} />
      <FloatingRing position={[0, -1, -1.5]} radius={2} tube={0.02} speed={-0.2} color={COLOR_TOKENS.GOLD_DEEP} />
      <GlassPillar position={[-1.5, 0, -2]} height={3.5} radius={0.18} />
      <GlassPillar position={[1.5, 0, -2.5]} height={3} radius={0.15} />
      <ParticleField position={[0, 1, 0]} count={400} spread={7} size={0.025} color={COLOR_TOKENS.GOLD_BRIGHT} />
      <pointLight position={[0, 5, 5]} intensity={2.5} color="#fff5e6" distance={15} />
      <pointLight position={[0, -2, 3]} intensity={1} color={COLOR_TOKENS.GOLD} distance={10} />
    </group>
  );
}
