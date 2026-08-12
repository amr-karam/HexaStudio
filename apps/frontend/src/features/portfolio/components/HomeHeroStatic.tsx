'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { ChapterMarker } from '@/components/animation/ChapterMarker';
import { ScrollCue } from '@/components/scroll/ScrollCue';
import { useFinePointer } from '@/hooks/useFinePointer';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { getGsap } from '@/lib/gsap';
import { hasIntroCompleted, INTRO_COMPLETE_EVENT } from '@/lib/intro-state';
import { cn } from '@/lib/utils';

const INTRO_FALLBACK_MS = 3500;
const RETURN_VISIT_DELAY = 0.35;

/** Static hero word — no char cascade, just fade-up on load. */
const HeroWord = ({ word, accent = false }: { word: string; accent?: boolean }) => (
  <span
    className={cn(
      'inline-block',
      accent && 'font-serif italic text-gradient-gold',
    )}
  >
    {word}
  </span>
);

/**
 * HomeHeroStatic — CH. I — VISION (non-3D variant).
 *
 * Same content and choreography as HomeHero but without the FractureRingHero
 * 3D canvas. Used on the new static homepage at `/`.
 */
export const HomeHeroStatic = () => {
  const finePointer = useFinePointer();
  const { staticMode } = useMotionPolicy();
  const pathname = usePathname();
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

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
          defaults: { ease: 'power4.out' }, // Shift to power4 for more weight
          delay,
        });
        tl.fromTo(
          q('[data-hero-kicker]'),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2 },
        )
          .fromTo(
            q('[data-hero-headline]'),
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.4 },
            0.15,
          )
          .fromTo(
            q('[data-hero-subline]'),
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2 },
            '-=0.8',
          )
          .fromTo(
            q('[data-hero-cta]'),
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, stagger: 0.1 },
            '-=0.8',
          )
          .fromTo(
            q('[data-hero-marker]'),
            { x: -20, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.2 },
            0.3,
          );
      }, root);
    };

    const onIntroComplete = () => void buildCascade(0);

    if (hasIntroCompleted()) {
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

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const progress = Math.min(scrollY / (windowHeight * 0.1), 1);
      el.style.opacity = String(1 - progress);
      el.style.transform = `scale(${1 - progress * 0.1})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      id="ch-vision"
      className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 overflow-hidden bg-sl-void"
    >
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-sl-obsidian/40 via-transparent to-sl-void pointer-events-none z-[1]" />
      <div className="absolute inset-0 gradient-radial-gold pointer-events-none z-[1]" aria-hidden="true" />

      {/* Mouse-follow ambient glow — subtle, restrained */}
      {finePointer && !staticMode && (
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 bg-accent/3 blur-[100px] rounded-full pointer-events-none z-[1]"
          aria-hidden="true"
        />
      )}

      {/* Chapter marker */}
      <div data-hero-marker="" className="absolute top-20 left-8 md:left-16 z-10">
        <ChapterMarker index={1} title="Vision" />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 text-center pointer-events-none"
      >
        <span
          data-hero-kicker=""
          className="mb-5 block text-[10px] uppercase tracking-[0.35em] text-silver/70 font-medium"
        >
          Architectural Vision
        </span>

        <div className="mb-5 md:mb-6">
          <h1
            data-hero-headline=""
            aria-label="Living Spaces. Visualized."
            className="sl-heading sl-heading-display font-light leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, Playfair Display, Georgia, serif' }}
          >
            <span aria-hidden="true" className="block text-alabaster">
              Living
            </span>
            <span aria-hidden="true" className="block mt-0 text-gradient-gold font-italic">
              Spaces
            </span>
            <span aria-hidden="true" className="block mt-1 text-alabaster">
              Visualized.
            </span>
          </h1>
        </div>

        <p
          data-hero-subline=""
          className="mx-auto w-full max-w-2xl text-sm md:text-base font-light text-silver/60 mb-10 md:mb-14 leading-relaxed tracking-wide px-4"
        >
          Immersive 3D architectural experiences for the world&apos;s most discerning projects.
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
      </div>

      {/* Scroll affordance — dismisses permanently after first scroll */}
      <ScrollCue delay={hasIntroCompleted() ? RETURN_VISIT_DELAY + 1 : 2} />
    </section>
  );
};
