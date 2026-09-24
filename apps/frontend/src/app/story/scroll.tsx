'use client';

import React, { useEffect, useRef, Suspense, lazy } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COLOR_TOKENS } from '@/lib/color-tokens';
import { useMotionPolicy } from '@/hooks/use-motion-policy';

gsap.registerPlugin(ScrollTrigger);

// Lazy-load the heavy 3D scene to keep initial bundle small
const CinematicScene = lazy(() =>
  import('@/components/3d/cinematic-scene').then((m) => ({ default: m.CinematicScene }))
);

// Lazy-load scene contents
import {
  SceneOneVision,
  SceneTwoMateriality,
  SceneThreeProcess,
  SceneFourFinality,
} from '@/components/3d/architectural-primitives';

const scenes = [
  {
    id: 1,
    title: '01 The Vision',
    description: 'We begin in silence—a blank canvas where algorithmic logic first meets spatial ambition.',
    bg: COLOR_TOKENS.VOID,
    textColor: 'text-sl-alabaster',
    z: -1000,
    cameraPosition: [0, 0, 8] as [number, number, number],
    lookAt: [0, 0, -2] as [number, number, number],
  },
  {
    id: 2,
    title: '02 Materiality',
    description: 'Concrete, glass, and brushed gold converge under volumetric lighting.',
    bg: COLOR_TOKENS.VOID_DEEP,
    textColor: 'text-sl-alabaster',
    z: -2000,
    cameraPosition: [2, 1, 6] as [number, number, number],
    lookAt: [0, 0, -2] as [number, number, number],
  },
  {
    id: 3,
    title: '03 The Process',
    description: 'Geometry accelerates into form. Real-time raytracing simulates thousands of light paths.',
    bg: COLOR_TOKENS.OBSIDIAN,
    textColor: 'text-sl-alabaster',
    z: -3000,
    cameraPosition: [-1, 2, 7] as [number, number, number],
    lookAt: [0, 0, -2] as [number, number, number],
  },
  {
    id: 4,
    title: '04 The Finality',
    description: 'Dawn breaks over the rendered cityscape. This is no longer a model.',
    bg: COLOR_TOKENS.VOID_DEEP,
    textColor: 'text-sl-alabaster',
    z: -4000,
    cameraPosition: [0, 0, 10] as [number, number, number],
    lookAt: [0, 0, -3] as [number, number, number],
  },
];

function SceneContent({ id }: { id: number }) {
  switch (id) {
    case 1: return <SceneOneVision />;
    case 2: return <SceneTwoMateriality />;
    case 3: return <SceneThreeProcess />;
    case 4: return <SceneFourFinality />;
    default: return null;
  }
}

export function StoryScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const { shouldReduceMotion } = useMotionPolicy();

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

  // Static fallback for reduced motion preference
  if (shouldReduceMotion) {
    return (
      <main className="relative bg-sl-void font-inter text-sl-alabaster">
        <div className="mx-auto max-w-4xl px-6 py-32">
          {scenes.map((scene) => (
            <section
              key={scene.id}
              className="mb-32 flex min-h-screen items-center justify-center"
              style={{ backgroundColor: scene.bg }}
            >
              <div className="text-center">
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
      </main>
    );
  }

  return (
    <main
      ref={containerRef}
      className="relative h-[400vh] overflow-hidden bg-sl-void font-inter text-sl-alabaster"
    >
      {/* Atmospheric fog overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_var(--color-sl-void)/80)]" />

      <div
        ref={sceneRef}
        className="absolute top-0 left-0 flex h-full w-auto items-center will-change-transform"
        style={{ perspective: 2000 }}
      >
        {scenes.map((scene) => (
          <section
            key={scene.id}
            className="relative flex-shrink-0 flex h-screen w-screen items-center justify-center overflow-hidden"
            style={{
              backgroundColor: scene.bg,
              transform: `translateZ(${scene.z}px)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 3D Cinematic Scene — lazy loaded */}
            <div className="absolute inset-0">
              <Suspense fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-1 w-16 animate-pulse bg-sl-gold/30" />
                </div>
              }>
                <CinematicScene
                  cameraPosition={scene.cameraPosition}
                  lookAt={scene.lookAt}
                  fov={50}
                  parallax
                  postProcessing
                  environment="studio"
                  background={scene.bg}
                  ambientIntensity={0.15}
                  keyIntensity={2.5}
                  accentIntensity={1.2}
                >
                  <SceneContent id={scene.id} />
                </CinematicScene>
              </Suspense>
            </div>

            {/* Text overlay */}
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
