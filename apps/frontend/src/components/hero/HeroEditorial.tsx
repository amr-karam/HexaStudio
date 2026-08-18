
'use client';

import Link from 'next/link';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { EASE, DURATION } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroEditorial — CH. I VISION (Editorial Asymmetry variant)
 *
 * An asymmetric, editorial composition: massive Cormorant display type
 * anchored bottom-left, hairline gold meta-rail top-left, and an oversized
 * ring motif bleeding off the top-right corner — negative space becomes
 * the active design element.
 *
 * - In-flow (`relative`, not `fixed`) so downstream content is never covered.
 * - Motion collapses under `prefers-reduced-motion` / motion policy.
 * - Design-token colors only (sl-void, accent, ink) — no raw hex.
 * - Fully declarative entrance (no scroll listeners, no JS timers).
 */
export function HeroEditorial() {
  const reduced = useReducedMotion();
  const { staticMode } = useMotionPolicy();

  const animate = staticMode || reduced;

  /** Staggered entrance — each layer reveals in sequence. */
  const reveal = (delay: number) =>
    animate
      ? {}
      : {
          initial: { opacity: 0, y: 32 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: DURATION.scene, ease: EASE.entrance, delay },
        };

  return (
    <section
      id="ch-vision"
      aria-label="Vision — introduction"
      className={cn(
        'relative isolate flex min-h-[92svh] w-full flex-col justify-end overflow-hidden',
        'bg-sl-void text-sl-ink',
      )}
    >
      {/* Ambient atmosphere — top-right warm glow, echoes homepage vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.07),transparent_60%)]"
      />

      {/* Oversized ring motif — bleeds off the top-right corner (decorative) */}
      <motion.div
        aria-hidden="true"
        {...reveal(0.15)}
        className={cn(
          'pointer-events-none absolute -top-[30%] -right-[22%]',
          'size-[min(80vw,880px)] rounded-full border border-accent/10',
        )}
      >
        {/* Inner hairline ring — layered depth */}
        <div className="absolute inset-[14%] rounded-full border border-accent/[0.06]" />
        {/* Slow counter-rotation under motion policy */}
        {!animate && (
          <motion.div
            className="absolute inset-[30%] rounded-full border border-dashed border-accent/[0.08]"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 120, ease: 'linear' }}
          />
        )}
      </motion.div>

      {/* Meta rail — top-left mono labels */}
      <motion.nav
        {...reveal(0.05)}
        aria-label="Studio metadata"
        className="absolute left-6 top-24 flex flex-col gap-2 md:left-12"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-sl-ink/40">
          Hexa Studio — Atelier
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-sl-ink/30">
          <span aria-hidden="true" className="block h-1 w-1 rotate-45 bg-accent/60" />
          Spatial Design &amp; 3D Craft
        </span>
      </motion.nav>

      {/* Composition — bottom-left anchored */}
      <div className="relative z-10 px-6 pb-16 md:px-12 md:pb-24">
        <motion.p
          {...reveal(0.2)}
          className="mb-6 max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-[0.3em] text-accent/80 md:text-xs"
        >
          Chapter 01 — Vision
        </motion.p>

        <motion.h1
          {...reveal(0.3)}
          className={cn(
            'max-w-[14ch] font-serif text-[clamp(3.5rem,12vw,10.5rem)] leading-[0.85] tracking-tight text-sl-ink',
          )}
        >
          Raw
          <br />
          <span className="italic text-accent/90">Vision,</span>
          <br />
          Rendered.
        </motion.h1>

        <motion.p
          {...reveal(0.45)}
          className="mt-8 max-w-xl text-sm leading-relaxed text-sl-ink/60 md:text-base"
        >
          Worlds composed from light and restraint — spatial narratives for
          brands that demand presence over noise.
        </motion.p>

        <motion.div {...reveal(0.6)} className="mt-10 flex flex-wrap items-center gap-6">
          <Link
            href="/projects"
            className={cn(
              'group inline-flex items-center gap-3 border border-accent/40 px-6 py-3',
              'font-mono text-[11px] uppercase tracking-[0.3em] text-accent',
              'transition-colors duration-500 hover:bg-accent/10 hover:border-accent',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sl-void',
            )}
          >
            Enter the Work
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-500 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>

          <Link
            href="/studio"
            className={cn(
              'font-mono text-[11px] uppercase tracking-[0.3em] text-sl-ink/50',
              'underline decoration-accent/30 underline-offset-8 decoration-1',
              'transition-colors duration-500 hover:text-sl-ink hover:decoration-accent',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sl-void',
            )}
          >
            The Atelier
          </Link>
        </motion.div>
      </div>

      {/* Bottom hairline — transition into CH. II */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
      />
    </section>
  );
}

export default HeroEditorial;
