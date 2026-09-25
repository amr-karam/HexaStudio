'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { EASE, DURATION, STAGGER, fadeLift, staggerContainer, textReveal } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface InvitationChapterProps {
  className?: string;
}

/**
 * InvitationChapter — Chapter 04: The Invitation
 *
 * Final chapter — a cinematic CTA that invites the visitor to begin.
 * Uses `useScrollReveal` hook for declarative scroll-triggered entrance.
 */
export function InvitationChapter({ className }: InvitationChapterProps) {
  const { ref, hasRevealed } = useScrollReveal({
    rootMargin: '-100px',
    once: true,
  });

  return (
    <div
      ref={ref}
      className={cn('mx-auto max-w-4xl', className)}
    >
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Chapter label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={hasRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: DURATION.component, ease: EASE.entrance }}
          className="font-mono text-[10px] uppercase tracking-[0.5em] text-sl-gold-subtle/70"
        >
          <span className="mr-3 inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
          Ch. 04 — Invitation
          <span className="ml-3 inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
        </motion.div>

        {/* Main headline — text reveal */}
        <motion.div
          variants={staggerContainer(STAGGER.page, 0.2)}
          initial="hidden"
          animate={hasRevealed ? 'visible' : 'hidden'}
          className="mt-12"
        >
          <motion.h2
            variants={textReveal}
            className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[0.95] tracking-[-0.02em] text-sl-alabaster"
          >
            Your space is waiting <br />
            <span className="italic text-sl-gold-hover">for its first light</span>.
          </motion.h2>

          <motion.p
            variants={fadeLift}
            className="mt-10 max-w-xl mx-auto text-base font-light leading-relaxed text-sl-mist/60"
          >
            Twenty-two projects have passed through this studio. Each one began with a conversation
            about light. Yours can be the twenty-third.
          </motion.p>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          variants={staggerContainer(STAGGER.component, 0.4)}
          initial="hidden"
          animate={hasRevealed ? 'visible' : 'hidden'}
          className="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8"
        >
          <motion.div variants={fadeLift}>
            <Link
              href="/contact"
              data-cursor="explore"
              className="group inline-block"
            >
              <button
                type="button"
                className="h-14 min-h-[52px] min-w-[220px] cursor-pointer px-8 text-base font-medium
                  bg-[var(--btn-primary-bg)] text-background shadow-lg shadow-[var(--btn-primary-shadow)]
                  hover:bg-[var(--btn-primary-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                  transition-all duration-500"
              >
                Begin a Project
              </button>
            </Link>
          </motion.div>

          <motion.div variants={fadeLift}>
            <Link
              href="/projects"
              data-cursor="explore"
              className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-sl-mist/70 transition-colors duration-500 hover:text-sl-gold-hover"
            >
              <span className="inline-block h-px w-8 bg-sl-mist/30 transition-all duration-500 group-hover:w-12 group-hover:bg-sl-gold-subtle" />
              View the Work
            </Link>
          </motion.div>
        </motion.div>

        {/* Studio signature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={hasRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: DURATION.component, delay: 0.6, ease: EASE.entrance }}
          className="mt-24 flex flex-col items-center gap-4 text-sl-mist/40"
        >
          <div className="flex items-center gap-4">
            <span className="h-px w-24 bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.4em]">HEXA STUDIO</span>
            <span className="h-px w-24 bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />
          </div>
          <p className="text-[11px] font-light">Cairo · Dubai · Est. 2024</p>
        </motion.div>
      </div>
    </div>
  );
}