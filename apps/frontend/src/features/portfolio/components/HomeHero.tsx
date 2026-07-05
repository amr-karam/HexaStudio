'use client';

import React, { Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ExperienceCanvas } from '@/features/scene/components/ExperienceCanvas';
import { SceneErrorBoundary } from '@/features/scene/components/SceneErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';

export const HomeHero = () => {
  const { scrollYProgress } = useScroll();

  // Transform scroll progress into cinematic animations
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.1], [0, -50]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-8 pt-20 overflow-hidden">
      {/* 3D Background Experience */}
      <SceneErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <ExperienceCanvas />
        </Suspense>
      </SceneErrorBoundary>

      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80 pointer-events-none z-[1]" />

      <motion.div 
        style={{ opacity, scale, y }}
        className="relative z-10 max-w-5xl text-center pointer-events-none"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'var(--ease-luxury)' }}
          className="mb-6"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">
            Architectural Visualization
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'var(--ease-luxury)' }}
          className="text-6xl md:text-8xl font-light tracking-tighter text-white mb-8"
        >
          Defining <span className="italic">Spaces</span> <br />
          Through Light
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'var(--ease-luxury)' }}
          className="mx-auto max-w-xl text-lg font-light text-neutral-400 mb-12 leading-relaxed"
        >
          HexaStudio blends technical precision with cinematic storytelling, 
          creating immersive 3D experiences for the world's most ambitious architectures.
        </motion.p>

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

      {/* Scroll Indicator */}
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
