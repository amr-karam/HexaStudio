'use client';

import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { EASE, DURATION, STAGGER, fadeLift, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface VisionChapterProps {
  className?: string;
}

/**
 * VisionChapter — Chapter 01: The Philosophy
 *
 * Scroll-revealed chapter explaining the studio's core vision.
 * Uses `useScrollReveal` hook for declarative scroll-triggered entrance.
 */
export function VisionChapter({ className }: VisionChapterProps) {
  const { ref, hasRevealed } = useScrollReveal({
    rootMargin: '-100px',
    once: true,
  });

  return (
    <div
      ref={ref}
      className={cn('mx-auto max-w-5xl', className)}
    >
      {/* Chapter label */}
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={hasRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: DURATION.component, ease: EASE.entrance }}
          className="font-mono text-[10px] uppercase tracking-[0.5em] text-sl-gold-subtle/70"
        >
          <span className="mr-3 inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
          Ch. 01 — Vision
          <span className="ml-3 inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
        </motion.div>

        {/* Headline stack */}
        <motion.div
          variants={staggerContainer(STAGGER.component, 0.15)}
          initial="hidden"
          animate={hasRevealed ? 'visible' : 'hidden'}
          className="mt-12"
        >
          <motion.h2
            variants={fadeLift}
            className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[0.95] tracking-[-0.02em] text-sl-alabaster"
          >
            We design for the <span className="italic text-sl-gold-hover">moment of recognition</span> — when a space
            <br />
            stops being a rendering and starts being a memory.
          </motion.h2>

          <motion.p
            variants={fadeLift}
            className="mt-10 max-w-2xl text-base font-light leading-relaxed text-sl-mist/60"
          >
            Every project begins with a question: how will the light move through this room at 7&nbsp;AM?
            How will the shadow fall at sunset? We build the answer before the first stone is laid —
            photoreal, cinematic, calibrated to the physics of the real world.
          </motion.p>
        </motion.div>

        {/* Three pillars */}
        <motion.div
          variants={staggerContainer(STAGGER.component, 0.3)}
          initial="hidden"
          animate={hasRevealed ? 'visible' : 'hidden'}
          className="mt-20 grid gap-8 md:grid-cols-3"
        >
          {[
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ),
              title: 'Time',
              body: 'We simulate the full arc of natural light — dawn to dusk, season to season — so the final image holds the truth of every hour.',
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              ),
              title: 'Material',
              body: 'Every surface — stone, glass, timber, textile — is authored with measured reflectance, roughness, and subsurface behavior. No shortcuts.',
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              title: 'Atmosphere',
              body: 'Air has weight. Dust catches light. Volumetric fog, lens bloom, chromatic aberration — we render the air, not just the architecture.',
            },
          ].map((pillar, _i) => (
            <motion.article
              key={pillar.title}
              variants={fadeLift}
              className="group relative p-8 rounded-xl bg-sl-obsidian/50 border border-sl-gold-subtle/10 hover:border-sl-gold-subtle/30 transition-all duration-700"
            >
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-lg bg-sl-gold-subtle/10 group-hover:bg-sl-gold-subtle/20 transition-colors duration-500 text-sl-gold-hover">
                {pillar.icon}
              </div>
              <h3 className="font-serif text-xl font-medium tracking-[-0.01em] text-sl-alabaster">{pillar.title}</h3>
              <p className="mt-4 text-sm font-light leading-relaxed text-sl-mist/60">{pillar.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
  );
}