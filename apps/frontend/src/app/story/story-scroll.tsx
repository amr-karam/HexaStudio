'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

// ═══ STORY BEATS — narrative data ════════════════════════════════════════
// Replace these with your actual project story once UX Pilot / you author it.

const STORY_BEATS = [
  {
    id: 1,
    title: 'The Vision',
    text: 'We translate architectural sketches into Unreal Engine volumetric block-outs.',
    img: 'https://images.unsplash.com/photo-1503387762-592dee58293b?auto=format&fit=crop&w=1200&q=80',
    color: '#0f1115',
  },
  {
    id: 2,
    title: 'Materiality',
    text: 'PBR shaders for polished concrete, brushed gold, and fluted glass.',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a6d?auto=format&fit=crop&w=1200&q=80',
    color: '#111319',
  },
  {
    id: 3,
    title: 'The Process',
    text: 'Precision modeling meets cinematic lighting and atmospheric depth.',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92fb1ab?auto=format&fit=crop&w=1200&q=80',
    color: '#0f1115',
  },
  {
    id: 4,
    title: 'The Hero Shot',
    text: 'Final 4K cinematic render — the intersection of nature and architecture.',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92fb1ab?auto=format&fit=crop&w=1200&q=80',
    color: '#0a0c10',
  },
];

// ═══ COMPONENT ════════════════════════════════════════════════════════════

interface StoryScrollCarouselProps {
  className?: string;
}

export function StoryScrollCarousel({ className }: StoryScrollCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !storyRef.current) return;

    // Destroy any existing ScrollTrigger on the container to avoid duplicates
    // on HMR in dev.
    ScrollTrigger.getAll().forEach((t) => {
      if (t.vars?.trigger === containerRef.current) t.kill();
    });

    const STORY_WIDTH = storyRef.current.scrollWidth;
    const WINDOW_WIDTH = window.innerWidth;
    const delta = STORY_WIDTH - WINDOW_WIDTH;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5, // cinematic, heavy-lerp feel
        invalidateOnRefresh: true,
      },
    });

    tl.to(storyRef.current, {
      x: -delta,
      ease: 'none',
      duration: 1,
    }, 0);

    // Individual beat fades (depth-of-field feel)
    STORY_BEATS.forEach((beat, index) => {
      const beatEl = storyRef.current?.children[index] as HTMLElement | undefined;
      if (!beatEl) return;

      gsap.fromTo(
        beatEl,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: containerRef.current,
            start: () => `top+=${index * window.innerHeight * 0.15}px top`,
            end: () => `top+=${index * window.innerHeight * 0.15 + window.innerHeight * 0.4}px top`,
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
          ease: 'power2.out',
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars?.trigger === containerRef.current) t.kill();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-[500vh] bg-black overflow-hidden ${className ?? ''}`}
      aria-label="Cinematic story scroll"
    >
      {/* Atmospheric fog overlay — hides pop-in at depth */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 30%, transparent 15%, #000 75%)',
          }}
        />
      </div>

      {/* Floating "camera" HUD indicator */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="w-32 h-32 rounded-full border border-white/10 animate-pulse opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono tracking-widest text-white/40 uppercase">
          UE5 CAM
        </div>
      </div>

      {/* Story strip — horizontally scrollable via GSAP */}
      <div
        ref={storyRef}
        className="relative z-20 flex h-screen w-max overflow-hidden will-change-transform"
        style={{ perspective: 2000 }}
      >
        {STORY_BEATS.map((beat, index) => (
          <section
            key={beat.id}
            className="relative flex-shrink-0 w-screen h-screen flex flex-col items-center justify-center p-8 md:p-12"
            style={{
              transform: `translateX(${index * 100}%)`,
              perspective: 1000,
              transformStyle: 'preserve-3d',
              backgroundColor: beat.color,
            }}
          >
            {/* Image card — "prop" in the 3D space */}
            <div
              className="relative w-2/5 h-2/5 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group"
              style={{ transform: `translateZ(${100 + index * 60}px)` }}
            >
              <Image
                src={beat.img}
                alt={beat.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ filter: 'contrast(1.1) saturate(0.9) brightness(0.95)' }}
                sizes="800px"
              />

              {/* Glass overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Cinematic label */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/50 uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                UE5 RENDER
              </div>
            </div>

            {/* Story text "dialogue" */}
            <div className="mt-16 md:mt-20 space-y-6 text-center max-w-lg px-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase">
                {beat.title}
              </h2>
              <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed">
                {beat.text}
              </p>
            </div>

            {/* Scroll progress "HUD" dots — shows which scene is active */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
              {STORY_BEATS.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i <= index ? 'w-8 bg-sl-gold' : 'w-2 bg-white/10'
                  }`}
                  aria-hidden
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
