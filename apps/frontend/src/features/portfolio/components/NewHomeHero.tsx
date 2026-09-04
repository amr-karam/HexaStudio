'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useFinePointer } from '@/hooks/useFinePointer';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';

/**
 * NewHomeHero — single-canvas "Architectural Plate" hero.
 *
 * Layout: full-viewport with a quiet left-aligned type stack and a
 * procedurally-rendered architectural fragment (canvas) on the right.
 * The 3D canvas is the only motion element; type is static.
 */
export function NewHomeHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const canvasY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.4]);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let raf = 0;
    const startTime = performance.now();

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
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

    // Project 3D point to 2D with simple isometric rotation
    const project = (x: number, y: number, z: number, rot: number) => {
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      // rotate around Y
      const xR = x * cosR + z * sinR;
      const zR = -x * sinR + z * cosR;
      // isometric
      const screenX = xR - zR * 0.4;
      const screenY = y - zR * 0.3;
      return { x: screenX, y: screenY, z: zR };
    };

    // Build a procedural "architectural fragment" — a stepped monolith.
    type Box = { x: number; y: number; z: number; w: number; h: number; d: number };
    const boxes: Box[] = [];
    // base slab
    boxes.push({ x: 0, y: 0.6, z: 0, w: 1.6, h: 0.12, d: 1.0 });
    // lower block
    boxes.push({ x: 0, y: 0.35, z: 0, w: 1.2, h: 0.5, d: 0.7 });
    // upper block
    boxes.push({ x: -0.15, y: 0.05, z: 0.05, w: 0.9, h: 0.3, d: 0.5 });
    // cantilever
    boxes.push({ x: 0.3, y: -0.1, z: -0.2, w: 0.5, h: 0.15, d: 0.3 });

    const draw = (time: number) => {
      const t = (time - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 40;
      const cy = height / 2 + (mouse.y - 0.5) * 30;
      const scale = Math.min(width, height) * 0.32;
      const baseRot = reducedMotion ? 0.15 : t * 0.12;

      // Sort boxes by depth
      const projected = boxes.map((b) => {
        const corners: Array<{ x: number; y: number; z: number }> = [
          { x: b.x - b.w / 2, y: b.y + b.h / 2, z: b.z - b.d / 2 },
          { x: b.x + b.w / 2, y: b.y + b.h / 2, z: b.z - b.d / 2 },
          { x: b.x + b.w / 2, y: b.y + b.h / 2, z: b.z + b.d / 2 },
          { x: b.x - b.w / 2, y: b.y + b.h / 2, z: b.z + b.d / 2 },
          { x: b.x - b.w / 2, y: b.y - b.h / 2, z: b.z - b.d / 2 },
          { x: b.x + b.w / 2, y: b.y - b.h / 2, z: b.z - b.d / 2 },
          { x: b.x + b.w / 2, y: b.y - b.h / 2, z: b.z + b.d / 2 },
          { x: b.x - b.w / 2, y: b.y - b.h / 2, z: b.z + b.d / 2 },
        ].map((p) => project(p.x, p.y, p.z, baseRot));
        return { box: b, corners, avgZ: corners.reduce((s, c) => s + c.z, 0) / 8 };
      }).sort((a, b) => b.avgZ - a.avgZ);

      for (const { corners } of projected) {
        const p = corners.map((c) => ({
          x: cx + c.x * scale,
          y: cy - c.y * scale,
        }));
        const [t0, t1, t2, t3, t4, t5, t6, t7] = p as [
          { x: number; y: number },
          { x: number; y: number },
          { x: number; y: number },
          { x: number; y: number },
          { x: number; y: number },
          { x: number; y: number },
          { x: number; y: number },
          { x: number; y: number },
        ];

        // Right face (front)
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t6.x, t6.y);
        ctx.lineTo(t5.x, t5.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(212, 175, 55, 0.18)';
        ctx.fill();

        // Top face
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
        ctx.fill();

        // Left face
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t7.x, t7.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(212, 175, 55, 0.04)';
        ctx.fill();

        // Edges (gold lines)
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
        ctx.lineWidth = 1;
        // visible edges only: 0-1, 1-2, 2-3, 3-0, 1-5, 2-6, 4-5, 5-6, 6-7, 7-4
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

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mouse.x, mouse.y, reducedMotion]);

  const handleMouseMove = finePointer
    ? (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouse({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    : undefined;

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full overflow-hidden bg-sl-void"
    >
      {/* Subtle grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />

      {/* Top metadata bar */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-6 font-mono text-[10px] uppercase tracking-[0.4em] text-sl-mist/40 sm:px-10 md:px-16 md:pt-8">
        <span>HEXA STUDIO · EST. 2024</span>
        <span className="hidden sm:inline">DARK · GOLD · SILENT</span>
        <span>N° 01 / VISION</span>
      </div>

      {/* Main composition: type on the left, canvas plate on the right */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-[1600px] grid-cols-1 items-center gap-8 px-6 py-12 sm:px-10 md:grid-cols-12 md:gap-12 md:px-16 md:py-20">
        {/* Type stack — left side, 7 cols */}
        <div className="md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-[10px] uppercase tracking-[0.5em] text-sl-gold-subtle/70"
          >
            <span className="inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
            <span className="ml-3">A studio of architectural vision</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 font-serif text-[clamp(2.75rem,8vw,7rem)] font-light leading-[0.95] tracking-[-0.02em] text-sl-alabaster"
          >
            Living
            <br />
            <span className="italic text-sl-gold-hover">Spaces</span>
            <br />
            Visualized.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 max-w-md text-sm font-light leading-relaxed text-sl-mist/70 sm:text-base"
          >
            We render the spaces the world has not yet seen — photoreal, cinematic, built from
            the same light that will one day fall on the real thing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <Magnetic>
              <Link href="/projects" data-cursor="explore">
                <Button variant="primary" size="lg" className="min-h-[52px] min-w-[200px]">
                  View the Work
                </Button>
              </Link>
            </Magnetic>
            <Link
              href="/contact"
              data-cursor="explore"
              className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-sl-mist/70 transition-colors duration-500 hover:text-sl-gold-hover"
            >
              <span className="inline-block h-px w-8 bg-sl-mist/30 transition-all duration-500 group-hover:w-12 group-hover:bg-sl-gold-subtle" />
              Start a project
            </Link>
          </motion.div>
        </div>

        {/* Canvas plate — right side, 5 cols */}
        <motion.div
          style={{ y: canvasY, opacity: canvasOpacity }}
          className="relative md:col-span-5"
        >
          <div className="relative aspect-square w-full max-w-[480px] mx-auto">
            {/* Frame */}
            <div className="pointer-events-none absolute inset-0 border border-sl-gold-subtle/15" />
            <div className="pointer-events-none absolute inset-3 border border-sl-gold-subtle/8" />

            {/* Corner crops */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => {
              const map: Record<typeof corner, string> = {
                tl: 'top-0 left-0 border-t border-l',
                tr: 'top-0 right-0 border-t border-r',
                bl: 'bottom-0 left-0 border-b border-l',
                br: 'bottom-0 right-0 border-b border-r',
              };
              return (
                <span
                  key={corner}
                  className={`pointer-events-none absolute h-4 w-4 border-sl-gold-subtle/60 ${map[corner]}`}
                />
              );
            })}

            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

            {/* Plate label */}
            <div className="pointer-events-none absolute -bottom-8 left-0 font-mono text-[9px] uppercase tracking-[0.4em] text-sl-mist/40">
              PLATE · 01 / 04 — MONOLITH
            </div>
            <div className="pointer-events-none absolute -top-7 right-0 font-mono text-[9px] uppercase tracking-[0.4em] text-sl-mist/40">
              8K · OCTANE · UE5
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom hairline + scroll cue */}
      <div className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-6 pb-6 sm:px-10 md:px-16 md:pb-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-mist/40">
          SCROLL
        </span>
        <div className="h-px flex-1 mx-6 bg-gradient-to-r from-sl-gold-subtle/20 via-sl-gold-subtle/20 to-transparent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-mist/40">
          CH. 02 / CRAFT ↓
        </span>
      </div>
    </section>
  );
}
