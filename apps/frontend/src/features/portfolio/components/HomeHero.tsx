'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';

const GOLDEN_ANGLE = 137.508;

/**
 * HomeHero — Cinematic hero for the redesigned HEXA STUDIO homepage.
 *
 * A full-viewport composition: muted type stack on the left, a procedurally
 * rendered "void garden" (golden-ratio spiral of floating monoliths) on the
 * right. The spiral reacts to cursor position when the user has a fine pointer
 * and motion is enabled, creating a subtle parallax of the 3D form.
 */
export function HomeHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const canvasY = useTransform(scrollYProgress, [0, 0.3], [0, -40]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.3]);
  const reducedMotion = useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (reducedMotion) return;
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
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    type Monolith = {
      x: number;
      y: number;
      z: number;
      w: number;
      h: number;
      d: number;
      rot: number;
    };

    const monoliths: Monolith[] = [];
    for (let i = 0; i < 24; i++) {
      const radius = 80 + i * 14;
      const angle = (i * GOLDEN_ANGLE * Math.PI) / 180;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.3;
      const z = Math.sin(i * 0.7) * 40;
      monoliths.push({
        x,
        y,
        z,
        w: 20 + (i % 3) * 12,
        h: 40 + (i % 5) * 20,
        d: 8 + (i % 2) * 6,
        rot: angle + Math.PI / 4,
      });
    }

    const project = (x: number, y: number, z: number, rot: number) => {
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const xR = x * cosR + z * sinR;
      const zR = -x * sinR + z * cosR;
      const screenX = xR - zR * 0.35;
      const screenY = y - zR * 0.2;
      return { x: screenX, y: screenY, z: zR };
    };

    const draw = (time: number) => {
      const t = (time - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0A0A0B';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + (mouse.x - 0.5) * 60;
      const cy = height / 2 + (mouse.y - 0.5) * 40;

      const sorted = [...monoliths].sort((a, b) => b.z - a.z);

      for (const m of sorted) {
        const p = project(m.x, m.y, m.z + Math.sin(t * 0.3 + m.x * 0.01) * 8, m.rot + t * 0.05);
        const sx = cx + p.x;
        const sy = cy - p.y;
        const sz = p.z;

        const shade = 1 - (sz + 80) / 160;
        const alpha = Math.max(0.05, Math.min(0.9, shade));
        const edgeAlpha = Math.max(0.2, Math.min(0.8, shade));

        const corners = [
          { x: sx - m.w / 2, y: sy + m.h / 2 },
          { x: sx + m.w / 2, y: sy + m.h / 2 },
          { x: sx + m.w / 2, y: sy - m.h / 2 },
          { x: sx - m.w / 2, y: sy - m.h / 2 },
        ];

        const depthOffset = sz * 0.3;
        const adjusted = corners.map((c) => ({ x: c.x - depthOffset, y: c.y - depthOffset }));

        const faceAlpha = 0.08 + alpha * 0.12;
        ctx.fillStyle = `rgba(212, 175, 55, ${faceAlpha})`;
        ctx.strokeStyle = `rgba(212, 175, 55, ${edgeAlpha})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(adjusted[0].x, adjusted[0].y);
        for (let i = 1; i < 4; i++) {
          ctx.lineTo(adjusted[i].x, adjusted[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const pulseSize = Math.sin(t * 0.5 + sz * 0.1) * 3;
        ctx.beginPath();
        ctx.ellipse(sx, sy + m.h / 2, 8 + pulseSize, 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${0.3 + alpha * 0.4})`;
        ctx.fill();

        ctx.strokeStyle = `rgba(212, 175, 55, ${0.15 + alpha * 0.2})`;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.ellipse(sx, sy + m.h / 2, 12 + pulseSize, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mouse, reducedMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full overflow-hidden bg-sl-void"
      aria-label="HEXA STUDIO — Architectural Visualization"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,55,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/20 to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-[1600px] grid-cols-1 items-center gap-12 px-6 py-20 sm:px-10 md:grid-cols-12 md:gap-16 md:px-16 md:py-32">
        <div className="md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-silver"
          >
            <span className="inline-block h-px w-8 align-middle bg-sl-gold-subtle/40 mr-3" />
            ARCHITECTURAL SPATIAL INTELLIGENCE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 font-serif text-[clamp(2.75rem,8vw,7rem)] font-light leading-[0.9] tracking-tight text-sl-alabaster"
          >
            Living
            <br />
            <span className="text-sl-gold-hover">Spaces</span>
            <br />
            Visualized.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 max-w-md text-sm font-light leading-relaxed text-sl-mist/60 sm:text-base"
          >
            We render the spaces the world has not yet seen — photoreal, cinematic,
            built from the same light that will one day fall on the real thing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <Link href="/projects" data-cursor="explore">
              <Button variant="primary" size="lg" className="min-h-[52px] min-w-[200px]">
                View the Work
              </Button>
            </Link>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-sl-mist/60 transition-colors duration-500 hover:text-sl-gold-hover"
            >
              <span className="inline-block h-px w-8 bg-sl-mist/30 transition-all duration-500 group-hover:w-12 group-hover:bg-sl-gold-subtle" />
              Begin a project
            </Link>
          </motion.div>
        </div>

        <motion.div
          style={{ y: canvasY, opacity: canvasOpacity }}
          className="relative md:col-span-5"
        >
          <div className="relative mx-auto aspect-square w-full max-w-[480px]">
            <div className="pointer-events-none absolute inset-0 border border-sl-gold-subtle/10" />
            <div className="pointer-events-none absolute inset-2 border border-sl-gold-subtle/6" />

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
                  className={`pointer-events-none absolute h-3 w-3 border-sl-gold-subtle/50 ${map[corner]}`}
                />
              );
            })}

            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            />

            <div className="pointer-events-none absolute -bottom-8 left-0 font-mono text-[9px] uppercase tracking-[0.4em] text-sl-mist/40">
              VOID GARDEN · 01 / 04 — MONOLITHS
            </div>
            <div className="pointer-events-none absolute -top-7 right-0 font-mono text-[9px] uppercase tracking-[0.4em] text-sl-mist/40">
              8K · OCTANE · UE5
            </div>
          </div>
        </motion.div>
      </div>

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
