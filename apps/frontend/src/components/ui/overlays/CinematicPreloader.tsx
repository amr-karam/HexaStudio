'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  animate,
} from 'framer-motion';
import { EASING, DUR, STAGGER_TOKENS } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { markIntroComplete } from '@/lib/intro-state';

/** First-visit-per-session flag. */
const SESSION_KEY = 'hexa-intro-seen';
/** Hard cap for the whole intro (count + curtain lift), per spec. */
const MAX_INTRO_MS = 1800;
/** Curtain lift duration (s) — token-driven. */
const EXIT_DURATION = DUR.transition;
/** Time budget (ms) for the 0→100 count before the lift must begin. */
const COUNT_BUDGET_MS = MAX_INTRO_MS - EXIT_DURATION * 1000;
/** Progress the free-running counter eases toward while assets load. */
const COUNT_PLATEAU = 92;

/**
 * Architectural corner registration ticks (atelier drafting-frame motif).
 * Each entry carries the absolute positioning + the two visible border
 * sides that form the "L" for that corner.
 */
const CORNER_TICK_POSITIONS = [
  'top-6 left-6 border-t border-l',
  'top-6 right-6 border-t border-r',
  'bottom-6 left-6 border-b border-l',
  'bottom-6 right-6 border-b border-r',
] as const;

type PreloaderPhase = 'hidden' | 'active' | 'exiting' | 'done';

/**
 * Broadcasts that the intro has lifted (or was skipped) so load-choreographed
 * systems (hero char cascade) can start. Deferred a macrotask so listeners
 * attached during the same commit phase never miss it.
 */
function announceIntroComplete() {
  setTimeout(() => {
    markIntroComplete();
  }, 0);
}

/**
 * CinematicPreloader — first-visit-per-session brand intro.
 *
 * Sequence (hard-capped at 1.8s total):
 * 1. Serif HEXA logotype reveals letter-by-letter (clip + rise).
 * 2. A mono 0→100 counter tracks real load progress (window `load`),
 *    easing toward a plateau; a timed fallback guarantees the cap.
 * 3. The obsidian panel lifts like a gold-edged curtain (translateY),
 *    exposing the page beneath.
 *
 * Non-negotiables:
 * - Never blocks LCP: this is a fixed overlay; the page renders beneath.
 * - Skippable via click / tap / Escape.
 * - Skipped entirely for: repeat visits this session, OS reduced motion,
 *   and automation (`navigator.webdriver`) so e2e stays deterministic.
 * - Unmounts after completion — zero DOM residue.
 */
