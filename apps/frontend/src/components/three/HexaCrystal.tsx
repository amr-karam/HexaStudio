'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vec3 pos = position;
    float wave = sin(pos.x * 2.5 + uTime) * cos(pos.y * 2.5 + uTime * 0.7) * 0.04;
    wave += sin(pos.y * 3.0 + uTime * 1.5) * 0.03;
    pos += normal * wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vPosition = pos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vec3 light = normalize(vec3(1.0, 1.0, 0.5));
    float diff = max(dot(vNormal, light), 0.0);
    float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    vec3 gold = vec3(0.83, 0.69, 0.22);
    vec3 color = gold * (0.4 + diff * 0.6);
    color += rim * 0.25 * gold;
    color += rim * 0.1 * vec3(1.0, 0.9, 0.7);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function HexaCrystal() {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    uniforms.uTime.value = time;
    meshRef.current.rotation.y = time * 0.15;
    meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.08;
    const pulse = 1 + Math.sin(time * 1.2) * 0.02;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.2, 2]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>
    </Float>
  );
}
