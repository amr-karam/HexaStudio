'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useScroll, useTransform, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { VoidGarden } from './VoidGarden';

/**
 * HomeHero — Cinematic hero for the redesigned HEXA STUDIO homepage.
 *
 * A full-viewport composition: muted type stack on the left, a procedurally
 * rendered "void garden" (golden-ratio spiral of floating monoliths) on the
 * right. The spiral reacts to cursor position when the user has a fine pointer
 * and motion is enabled, creating a subtle parallax of the 3D form.
 */
export function HomeHero() {
  const { scrollYProgress } = useScroll();
  const canvasY = useTransform(scrollYProgress, [0, 0.3], [0, -40]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.3]);
  const reducedMotion = useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

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
      id="hero"
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

            <div className="absolute inset-0 h-full w-full">
              <Canvas dpr={[1, 2]} shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
                <Environment preset="city" />
                <VoidGarden mouse={mouse} />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
              </Canvas>
            </div>

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
