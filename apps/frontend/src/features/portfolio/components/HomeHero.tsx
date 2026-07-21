'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { LazyBlueprintHero } from '@/features/experience';
import { SceneErrorBoundary } from '@/features/scene/components/SceneErrorBoundary';
import { TextReveal } from '@/components/ui/TextReveal';
import { ShimmerSkeleton } from '@/components/ui/ShimmerSkeleton';
import { useFinePointer } from '@/hooks/useFinePointer';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { EASE, DURATION, REDUCED_TRANSITION } from '@/lib/motion';

export const HomeHero = () => {
  const finePointer = useFinePointer();
  const { staticMode } = useMotionPolicy();
  const { scrollYProgress } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  useEffect(() => {
    // Gate: only fine pointer + not static
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

        // Mouse-follow ambient glow
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
      // Kill any active tweens on these elements
      if (gsapInstance) {
        if (contentRef.current) gsapInstance.killTweensOf(contentRef.current);
        if (glowRef.current) gsapInstance.killTweensOf(glowRef.current);
      }
    };
  }, [finePointer, staticMode]);

  // Motion values
  const h1Transition = staticMode ? REDUCED_TRANSITION : { duration: DURATION.camera, ease: EASE.entrance };
  const ctaTransition = staticMode ? REDUCED_TRANSITION : { duration: 1, delay: 0.4, ease: EASE.entrance };
  const scrollIndicatorTransition = staticMode ? REDUCED_TRANSITION : { duration: DURATION.page, delay: 1.2, ease: EASE.entrance };

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-8 pt-20 overflow-hidden bg-obsidian"
    >
      <SceneErrorBoundary>
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <ShimmerSkeleton variant="circle" className="h-16 w-16" />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-[1px] bg-accent/40 animate-pulse" />
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-mono">Loading scene</span>
              </div>
            </div>
          </div>
        }>
          <LazyBlueprintHero />
        </Suspense>
      </SceneErrorBoundary>

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

      <motion.div
        ref={contentRef}
        style={{ opacity, scale }}
        className="relative z-10 text-center pointer-events-none"
      >
        <TextReveal delay={0} className="mb-6">
          <span className="text-[10px] uppercase tracking-[0.5em] text-gold/60 font-medium">
            Architectural Visualization
          </span>
        </TextReveal>

        <div className="overflow-hidden mb-6 md:mb-8">
          <TextReveal delay={0.1}>
            <motion.h1
              initial={{ letterSpacing: staticMode ? "-0.02em" : "-0.05em" }}
              animate={{ letterSpacing: "-0.02em" }}
              transition={h1Transition}
              className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter text-white leading-[1.05]"
            >
              Living <span className="font-serif italic text-gradient-gold">Spaces.</span> <br />
              Visualized.
            </motion.h1>
          </TextReveal>
        </div>

        <TextReveal delay={0.2} className="mx-auto w-full text-base md:text-lg font-light text-white/40 mb-8 md:mb-12 leading-relaxed px-4 max-w-2xl">
          <p className="w-full">
            Immersive 3D architectural experiences for the world&apos;s most ambitious projects.
            Where vision takes shape.
          </p>
        </TextReveal>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ctaTransition}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pointer-events-auto"
        >
          <Magnetic>
            <Link href="/portfolio" data-cursor="explore"><Button variant="primary" size="lg">Explore Works</Button></Link>
          </Magnetic>
          <Magnetic>
            <Link href="/services" data-cursor="explore"><Button variant="secondary" size="lg">Our Process</Button></Link>
          </Magnetic>
        </motion.div>
      </motion.div>
      
      {/* Scroll indicator with animated gold line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={scrollIndicatorTransition}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none z-10"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-medium">Scroll</span>
        <div className="relative h-16 w-[1px] overflow-hidden bg-white/5">
          {!staticMode && (
            <motion.div
              animate={{ y: ['0%', '100%', '0%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: EASE.entrance }}
              className="absolute inset-0 bg-gradient-to-b from-gold/60 to-transparent"
            />
          )}
          {staticMode && (
            <div className="absolute inset-0 bg-gradient-to-b from-gold/60 to-transparent" />
          )}
        </div>
      </motion.div>
    </section>
  );
};

