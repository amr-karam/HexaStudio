'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE, DURATION } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type CinematicTextElement = 'h1' | 'h2' | 'h3' | 'p' | 'span';

interface CinematicTextProps {
  text: string;
  className?: string;
  /** Initial delay (seconds) before the reveal begins. */
  delay?: number;
  /** Per-letter stagger (seconds). */
  stagger?: number;
  /** Rendered semantic element. Defaults to 'h2'. */
  as?: CinematicTextElement;
}

/**
 * CinematicText — a letter-by-letter masked reveal, the most premium form of
 * typographic entrance. Each character is wrapped in an `overflow-hidden` span
 * and lifts from below the mask with the system's `entrance` easing, producing
 * the "rise from behind the curtain" effect favored by Awwwards-grade sites.
 *
 * Spaces are preserved as non-animating spans so the text reflows naturally and
 * remains screen-reader friendly (the underlying string is untouched).
 *
 * Accessibility: under `prefers-reduced-motion`, the choreography collapses to
 * a single, instant opacity fade — no movement, no stagger.
 */
export const CinematicText = ({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  as = 'h2',
}: CinematicTextProps) => {
  const reducedMotion = useReducedMotion();
  const MotionTag = motion[as];
  const characters = Array.from(text);

  if (reducedMotion) {
    return (
      <MotionTag
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.component, ease: EASE.entrance as [number, number, number, number] }}
        aria-label={text}
      >
        {text}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={cn('inline-block', className)}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {characters.map((char, index) => {
        // Preserve whitespace as a non-animating, non-masked space.
        if (char === ' ') {
          return (
            <span key={`space-${index}`} className="inline-block" aria-hidden="true">
              {' '}
            </span>
          );
        }

        return (
          <span
            key={`${char}-${index}`}
            className="inline-block overflow-hidden align-bottom"
            aria-hidden="true"
          >
            <motion.span
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: DURATION.page,
                    ease: EASE.entrance as [number, number, number, number],
                    delay: delay + index * stagger,
                  },
                },
              }}
            >
              {char}
            </motion.span>
          </span>
        );
      })}
    </MotionTag>
  );
};
