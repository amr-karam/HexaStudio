'use client';

import React, { Suspense } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { LazySceneCanvas } from '@/features/scene';
import { SceneErrorBoundary } from '@/features/scene/components/SceneErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import { TextReveal } from '@/components/ui/TextReveal';

export const HomeHero = () => {
  const { scrollYProgress } = useScroll();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), springConfig);
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center px-8 pt-20 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <SceneErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <LazySceneCanvas />
        </Suspense>
      </SceneErrorBoundary>

      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80 pointer-events-none z-[1]" />

      <motion.div
        style={{ opacity, scale, x: translateX, y: translateY }}
        className="relative z-10 max-w-5xl text-center pointer-events-none"
      >
        <TextReveal delay={0} className="mb-6">
          <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">
            Architectural Visualization
          </span>
        </TextReveal>

        <div className="overflow-hidden mb-8">
          <TextReveal delay={0.1}>
            <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-white">
              Living <span className="italic">Spaces.</span> <br />
              Visualized.
            </h1>
          </TextReveal>
        </div>

        <TextReveal delay={0.2} className="mx-auto max-w-xl text-lg font-light text-neutral-400 mb-12 leading-relaxed">
          Immersive 3D architectural experiences for the world&apos;s most ambitious projects.
          Where vision takes shape.
        </TextReveal>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'var(--ease-luxury)' }}
          className="flex items-center justify-center gap-6 pointer-events-auto"
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
        <span className="text-[10px] uppercase tracking-widest text-neutral-600">Scroll</span>
        <div className="h-12 w-[1px] bg-gradient-to-b from-neutral-600 to-transparent" />
      </motion.div>
    </section>
  );
};
