
'use client';

import Link from 'next/link';
import type { EditorialHero } from '@hexastudio/types';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { EASE, DURATION } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';

/** Default hero copy — used when no CMS hero is configured. */
const DEFAULT_HERO: Required<Omit<EditorialHero, 'accentWord'>> & { accentWord?: string } = {
  eyebrow: 'Chapter 01 — Vision',
  title: 'Raw\nVision,\nRendered.',
  accentWord: undefined,
  subtitle:
    'Worlds composed from light and restraint — spatial narratives for brands that demand presence over noise.',
  primaryCtaLabel: 'Enter the Work',
  primaryCtaHref: '/projects',
  secondaryCtaLabel: 'The Atelier',
  secondaryCtaHref: '/studio',
};

/**
 * HeroEditorial — CH. I VISION (Editorial Asymmetry variant)
 *
 * An asymmetric, editorial composition: massive Cormorant display type
 * anchored bottom-left, hairline gold meta-rail top-left, and an oversized
 * ring motif bleeding off the top-right corner — negative space becomes
 * the active design element.
 *
 * Content is CMS-driven via the `hero` prop (fetched from Strapi); when no
 * hero is provided it renders the built-in default copy.
 *
 * - In-flow (`relative`, not `fixed`) so downstream content is never covered.
 * - Motion collapses under `prefers-reduced-motion` / motion policy.
 * - Design-token colors only (sl-void, accent, ink) — no raw hex.
 * - Fully declarative entrance (no scroll listeners, no JS timers).
 */
export function HeroEditorial({ hero }: { hero?: Partial<EditorialHero> }) {
  const reduced = useReducedMotion();
  const { staticMode } = useMotionPolicy();

  const animate = staticMode || reduced;
  const h = { ...DEFAULT_HERO, ...hero } as typeof DEFAULT_HERO;

  /** Staggered entrance — each layer reveals in sequence. */
  const reveal = (delay: number) =>
    animate
      ? {}
      : {
          initial: { opacity: 0, y: 32 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: DURATION.scene, ease: EASE.entrance, delay },
        };

  /**
   * Title rendering, in priority order:
   *  1. accentWord present → inline-italicize that word within the title.
   *  2. otherwise → split on newlines into stacked lines; any line ending with
   *     a comma is rendered as the gold italic accent line (editorial convention).
   */
  const renderTitle = () => {
    if (h.accentWord) {
      const [before, after] = h.title.split(h.accentWord);
      return (
        <>
          {before}
          <span className="italic text-sl-gold-hover/90">{h.accentWord}</span>
          {after}
        </>
      );
    }
    return h.title.split('\n').map((line, i) => (
      <span key={i} className="block">
        {line.endsWith(',') ? <span className="italic text-sl-gold-hover/90">{line}</span> : line}
      </span>
    ));
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
          'size-[min(80vw,880px)] rounded-full border border-sl-gold-subtle/10',
        )}
      >
        {/* Inner hairline ring — layered depth */}
        <div className="absolute inset-[14%] rounded-full border border-sl-gold-subtle/[0.06]" />
        {/* Slow counter-rotation under motion policy */}
        {!animate && (
          <motion.div
            className="absolute inset-[30%] rounded-full border border-dashed border-sl-gold-subtle/[0.08]"
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
          <span aria-hidden="true" className="block h-1 w-1 rotate-45 bg-sl-gold-subtle/60" />
          Spatial Design &amp; 3D Craft
        </span>
      </motion.nav>

      {/* Composition — bottom-left anchored */}
      <div className="relative z-10 px-6 pb-16 md:px-12 md:pb-24">
        <motion.p
          {...reveal(0.2)}
          className="mb-6 max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-[0.3em] text-sl-gold-hover/80 md:text-xs"
        >
          {h.eyebrow}
        </motion.p>

        <motion.h1
          {...reveal(0.3)}
          className={cn(
            'max-w-[14ch] font-serif text-[clamp(3.5rem,12vw,10.5rem)] leading-[0.85] tracking-tight text-sl-ink',
          )}
        >
          {renderTitle()}
        </motion.h1>

        <motion.p
          {...reveal(0.45)}
          className="mt-8 max-w-xl text-sm leading-relaxed text-sl-ink/60 md:text-base"
        >
          {h.subtitle}
        </motion.p>

        <motion.div {...reveal(0.6)} className="mt-10 flex flex-wrap items-center gap-6">
          <Link
            href={h.primaryCtaHref}
            className={cn(
              'group inline-flex items-center gap-3 border border-sl-gold-subtle/40 px-6 py-3',
              'font-mono text-[11px] uppercase tracking-[0.3em] text-sl-gold-hover',
              'transition-colors duration-500 hover:bg-sl-gold-subtle/10 hover:border-sl-gold-subtle',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-sl-void',
            )}
          >
            {h.primaryCtaLabel}
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-500 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>

          {h.secondaryCtaLabel && h.secondaryCtaHref && (
            <Link
              href={h.secondaryCtaHref}
              className={cn(
                'font-mono text-[11px] uppercase tracking-[0.3em] text-sl-ink/50',
                'underline decoration-sl-gold-subtle/30 underline-offset-8 decoration-1',
                'transition-colors duration-500 hover:text-sl-ink hover:decoration-sl-gold-subtle',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-sl-void',
              )}
            >
              {h.secondaryCtaLabel}
            </Link>
          )}
        </motion.div>
      </div>

      {/* Bottom hairline — transition into CH. II */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/20 to-transparent"
      />
    </section>
  );
}

export default HeroEditorial;
