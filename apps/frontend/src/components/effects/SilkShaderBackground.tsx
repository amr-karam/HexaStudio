'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * SilkShaderBackground — a lightweight WebGL silk/iridescence shader.
 *
 * React Bits DNA: produces the living-gradient depth effect used by Stripe's
 * animated mesh-gradient hero. Runs on a raw <canvas> with WebGL — no Three.js
 * dependency, ~3KB gzipped, fully self-contained.
 *
 * Performance:
 * - Dynamically imported (SSR: false)
 * - Respects `prefers-reduced-motion` — renders static fallback
 * - Pauses when tab is hidden (requestAnimationFrame gating)
 * - Cleans up WebGL context on unmount
 *
 * Props:
 * - `speed` — animation speed multiplier (default 0.4)
 * - `opacity` — canvas opacity (default 0.15)
 * - `className` — additional classes
 */

interface SilkShaderBackgroundProps {
  speed?: number;
  opacity?: number;
  className?: string;
}

const VERT_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAG_SHADER = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;

  // Simplex noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.15;

    // Layered silk waves
    float wave1 = snoise(vec2(uv.x * 2.0 + t, uv.y * 1.5 + t * 0.7)) * 0.5 + 0.5;
    float wave2 = snoise(vec2(uv.x * 3.0 - t * 0.5, uv.y * 2.0 + t * 0.3)) * 0.5 + 0.5;
    float wave3 = snoise(vec2(uv.x * 1.5 + t * 0.8, uv.y * 3.0 - t * 0.4)) * 0.5 + 0.5;

    // Iridescent color mixing (champagne gold palette)
    vec3 gold = vec3(0.831, 0.686, 0.216);   // #D4AF37
    vec3 champagne = vec3(0.898, 0.776, 0.420); // #E5C76B
    vec3 obsidian = vec3(0.020, 0.020, 0.024);  // #050508
    vec3 ivory = vec3(0.95, 0.93, 0.88);

    // Silk color layers
    vec3 color = mix(obsidian, gold, wave1 * 0.12);
    color = mix(color, champagne, wave2 * 0.06);
    color = mix(color, ivory, wave3 * 0.03);

    // Radial vignette (center bright, edges dark)
    float vignette = 1.0 - length((uv - 0.5) * 1.4);
    vignette = smoothstep(0.0, 0.8, vignette);

    // Specular highlight streak
    float streak = pow(1.0 - abs(uv.y - 0.5 - wave1 * 0.15), 8.0) * 0.08;
    color += gold * streak * vignette;

    gl_FragColor = vec4(color, vignette * 0.7);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Silk shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vert: WebGLShader, frag: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Silk program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export const SilkShaderBackground: React.FC<SilkShaderBackgroundProps> = ({
  speed = 0.4,
  opacity = 0.15,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    // Resize
    const dpr = Math.min(window.devicePixelRatio, 1.5); // Cap at 1.5 for performance
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Init shaders (only once)
    if (!canvas.dataset.shaderInit) {
      const vert = createShader(gl, gl.VERTEX_SHADER, VERT_SHADER);
      const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAG_SHADER);
      if (!vert || !frag) return;

      const program = createProgram(gl, vert, frag);
      if (!program) return;

      gl.useProgram(program);

      // Full-screen quad
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
      ]), gl.STATIC_DRAW);

      const posLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      canvas.dataset.shaderInit = 'true';
      canvas.dataset.programId = String(program);
    }

    const program = gl.getProgramParameter(Number(canvas.dataset.programId), gl.LINK_STATUS)
      ? Number(canvas.dataset.programId)
      : null;

    if (!program) return;

    gl.useProgram(program);

    // Uniforms
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');

    if (startTimeRef.current === 0) startTimeRef.current = performance.now() / 1000;
    const elapsed = (performance.now() / 1000 - startTimeRef.current) * speed;

    gl.uniform1f(timeLoc, elapsed);
    gl.uniform2f(resLoc, canvas.width, canvas.height);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, [speed]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let running = true;

    const loop = () => {
      if (!running) return;
      // Pause when tab hidden
      if (document.hidden) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      render();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
      // Cleanup WebGL context
      const canvas = canvasRef.current;
      if (canvas) {
        const gl = canvas.getContext('webgl');
        if (gl) {
          const programId = canvas.dataset.programId;
          if (programId) gl.deleteProgram(Number(programId));
        }
      }
    };
  }, [prefersReducedMotion, render]);

  // Static fallback for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          'absolute inset-0 pointer-events-none',
          'bg-gradient-to-br from-accent/5 via-transparent to-accent/3',
          className,
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
};

export default SilkShaderBackground;
