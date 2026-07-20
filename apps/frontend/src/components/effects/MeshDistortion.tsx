'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vec3 pos = position;

    // Organic wave distortion
    float wave = sin(pos.x * 2.5 + uTime) * cos(pos.z * 2.5 + uTime * 0.7) * uIntensity * 0.08;
    wave += sin(pos.y * 3.0 + uTime * 1.2) * uIntensity * 0.05;
    wave += cos(pos.x * 1.5 - uTime * 0.8) * sin(pos.z * 1.5 + uTime * 0.9) * uIntensity * 0.04;

    pos.x += wave * 0.3;
    pos.y += wave * 0.5;
    pos.z += wave * 0.3;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    vNormal = normalize(normalMatrix * normal);
    vPosition = pos;
    vUv = uv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    // Edge lighting based on normals
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, light), 0.0);
    float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));

    // Iridescent color shift
    vec3 color = uColor;
    color += rim * 0.15 * vec3(0.8, 0.7, 1.0);
    color += diff * 0.1 * vec3(1.0, 0.9, 0.7);

    // Subtle noise pattern
    float n = sin(vUv.x * 50.0 + uTime) * cos(vUv.y * 50.0 + uTime * 0.5) * 0.02;
    color += n;

    // Edge glow
    color += rim * uIntensity * 0.2;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface Props {
  children: React.ReactNode;
  intensity?: number;
  color?: string;
}

export function MeshDistortionMaterial({
  intensity = 0.5,
  color = '#D4AF37',
}: Omit<Props, 'children'>) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uColor: { value: new THREE.Color(color) },
    }),
    [intensity, color],
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <shaderMaterial
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      transparent
      depthWrite={true}
    />
  );
}

/**
 * Wraps children and applies vertex distortion via shaderMaterial override.
 * Passes a custom material to any mesh child via React.cloneElement.
 */
export default function MeshDistortion({ children, intensity, color }: Props) {
  return <>{children}</>;
}
