'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Mesh, ShaderMaterial, Color, BufferGeometry, BufferAttribute, Points, PointsMaterial, AdditiveBlending } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* -------------------------------------------------------------------------- */
/*  Premium Shader Definitions                                                 */
/* -------------------------------------------------------------------------- */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 1. Premium Gradient with Gold Accent Rings
const gradientFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uGoldColor;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform float uGoldIntensity;
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
    for (int i = 0; i < 5; i++) {
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
    float n4 = fbm(uv * 4.0 + vec2(t * 0.05, t * 0.1));

    float dist = length(uv - 0.5) * 2.0;
    float radial = smoothstep(1.4, 0.0, dist + n1 * 0.25);
    float vertical = uv.y + n2 * 0.12;
    float diag = (uv.x + uv.y) * 0.5 + n3 * 0.15;

    vec3 color = mix(uColor1, uColor2, vertical);
    color = mix(color, uColor3, radial * 0.7);

    float goldRing1 = smoothstep(0.35, 0.33, dist + n4 * 0.15);
    float goldRing2 = smoothstep(0.68, 0.66, dist - n4 * 0.1);
    color += uGoldColor * (goldRing1 + goldRing2) * uGoldIntensity * 0.15;

    color += (n1 + n2 + n3) * uIntensity * 0.02;
    color += (hash(uv * t * 150.0) - 0.5) * 0.006;

    color *= 1.0 - dist * 0.35;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// 2. Glass Morphism Surface
const glassFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform float uOpacity;
  uniform float uBorderOpacity;
  uniform vec3 uHighlightColor;
  uniform float uHighlightIntensity;
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

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.05;

    vec3 color = uBaseColor;
    
    float topHighlight = smoothstep(0.8, 1.0, uv.y) * uHighlightIntensity;
    color += uHighlightColor * topHighlight;
    
    float edgeHighlight = (smoothstep(0.0, 0.02, uv.x) + 
                           smoothstep(1.0, 0.98, uv.x) + 
                           smoothstep(0.0, 0.02, uv.y) + 
                           smoothstep(1.0, 0.98, uv.y)) * 0.15;
    color += uHighlightColor * edgeHighlight;

    float caustic = noise(uv * 5.0 + vec2(t * 0.3, -t * 0.2)) * 0.001;
    color += vec3(caustic);

    float border = max(
      max(smoothstep(0.0, 0.015, uv.x), smoothstep(1.0, 0.985, uv.x)),
      max(smoothstep(0.0, 0.015, uv.y), smoothstep(1.0, 0.985, uv.y))
    );
    color += uHighlightColor * border * uBorderOpacity;

    gl_FragColor = vec4(color, uOpacity);
  }
