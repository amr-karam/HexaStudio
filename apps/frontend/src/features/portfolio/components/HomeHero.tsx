'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { FractureRingHero } from '@/features/experience/components/FractureRingHero';
import { ChapterMarker } from '@/components/animation/ChapterMarker';
import { ScrollCue } from '@/components/scroll/ScrollCue';
import { useFinePointer } from '@/hooks/useFinePointer';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';
import { getGsap } from '@/lib/gsap';
import { hasIntroCompleted, INTRO_COMPLETE_EVENT } from '@/lib/intro-state';
import { DUR, GSAP_EASING, STAGGER_TOKENS } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

/**
 * Safety net: if the intro-complete event is ever dropped (chunk failure,
 * race), the cascade starts anyway — the hero can never stay hidden.
 */
const INTRO_FALLBACK_MS = 3500;
/** Delay before the cascade on return visits, so it meets the curtain lift. */
const RETURN_VISIT_DELAY = 0.35;

/** One word of the headline: masked chars for the load cascade. */
const CascadeWord = ({ word, accent = false }: { word: string; accent?: boolean }) => (
  <span
    className={cn(
      'inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]',
      accent && 'font-serif italic text-gradient-gold',
    )}
  >
    {word.split('').map((char, i) => (
      <span key={`${char}-${i}`} data-hero-char="" className="inline-block will-change-transform">
        {char}
      </span>
    ))}
  </span>
);

/**
 * HomeHero — CH. I — VISION.
 *
 * Load choreography (fires once the preloader lifts, replayed whenever the
 * route returns to `/` — PageTransition never remounts, so the trigger is
 * `usePathname` + the `hexa:intro-complete` broadcast, never mount alone):
 *   1. mono kicker fades up (ui)
 *   2. headline chars cascade out of their word masks (scene, chars stagger)
 *   3. subline + CTAs fade with token staggers (ui, cards stagger)
 *   4. chapter marker slides in; ScrollCue takes over the scroll affordance
 *     (it self-dismisses permanently after the first scroll gesture)
 *
 * Phase 2B seam: `heroScrubProgress` (0→1 across the hero) is handed to
 * `LivingBlueprintHero` — Phase 2B consumes it for the camera scrub and the
 * particle dissolve into CH. I (see LivingBlueprintHero props).
 */
