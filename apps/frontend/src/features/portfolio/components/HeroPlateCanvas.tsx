'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

/**
 * HeroPlateCanvas — the real-time 2D "Architectural Plate".
 *
 * Loaded on demand as a progressive enhancement that overlays the static SVG
 * plate rendered by `NewHomeHeroStatic`. Unlike the legacy hero, this canvas:
 *  - only starts its `requestAnimationFrame` loop when in-viewport AND visible
 *    AND not reduced-motion (PERFORMANCE.md §2 render-loop control),
 *  - respects a low-end device quality cap,
 *  - renders a single static frame for reduced-motion users (canvas stays
 *    invisible so the static SVG plate remains visible).
 *
 * @see ADR-019, PERFORMANCE.md §2
 */
type Box = { x: number; y: number; z: number; w: number; h: number; d: number };

export function HeroPlateCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const { isLowEnd } = useDeviceCapabilities();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    // Alias the narrowed context so nested render callbacks stay type-safe.
    const ctx: CanvasRenderingContext2D = maybeCtx;

    const adaptiveQuality = isLowEnd ? 0.5 : 1;
    const dpr = Math.min(window.devicePixelRatio || 1, isLowEnd ? 1.5 : 2);

    let width = 0;
    let height = 0;
    let raf = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const boxes: Box[] = [
      { x: 0, y: 0.6, z: 0, w: 1.6, h: 0.12, d: 1.0 },
      { x: 0, y: 0.35, z: 0, w: 1.2, h: 0.5, d: 0.7 },
      { x: 0, y: 0.05, z: 0.05, w: 0.9, h: 0.3, d: 0.5 },
      { x: 0.3, y: -0.1, z: -0.2, w: 0.5, h: 0.15, d: 0.3 },
    ];

    const project = (x: number, y: number, z: number, rot: number) => {
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const xR = x * cosR + z * sinR;
      const zR = -x * sinR + z * cosR;
      return { x: xR - zR * 0.4, y: y - zR * 0.3, z: zR };
    };

    const startTime = performance.now();

    function renderFrame(time: number) {
      ctx.clearRect(0, 0, width, height);
      const t = (time - startTime) / 1000;
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.32 * adaptiveQuality;
      const rot = reducedMotion ? 0.15 : t * 0.12;

      const projected = boxes
        .map((b) => {
          const corners = [
            { x: b.x - b.w / 2, y: b.y + b.h / 2, z: b.z - b.d / 2 },
            { x: b.x + b.w / 2, y: b.y + b.h / 2, z: b.z - b.d / 2 },
            { x: b.x + b.w / 2, y: b.y + b.h / 2, z: b.z + b.d / 2 },
            { x: b.x - b.w / 2, y: b.y + b.h / 2, z: b.z + b.d / 2 },
            { x: b.x - b.w / 2, y: b.y - b.h / 2, z: b.z - b.d / 2 },
            { x: b.x + b.w / 2, y: b.y - b.h / 2, z: b.z - b.d / 2 },
            { x: b.x + b.w / 2, y: b.y - b.h / 2, z: b.z + b.d / 2 },
            { x: b.x - b.w / 2, y: b.y - b.h / 2, z: b.z + b.d / 2 },
          ].map((p) => project(p.x, p.y, p.z, rot));
          return { corners, avgZ: corners.reduce((s, c) => s + c.z, 0) / 8 };
        })
        .sort((a, b) => b.avgZ - a.avgZ);

      for (const { corners } of projected) {
        const p = corners.map((c) => ({ x: cx + c.x * scale, y: cy - c.y * scale }));
        ctx.beginPath();
        ctx.moveTo(p[1].x, p[1].y);
        ctx.lineTo(p[2].x, p[2].y);
        ctx.lineTo(p[6].x, p[6].y);
        ctx.lineTo(p[5].x, p[5].y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(212,175,55,0.18)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        ctx.lineTo(p[1].x, p[1].y);
        ctx.lineTo(p[2].x, p[2].y);
        ctx.lineTo(p[3].x, p[3].y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(212,175,55,0.08)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        ctx.lineTo(p[3].x, p[3].y);
        ctx.lineTo(p[7].x, p[7].y);
        ctx.lineTo(p[4].x, p[4].y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(212,175,55,0.04)';
        ctx.fill();

        ctx.strokeStyle = 'rgba(212,175,55,0.55)';
        ctx.lineWidth = 1;
        const edges: Array<[number, number]> = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [1, 5], [2, 6], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [3, 7],
        ];
        for (const [a, b] of edges) {
          ctx.beginPath();
          ctx.moveTo(p[a].x, p[a].y);
          ctx.lineTo(p[b].x, p[b].y);
          ctx.stroke();
        }
      }
    }

    let loopRunning = false;
    const startLoop = () => {
      if (loopRunning) return;
      loopRunning = true;
      const step = (now: number) => {
        if (!loopRunning) return;
        renderFrame(now);
        if (!reducedMotion) {
          raf = requestAnimationFrame(step);
        }
      };
      raf = requestAnimationFrame(step);
    };
    const stopLoop = () => {
      loopRunning = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') startLoop();
      else stopLoop();
    };
    window.addEventListener('visibilitychange', onVisibility);

    const io = new IntersectionObserver((entries) => {
      const visible = entries[0]?.isIntersecting ?? false;
      if (visible) {
        renderFrame(performance.now());
        if (!reducedMotion && document.visibilityState === 'visible') startLoop();
      } else {
        stopLoop();
      }
    });
    io.observe(canvas);

    // Reduced-motion users get a single rendered frame, then stop.
    if (reducedMotion) {
      renderFrame(performance.now());
    } else {
      startLoop();
    }

    return () => {
      stopLoop();
      window.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
      ro.disconnect();
    };
  }, [reducedMotion, isLowEnd]);

  // Reduced-motion / no-JS: the static SVG plate underneath remains visible.
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      width={480}
      height={480}
      aria-hidden="true"
    />
  );
}