`;

/* -------------------------------------------------------------------------- */
/*  Premium Constants                                                          */
/* -------------------------------------------------------------------------- */

const PREMIUM = {
  void: '#0A0A0B',
  obsidian: '#0F0F10',
  obsidianRaised: '#161618',
  gold: '#D4AF37',
  goldBright: '#E5C76B',
  goldDeep: '#A8862E',
};

/* -------------------------------------------------------------------------- */
/*  Premium Gradient Component                                                 */
/* -------------------------------------------------------------------------- */

interface PremiumGradientProps {
  color1?: string;
  color2?: string;
  color3?: string;
  goldColor?: string;
  speed?: number;
  intensity?: number;
  goldIntensity?: number;
  visible?: boolean;
}

export function PremiumGradient({
  color1 = PREMIUM.obsidian,
  color2 = '#0a1128',
  color3 = PREMIUM.void,
  goldColor = PREMIUM.gold,
  speed = 0.12,
  intensity = 0.6,
  goldIntensity = 0.8,
  visible = true,
}: PremiumGradientProps) {
  const meshRef = useRef<Mesh>(null);
  const { viewport } = useThree();
  const reducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new Color(color1) },
      uColor2: { value: new Color(color2) },
      uColor3: { value: new Color(color3) },
      uGoldColor: { value: new Color(goldColor) },
      uSpeed: { value: speed },
      uIntensity: { value: intensity },
      uGoldIntensity: { value: goldIntensity },
    }),
    [color1, color2, color3, goldColor, speed, intensity, goldIntensity],
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        (meshRef.current.material as ShaderMaterial).dispose();
      }
    };
  }, []);

  const frozenTime = useRef(0);

  useFrame((_, delta) => {
    if (reducedMotion || !visible) {
      uniforms.uTime.value = frozenTime.current;
      return;
    }
    uniforms.uTime.value += delta;
    frozenTime.current = uniforms.uTime.value;
  });

  if (!isMounted) return null;

  return (
    <mesh
      ref={meshRef}
      scale={[viewport.width, viewport.height, 1]}
      position={[0, 0, -0.5]}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={gradientFragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Glass Morphism Component                                                   */
/* -------------------------------------------------------------------------- */

interface GlassMorphismProps {
  baseColor?: string;
  opacity?: number;
  borderOpacity?: number;
  highlightColor?: string;
  highlightIntensity?: number;
  visible?: boolean;
}

export function GlassMorphism({
  baseColor = 'rgba(22, 22, 24, 0.7)',
  opacity = 1.0,
  borderOpacity = 0.3,
  highlightColor = PREMIUM.gold,
  highlightIntensity = 0.6,
  visible = true,
}: GlassMorphismProps) {
  const meshRef = useRef<Mesh>(null);
  const { viewport } = useThree();
  const reducedMotion = useReducedMotion();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new Color(baseColor) },
      uOpacity: { value: opacity },
      uBorderOpacity: { value: borderOpacity },
      uHighlightColor: { value: new Color(highlightColor) },
      uHighlightIntensity: { value: highlightIntensity },
    }),
    [baseColor, opacity, borderOpacity, highlightColor, highlightIntensity],
  );

  useEffect(() => {
    return () => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        (meshRef.current.material as ShaderMaterial).dispose();
      }
    };
  }, []);

  const frozenTime = useRef(0);

  useFrame((_, delta) => {
    if (reducedMotion || !visible) {
      uniforms.uTime.value = frozenTime.current;
      return;
    }
    uniforms.uTime.value += delta;
    frozenTime.current = uniforms.uTime.value;
  });

  return (
    <mesh
      ref={meshRef}
      scale={[viewport.width, viewport.height, 1]}
      position={[0, 0, -0.1]}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={glassFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Premium Particles Component                                                */
/* -------------------------------------------------------------------------- */

interface PremiumParticlesProps {
  count?: number;
  spread?: number;
  size?: number;
  color?: string;
  opacity?: number;
  speed?: number;
  visible?: boolean;
}

export function PremiumParticles({
  count = 300,
  spread = 8,
  size = 0.012,
  color = PREMIUM.gold,
  opacity = 0.12,
  speed = 0.08,
  visible = true,
}: PremiumParticlesProps) {
  const pointsRef = useRef<Points>(null);
  const reducedMotion = useReducedMotion();
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const [material, setMaterial] = useState<PointsMaterial | null>(null);

  // Initialize particle data
  useEffect(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
      pos[i * 3 + 2] = Math.random() * spread * 0.6 - spread * 0.3;
      ph[i] = Math.random() * Math.PI * 2;
      sz[i] = size * (0.5 + Math.random() * 0.5);
    }

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('phase', new BufferAttribute(ph, 1));
    geo.setAttribute('size', new BufferAttribute(sz, 1));
    setGeometry(geo);

    const mat = new PointsMaterial({
      color: new Color(color),
      size: 1,
      transparent: true,
      opacity,
      blending: AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      sizeAttenuation: true,
      vertexColors: false,
    });
    setMaterial(mat);

    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [count, spread, size, color, opacity]);

  useFrame((state) => {
    if (!pointsRef.current || reducedMotion || !visible || !geometry) return;

    const elapsed = state.clock.elapsedTime * speed;
    const posAttr = geometry.attributes.position;
    const phaseAttr = geometry.attributes.phase;
    const arr = posAttr.array as Float32Array;
    const phArr = phaseAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const seed = phArr[i];

      arr[idx] += Math.cos(elapsed * 0.7 + seed * 11) * (spread * 0.015);
      arr[idx + 1] += Math.sin(elapsed * 0.5 + seed * 13) * (spread * 0.02);
      arr[idx + 2] += Math.cos(elapsed * 0.4 + seed * 7) * (spread * 0.012);
    }
    posAttr.needsUpdate = true;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = elapsed * 0.015;
      pointsRef.current.rotation.x = elapsed * 0.008;
      pointsRef.current.rotation.z = elapsed * 0.005;
    }
  }, 1);

  if (!geometry || !material) return null;

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/* -------------------------------------------------------------------------- */
/*  Premium Scene Composer                                                     */
/* -------------------------------------------------------------------------- */

interface PremiumSceneProps {
  gradient?: PremiumGradientProps;
  glass?: GlassMorphismProps;
  particles?: PremiumParticlesProps;
  className?: string;
  enabled?: boolean;
}

export function PremiumScene({
  gradient = {},
  glass = {},
  particles = {},
  className = '',
  enabled = true,
}: PremiumSceneProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion || !enabled) {
    return (
      <div className={`fixed inset-0 -z-10 pointer-events-none ${className}`} aria-hidden="true">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, #0F0F10 0%, #0a1128 50%, #0A0A0B 100%)',
          }}
        />
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 -z-10 pointer-events-none ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 45 }}
        dpr={[1, 1.25]}
        style={{ background: gradient.color1 || PREMIUM.void }}
      >
        <Suspense fallback={null}>
          <PremiumGradient {...gradient} />
          <GlassMorphism {...glass} />
          <PremiumParticles {...particles} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Radial Glow Background — reusable gold-aura surface                        */
/* -------------------------------------------------------------------------- */

interface RadialGlowProps {
  dark?: boolean;
  className?: string;
}

export function RadialGlow({ dark = false, className = '' }: RadialGlowProps) {
  return (
    <div
      className={`
        absolute -z-10 blur-3xl opacity-20
        ${dark
          ? 'inset-0 bg-gradient-to-br from-gold-deep via-gold/20 to-transparent'
          : 'inset-0 bg-gradient-to-br from-gold/30 via-gold-deep/20 to-transparent'}
        ${className}
      `}
      aria-hidden="true"
    />
  );
}