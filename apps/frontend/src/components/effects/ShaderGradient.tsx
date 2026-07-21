'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, ShaderMaterial, Color } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* -------------------------------------------------------------------------- */
/*  Shaders                                                                    */
/* -------------------------------------------------------------------------- */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uSpeed;
  uniform float uIntensity;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * uSpeed;

    float n1 = fbm(uv * 2.5 + vec2(t * 0.3, t * 0.2));
    float n2 = fbm(uv * 3.0 - vec2(t * 0.15, t * 0.35));
    float n3 = fbm(uv * 1.8 + vec2(t * 0.25, -t * 0.15));

    float dist = length(uv - 0.5) * 2.0;
    float radial = smoothstep(1.2, 0.0, dist + n1 * 0.3);
    float vertical = uv.y + n2 * 0.15;
    float diag = (uv.x + uv.y) * 0.5 + n3 * 0.2;

    vec3 color = mix(uColor1, uColor2, vertical);
    color = mix(color, uColor3, radial * 0.6);
    color += (n1 + n2) * uIntensity * 0.03;
    color *= 1.0 - dist * 0.5;
    color += (hash(uv * t * 100.0) - 0.5) * 0.008;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                   */
/* -------------------------------------------------------------------------- */

const HEX = {
  obsidian: '#050508',
  midnight: '#0a0a1a',
  gold: '#D4AF37',
  deepBlue: '#0a1128',
  charcoal: '#111122',
};

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Props {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  intensity?: number;
  /** External visibility gate (e.g. IntersectionObserver). */
  visible?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ShaderGradient({
  color1 = HEX.midnight,
  color2 = HEX.deepBlue,
  color3 = HEX.obsidian,
  speed = 0.15,
  intensity = 0.8,
  visible = true,
}: Props) {
  const meshRef = useRef<Mesh>(null);
  const { viewport } = useThree();
  const reducedMotion = useReducedMotion();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new Color(color1) },
      uColor2: { value: new Color(color2) },
      uColor3: { value: new Color(color3) },
      uSpeed: { value: speed },
      uIntensity: { value: intensity },
    }),
    [color1, color2, color3, speed, intensity],
  );

  // Dispose owned resources on unmount.
  useEffect(() => {
    return () => {
      if (meshRef.current) {
        const geo = meshRef.current.geometry;
        const mat = meshRef.current.material;
        if (geo) geo.dispose();
        if (mat && mat !== meshRef.current.material) {
          // ShaderMaterial is not auto-disposed by R3F in all cases.
          (mat as ShaderMaterial).dispose();
        }
      }
    };
  }, []);

  // Freeze uTime under reduced motion or when not visible.
  const frozenTime = useRef(0);

  useFrame((_, delta) => {
    if (reducedMotion || !visible) {
      // Keep uTime constant at the frozen value.
      uniforms.uTime.value = frozenTime.current;
      return;
    }
    uniforms.uTime.value += delta;
    frozenTime.current = uniforms.uTime.value;
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]} position={[0, 0, -0.5]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
