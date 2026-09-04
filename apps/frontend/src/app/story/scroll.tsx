'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { COLOR_TOKENS } from '@/lib/color-tokens';

gsap.registerPlugin(ScrollTrigger);

const scenes = [
  {
    id: 1,
    title: '01 The Vision',
    description: 'We begin in silence—a blank canvas where algorithmic logic first meets spatial ambition.',
    bg: COLOR_TOKENS.VOID,
    textColor: 'text-sl-alabaster',
    z: -1000,
  },
  {
    id: 2,
    title: '02 Materiality',
    description: 'Concrete, glass, and brushed gold converge under volumetric lighting.',
    bg: COLOR_TOKENS.VOID_DEEP,
    textColor: 'text-sl-alabaster',
    z: -2000,
  },
  {
    id: 3,
    title: '03 The Process',
    description: 'Geometry accelerates into form. Real-time raytracing simulates thousands of light paths.',
    bg: COLOR_TOKENS.OBSIDIAN,
    textColor: 'text-sl-alabaster',
    z: -3000,
  },
  {
    id: 4,
    title: '04 The Finality',
    description: 'Dawn breaks over the rendered cityscape. This is no longer a model.',
    bg: COLOR_TOKENS.VOID_DEEP,
    textColor: 'text-sl-alabaster',
    z: -4000,
  },
];

export function StoryScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !sceneRef.current) return;

    ScrollTrigger.getAll().forEach((t) => {
      const trigger = (t.vars as { trigger?: unknown }).trigger;
      if (trigger === containerRef.current) t.kill();
    });

    const ctx = gsap.context(() => {
      const totalScroll = containerRef.current!.scrollWidth - window.innerWidth;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      });

      timeline.to(sceneRef.current, {
        x: -totalScroll,
        ease: 'none',
      }, 0);

      scenes.forEach((scene, i) => {
        const node = sceneRef.current!.children[i];
        if (!node) return;
        gsap.fromTo(
          node,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: containerRef.current,
              start: () => `top+=${i * (window.innerHeight * 0.8)} top`,
              end: () => `top+=${i * (window.innerHeight * 0.8) + window.innerHeight * 0.4} top`,
              scrub: 1.2,
            },
            ease: 'power2.out',
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={containerRef}
      className="relative h-[400vh] overflow-hidden bg-sl-void font-inter text-sl-alabaster"
    >
      {/* Atmospheric fog overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_var(--color-sl-void)/80)]"
      />

      <div
        ref={sceneRef}
        className="absolute top-0 left-0 flex h-full w-auto items-center will-change-transform"
        style={{ perspective: 2000 }}
      >
        {scenes.map((scene, _index) => (
          <section
            key={scene.id}
            className={`relative flex-shrink-0 flex h-screen w-screen items-center justify-center ${scene.textColor}`}
            style={{
              backgroundColor: scene.bg,
              transform: `translateZ(${scene.z}px)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Placeholder for visual asset */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black opacity-40" />
            <div className="relative z-10 max-w-2xl text-center">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                {scene.title}
              </h2>
              <p className="mt-6 text-lg md:text-xl leading-relaxed text-sl-mist/60">
                {scene.description}
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* Progress HUD */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/10">
        <div className="h-full w-1/4 bg-sl-gold transition-all duration-300" />
      </div>
    </main>
  );
}
