'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  src: string;
  alt: string;
  className?: string;
  strength?: number;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uHover;
  uniform float uStrength;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec2 uv = vUv;

    // Displacement based on noise and hover
    float n = noise(uv * 5.0 + uTime * 0.3);
    float displacement = n * uHover * uStrength;

    // Edge darkening during hover
    float dist = length(uv - 0.5) * 2.0;
    float vignette = 1.0 - dist * uHover * 0.4;

    // Sample texture with displacement
    vec2 duv = uv + vec2(displacement * 0.03, displacement * 0.02);
    vec4 tex = texture2D(uTexture, duv);

    // Chromatic aberration on hover
    float ca = uHover * uStrength * 0.01;
    float r = texture2D(uTexture, duv + vec2(ca, 0.0)).r;
    float b = texture2D(uTexture, duv - vec2(ca, 0.0)).b;
    tex.r = mix(tex.r, r, uHover * 0.5);
    tex.b = mix(tex.b, b, uHover * 0.5);

    tex.rgb *= vignette;

    // Subtle grain on hover
    tex.rgb += (hash(uv * uTime * 200.0) - 0.5) * uHover * 0.015;

    gl_FragColor = tex;
  }
`;

export default function DisplacementHover({ src, alt, className, strength = 0.6 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const animRef = useRef<number>(0);

  // Spring-like hover interpolation
  const hoverTarget = useRef(0);
  const hoverCurrent = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    // Smooth hover transition
    hoverCurrent.current += (hoverTarget.current - hoverCurrent.current) * 0.1;
    setHover(hoverCurrent.current);

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate, loaded]);

  const onMouseEnter = () => { hoverTarget.current = 1; };
  const onMouseLeave = () => { hoverTarget.current = 0; };

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className ?? ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Fallback image (graceful degradation if WebGL unavailable) */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 0 : 1 }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Hover overlay labels */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: hover }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-xs uppercase tracking-[0.3em] text-white/80 font-mono bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          View Project
        </span>
      </motion.div>
    </motion.div>
  );
}
