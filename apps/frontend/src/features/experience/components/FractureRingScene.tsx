'use client';

import { useRef, useMemo, useEffect } from 'react';
import type { MotionValue } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { createFractureTexture } from './fracture-ring-texture';

/* -------------------------------------------------------------------------- */
/*  Shaders                                                                   */
/* -------------------------------------------------------------------------- */

const barycentricVertexShader = /* glsl */ `
  attribute vec3 barycentric;
  varying vec3 vBary;
  void main() {
    vBary = barycentric;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const barycentricFragmentShader = /* glsl */ `
  varying vec3 vBary;
  float wireMask(vec3 b, float t) {
    vec3 d = fwidth(b);
    vec3 a = smoothstep(vec3(0.0), d * t, b);
    return 1.0 - min(a.x, min(a.y, a.z));
  }
  void main() {
    float wf = wireMask(vBary, 1.6);
    vec3 col = mix(vec3(0.07, 0.01, 0.0), vec3(1.0, 0.28, 0.04), wf);
    col = mix(col, vec3(1.0, 0.8, 0.3) * 2.2, wf * 0.55);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* -------------------------------------------------------------------------- */
/*  Wireframe inner torus (barycentric shader)                                */
/* -------------------------------------------------------------------------- */

function WireframeTorus() {
  const geometry = useMemo(() => {
    const geo = new THREE.TorusGeometry(2, 0.4, 80, 80);
    const nonIndexed = geo.toNonIndexed();
    const count = nonIndexed.attributes.position.count;
    const bary = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 3) {
      bary[i * 3] = 1;
      bary[i * 3 + 1] = 0;
      bary[i * 3 + 2] = 0;
      bary[(i + 1) * 3] = 0;
      bary[(i + 1) * 3 + 1] = 1;
      bary[(i + 1) * 3 + 2] = 0;
      bary[(i + 2) * 3] = 0;
      bary[(i + 2) * 3 + 1] = 0;
      bary[(i + 2) * 3 + 2] = 1;
    }
    nonIndexed.setAttribute('barycentric', new THREE.BufferAttribute(bary, 3));
    geo.dispose();
    return nonIndexed;
  }, []);

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        vertexShader={barycentricVertexShader}
        fragmentShader={barycentricFragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stone shell torus (fractured alpha-mapped surface)                        */
/* -------------------------------------------------------------------------- */

function StoneShell() {
  const material = useMemo(() => {
    const alphaMap = createFractureTexture();
    return new THREE.MeshStandardMaterial({
      color: 0x1a1510,
      roughness: 0.85,
      metalness: 0.1,
      alphaMap,
      transparent: true,
      alphaTest: 0.35,
      side: THREE.DoubleSide,
    });
  }, []);

  return (
    <mesh material={material} scale={[1.02, 1.02, 1.02]}>
      <torusGeometry args={[2, 0.4, 80, 80]} />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene group — rotation driven by scroll + mouse                           */
/* -------------------------------------------------------------------------- */

interface FractureRingSceneProps {
  /** 0→1 scroll progress across the hero section. */
  scrollProgress?: MotionValue<number>;
  /** Whether subtle mouse-follow rotation is enabled. */
  finePointer: boolean;
}

function RingGroup({ scrollProgress, finePointer }: FractureRingSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  useThree();

  useEffect(() => {
    if (!finePointer) return;
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [finePointer]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const scrollValue = scrollProgress?.get() ?? 0;

    // Base spin from scroll + slow idle rotation.
    const targetY = scrollValue * Math.PI * 1.5 + performance.now() * 0.00005;
    const targetX = finePointer ? mouseRef.current.y * 0.25 : 0;

    // Smooth catch-up (damped lerp).
    const t = Math.min(delta * 1.5, 1);
    rotationRef.current.y += (targetY - rotationRef.current.y) * t;
    rotationRef.current.x += (targetX - rotationRef.current.x) * t;

    groupRef.current.rotation.y = rotationRef.current.y;
    groupRef.current.rotation.x = rotationRef.current.x;

    // Subtle hover breathe.
    const breathe = 1 + Math.sin(performance.now() * 0.0012) * 0.005;
    groupRef.current.scale.setScalar(breathe);
  });

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 8]}>
      <WireframeTorus />
      <StoneShell />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Canvas scene                                                              */
/* -------------------------------------------------------------------------- */

export function FractureRingScene({ scrollProgress, finePointer }: FractureRingSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={2.8} color="#fff4e0" />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#aabbff" />
      <Environment preset="city" />
      <RingGroup scrollProgress={scrollProgress} finePointer={finePointer} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.4} intensity={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