export const HomeHero = () => {
  const finePointer = useFinePointer();
  const { animationsEnabled, staticMode } = useMotionPolicy();
  const { tier } = useQualityTier();
  const pathname = usePathname();
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  // Phase 2B seam — 0→1 while the hero scrolls out of view.
  const { scrollYProgress: heroScrubProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  /* ------------------------------------------------------------------ */
  /*  Load choreography — GSAP cascade, triggered post-intro             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (pathname !== '/' || staticMode) return;
    const root = containerRef.current;
    if (!root) return;

    let cancelled = false;
    let ctx: { revert: () => void } | null = null;
    let fallbackId: number | null = null;
    let started = false;

    const buildCascade = async (delay: number) => {
      if (started) return;
      started = true;
      const gsap = await getGsap();
      if (cancelled) return;
      const q = gsap.utils.selector(root);

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: GSAP_EASING.easeOutExpo },
          delay,
        });
        tl.fromTo(
          q('[data-hero-kicker]'),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: DUR.ui },
        )
          .fromTo(
            q('[data-hero-char]'),
            { yPercent: 115 },
            { yPercent: 0, duration: DUR.scene, stagger: STAGGER_TOKENS.chars },
            0.15,
          )
          .fromTo(
            q('[data-hero-subline]'),
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: DUR.ui },
            '-=0.45',
          )
          .fromTo(
            q('[data-hero-cta]'),
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: DUR.ui, stagger: STAGGER_TOKENS.cards },
            '-=0.3',
          )
          .fromTo(
            q('[data-hero-marker]'),
            { opacity: 0, x: -16 },
            { opacity: 1, x: 0, duration: DUR.ui },
            0.3,
          );
      }, root);
    };

    const onIntroComplete = () => void buildCascade(0);

    if (hasIntroCompleted()) {
      // Return visit: the intro played earlier this session — start now,
      // timed to meet the page-transition curtain as it lifts.
      void buildCascade(RETURN_VISIT_DELAY);
    } else {
      window.addEventListener(INTRO_COMPLETE_EVENT, onIntroComplete, { once: true });
      fallbackId = window.setTimeout(onIntroComplete, INTRO_FALLBACK_MS);
    }

    return () => {
      cancelled = true;
      window.removeEventListener(INTRO_COMPLETE_EVENT, onIntroComplete);
      if (fallbackId !== null) window.clearTimeout(fallbackId);
      ctx?.revert();
    };
  }, [pathname, staticMode]);

  /* ------------------------------------------------------------------ */
  /*  Mouse parallax + ambient glow (fine pointer only)                  */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!finePointer || staticMode) return;

    let gsapInstance: typeof import('gsap').default | null = null;
    let cancelled = false;
    let mouseHandler: ((e: MouseEvent) => void) | null = null;

    void import('gsap').then(({ default: gsap }) => {
      if (cancelled) return;
      gsapInstance = gsap;

      mouseHandler = (e: MouseEvent) => {
        if (!gsapInstance || !contentRef.current) return;

        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xPos = clientX / innerWidth - 0.5;
        const yPos = clientY / innerHeight - 0.5;

        gsapInstance.to(contentRef.current, {
          x: xPos * 45,
          y: yPos * 45,
          rotateX: -yPos * 5,
          rotateY: xPos * 5,
          duration: 1.5,
          ease: 'power3.out',
        });

        if (glowRef.current) {
          gsapInstance.to(glowRef.current, {
            x: clientX - innerWidth / 2,
            y: clientY - innerHeight / 2,
            duration: 2,
            ease: 'power2.out',
          });
        }
      };

      window.addEventListener('mousemove', mouseHandler);
    });

    return () => {
      cancelled = true;
      if (mouseHandler) {
        window.removeEventListener('mousemove', mouseHandler);
      }
      if (gsapInstance) {
        if (contentRef.current) gsapInstance.killTweensOf(contentRef.current);
        if (glowRef.current) gsapInstance.killTweensOf(glowRef.current);
      }
    };
  }, [finePointer, staticMode]);

  return (
    <section
      ref={containerRef}
      id="ch-vision"
      className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-8 pt-20 overflow-hidden bg-obsidian"
    >
      <FractureRingHero
        qualityTier={tier}
        staticMode={staticMode}
        finePointer={finePointer}
        animationsEnabled={animationsEnabled}
        scrollProgress={heroScrubProgress}
      />

      {/* Ambient gradient overlays for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-transparent to-obsidian pointer-events-none z-[1]" />
      <div className="absolute inset-0 gradient-radial-gold pointer-events-none z-[1]" aria-hidden="true" />

      {/* Mouse-follow ambient glow — gated to fine pointer + not static */}
      {finePointer && !staticMode && (
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-accent/5 blur-[120px] rounded-full pointer-events-none z-[1]"
          aria-hidden="true"
        />
      )}

      {/* Chapter marker — CH. I */}
      <div data-hero-marker="" className="absolute top-24 left-8 md:left-16 z-10">
        <ChapterMarker index={1} title="Vision" />
      </div>

      <motion.div
        ref={contentRef}
        style={{ opacity, scale }}
        className="relative z-10 text-center pointer-events-none"
      >
        <span
          data-hero-kicker=""
          className="mb-6 block text-[10px] uppercase tracking-[0.5em] text-gold/60 font-medium"
        >
          Architectural Visualization
        </span>

        <div className="mb-6 md:mb-8">
          <h1
            aria-label="Living Spaces. Visualized."
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter text-white leading-[1.05]"
          >
            <span aria-hidden="true" className="block">
              <CascadeWord word="Living" /> <CascadeWord word="Spaces." accent />
            </span>
            <span aria-hidden="true" className="block">
              <CascadeWord word="Visualized." />
            </span>
          </h1>
        </div>

        <p
          data-hero-subline=""
          className="mx-auto w-full max-w-2xl text-base md:text-lg font-light text-white/40 mb-8 md:mb-12 leading-relaxed px-4"
        >
          Immersive 3D architectural experiences for the world&apos;s most ambitious projects.
          Where vision takes shape.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pointer-events-auto">
          <span data-hero-cta="" className="inline-block">
            <Magnetic>
              <Link href="/projects" data-cursor="explore">
                <Button variant="primary" size="lg">Explore Works</Button>
              </Link>
            </Magnetic>
          </span>
          <span data-hero-cta="" className="inline-block">
            <Magnetic>
              <Link href="/services" data-cursor="explore">
                <Button variant="secondary" size="lg">Our Process</Button>
              </Link>
            </Magnetic>
          </span>
        </div>
      </motion.div>

      {/* Scroll affordance — dismisses permanently after first scroll */}
      <ScrollCue delay={hasIntroCompleted() ? RETURN_VISIT_DELAY + 1 : 2} />
    </section>
  );
};