export function CinematicPreloader() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<PreloaderPhase>('hidden');
  const progress = useMotionValue(0);
  const goldScaleX = useTransform(progress, [0, 100], [0, 1]);
  const hasFinished = useRef(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  // Counter writes go straight to the DOM — per-frame React state updates
  // here were re-rendering the whole preloader subtree every animation
  // frame (~143-207ms Layout each; the last two long tasks in the load
  // trace). textContent keeps the tabular mono count visually identical.
  useMotionValueEvent(progress, 'change', (v) => {
    const el = counterRef.current;
    if (!el) return;
    el.textContent = String(Math.min(100, Math.round(v))).padStart(3, '0');
  });

  const beginExit = useCallback(() => {
    announceIntroComplete();
    setPhase((current) => (current === 'active' ? 'exiting' : current));
  }, []);

  useEffect(() => {
    // Skip gates: reduced motion, repeat visit, automation — the hero must
    // still be told to start its load choreography.
    if (reducedMotion) {
      announceIntroComplete();
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      announceIntroComplete();
      return;
    }
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        announceIntroComplete();
        return;
      }
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // sessionStorage unavailable — still skip the intro.
      announceIntroComplete();
      return;
    }

    setPhase('active');

    // Free-running counter eases toward the plateau while assets load.
    const counter = animate(progress, COUNT_PLATEAU, {
      duration: COUNT_BUDGET_MS / 1000,
      ease: EASING.easeOutExpo,
    });

    const finish = () => {
      if (hasFinished.current) return;
      hasFinished.current = true;
      counter.stop();
      // Snap the counter to 100, then lift the curtain.
      const snap = animate(progress, 100, { duration: 0.12, ease: 'linear' });
      void snap.then(beginExit, beginExit);
    };

    // Real progress: window load completes the counter early.
    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish, { once: true });
    }
    // Timed fallback: the intro can never exceed the hard cap.
    const capTimer = setTimeout(finish, COUNT_BUDGET_MS);

    return () => {
      counter.stop();
      clearTimeout(capTimer);
      window.removeEventListener('load', finish);
    };
  }, [reducedMotion, progress, beginExit]);

  // Skip interactions: click / tap anywhere, or Escape.
  useEffect(() => {
    if (phase !== 'active') return;

    const skip = () => {
      progress.set(100);
      beginExit();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
    };

    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [phase, progress, beginExit]);

  if (phase === 'hidden' || phase === 'done') return null;

  const letters = ['H', 'E', 'X', 'A'];

  return (
    <AnimatePresence onExitComplete={() => setPhase('done')}>
      {phase === 'active' && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: { duration: EXIT_DURATION, ease: EASING.easeInOutQuint },
          }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          style={{ willChange: 'transform' }}
          role="status"
          aria-live="polite"
          aria-label="Loading HexaStudio experience"
        >
          {/* Gold leading edge — bottom of the lifting panel */}
          <span className="absolute bottom-0 inset-x-0 h-[2px] bg-accent" aria-hidden="true" />

          {/* Gold specular edge — subtle 1px top highlight */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
          />

          {/* Architectural drafting grid + radial gold aura (fades in behind logotype) */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.ui, delay: 0.05, ease: EASING.easeOutExpo }}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06),transparent_65%)]"
          >
            <div
              className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.05)_1px,transparent_1px)] [background-size:64px_64px]"
            />
          </motion.div>

          {/* Architectural corner registration ticks */}
          {CORNER_TICK_POSITIONS.map((position) => (
            <span
              key={position}
              aria-hidden="true"
              className={`pointer-events-none absolute h-4 w-4 border-accent/30 ${position}`}
            />
          ))}

          {/* Studio label — flanked by diamond bullets */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.ui, delay: 0.1, ease: EASING.easeOutExpo }}
            className="absolute top-8 left-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.5em] text-neutral-400"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none block h-[5px] w-[5px] rotate-45 border border-accent/30"
            />
            HexaStudio
            <span
              aria-hidden="true"
              className="pointer-events-none block h-[5px] w-[5px] rotate-45 border border-accent/30"
            />
          </motion.span>

          {/* Serif logotype — staggered clip reveal + gold rule + diamond ornament */}
          <div className="flex flex-col items-center">
            <h1 className="flex overflow-hidden font-serif text-6xl md:text-8xl tracking-[0.08em] text-foreground">
              {letters.map((letter, i) => (
                <span key={letter} className="inline-block overflow-hidden">
                  <motion.span
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{
                      delay: 0.15 + i * STAGGER_TOKENS.chars,
                      duration: DUR.ui,
                      ease: EASING.easeOutExpo,
                    }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 0.15 + letters.length * STAGGER_TOKENS.chars + DUR.micro,
                duration: DUR.ui,
                ease: EASING.easeOutExpo,
              }}
              className="pointer-events-none mt-3 block h-px w-full origin-left bg-gradient-to-r from-transparent via-accent/60 to-transparent"
            />
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.15 + letters.length * STAGGER_TOKENS.chars + DUR.ui,
                duration: DUR.ui,
                ease: EASING.easeOutExpo,
              }}
              className="pointer-events-none mt-5 block h-[7px] w-[7px] rotate-45 border border-accent/50"
            />
          </div>

          {/* Mono counter — bottom right (textContent-driven, no re-renders) */}
          <span
            ref={counterRef}
            className="absolute bottom-8 right-8 font-mono text-sm tabular-nums tracking-[0.3em] text-accent"
          >
            000
          </span>

          {/* Progress hairline — bottom, tied to real load progress */}
          <motion.div
            aria-hidden="true"
            style={{ scaleX: goldScaleX }}
            className="absolute bottom-0 inset-x-0 h-[2px] origin-left bg-accent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
