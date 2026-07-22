'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { textReveal } from '@/lib/motion';

const ROMAN_MAP: ReadonlyArray<readonly [number, string]> = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/** Converts a 1-based chapter index to a roman numeral (clamped to >= 1). */
export function toRomanNumeral(value: number): string {
  let remaining = Math.max(1, Math.floor(value));
  let result = '';
  for (const [decimal, numeral] of ROMAN_MAP) {
    while (remaining >= decimal) {
      result += numeral;
      remaining -= decimal;
    }
  }
  return result;
}

interface ChapterMarkerProps {
  /** 1-based chapter number, rendered as a roman numeral. */
  index: number;
  /** Chapter title, rendered in editorial serif italic. */
  title: string;
  className?: string;
}

/**
 * ChapterMarker — `(CH. II) — ROOTS` editorial chapter label.
 *
 * Decoded from pasqua.it / raven-trading.com (Prompt 017 — Scroll Cinema):
 * cinematic chapter markers that give long pages the pacing of a film. The
 * numeral uses the mono grotesque; the title answers in serif italic — the
 * HEXA luxury contrast pairing.
 *
 * Purely decorative: the owning section keeps its real heading semantics,
 * so the marker is `aria-hidden`. Mask-reveals once on scroll into view;
 * instant under reduced motion / pause (textReveal handles the collapse).
 */
export const ChapterMarker = ({ index, title, className }: ChapterMarkerProps) => {
  const { staticMode } = useMotionPolicy();

  return (
    <span aria-hidden="true" className={cn('block w-fit overflow-hidden', className)}>
      <motion.span
        className="flex items-baseline gap-3"
        variants={textReveal}
        initial={staticMode ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        custom={staticMode}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent">
          (CH. {toRomanNumeral(index)})
        </span>
        <span className="font-serif italic text-sm uppercase tracking-[0.25em] text-neutral-400">
          {title}
        </span>
      </motion.span>
    </span>
  );
};
