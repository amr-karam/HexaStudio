'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { Button } from '@/components/ui/Button';
import { LazySceneCanvas } from '@/features/scene';
import { SceneErrorBoundary } from '@/features/scene/components/SceneErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import { TextReveal } from '@/components/ui/TextReveal';
import { useReducedMotion } from '@/hooks';

export const HomeHero = () => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPos = (clientX / innerWidth) - 0.5;
      const yPos = (clientY / innerHeight) - 0.5;

      gsap.to(contentRef.current, {
        x: xPos * 40,
        y: yPos * 40,
        duration: 0.8,
        ease: 'power3.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-8 pt-20 overflow-hidden"
    >
      <SceneErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <LazySceneCanvas />
        </Suspense>
      </SceneErrorBoundary>

      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80 pointer-events-none z-[1]" />

      <motion.div
        ref={contentRef}
        style={{ opacity, scale }}
        className="relative z-10 text-center pointer-events-none"
      >
        <TextReveal delay={0} className="mb-6">
          <span className="text-xs uppercase tracking-[0.4em] text-neutral-500 font-mono">
            Architectural Visualization
          </span>
        </TextReveal>

        <div className="overflow-hidden mb-6 md:mb-8">
          <TextReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter text-white leading-[1.1]">
              Living <span className="font-serif italic">Spaces.</span> <br />
              Visualized.
            </h1>
          </TextReveal>
        </div>

        <TextReveal delay={0.2} className="mx-auto text-base md:text-lg font-light text-neutral-400 mb-8 md:mb-12 leading-relaxed px-4 max-w-2xl">
          Immersive 3D architectural experiences for the world&apos;s most ambitious projects.
          Where vision takes shape.
        </TextReveal>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pointer-events-auto"
        >
          <Button variant="primary" size="lg">
            Explore Works
          </Button>
          <Button variant="outline" size="lg">
            Our Process
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none"
      >
        <span className="text-xs uppercase tracking-widest text-neutral-600 font-mono">Scroll</span>
        <div className="h-12 w-[1px] bg-gradient-to-b from-neutral-600 to-transparent" />
      </motion.div>
    </section>
  );
};
