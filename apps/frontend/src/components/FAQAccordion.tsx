'use client';

import React, { useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE, DURATION, REDUCED_TRANSITION } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Icon } from '@/features/portal/components/PortalIcons';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  /** CSS class applied to the outermost wrapper. */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Chevron Icon (rotates on expand)                                           */
/* -------------------------------------------------------------------------- */

const ChevronIcon = ({ isOpen, reducedMotion }: { isOpen: boolean; reducedMotion: boolean }) => (
  <motion.span
    animate={reducedMotion ? { rotate: isOpen ? 90 : 0 } : { rotate: isOpen ? 90 : 0 }}
    transition={reducedMotion ? REDUCED_TRANSITION : { duration: DURATION.micro, ease: EASE.entrance }}
    className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center"
    aria-hidden="true"
  >
    <Icon name="chevron-right" size={16} strokeWidth={1.5} />
  </motion.span>
);

/* -------------------------------------------------------------------------- */
/*  Single Row                                                                  */
/* -------------------------------------------------------------------------- */

const AccordionRow = ({
  item,
  isOpen,
  onToggle,
  reducedMotion,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle],
  );

  return (
    <div
      className={cn(
        'group rounded-xl border transition-colors duration-300',
        isOpen
          ? 'border-sl-gold-subtle/50 bg-sl-gold-subtle/5'
          : 'border-sl-silver/10 bg-white/[0.02] hover:border-sl-silver/20 hover:bg-white/[0.04]',
      )}
    >
      {/* Trigger */}
      <button
        type="button"
        role="button"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.question}`}
        id={`faq-trigger-${item.question}`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full items-center gap-4 px-6 py-5 text-left',
          'font-serif text-base tracking-tight text-sl-alabaster',
          'transition-colors duration-300',
          isOpen && 'text-sl-gold-hover',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl',
        )}
      >
        <span className="flex-1 leading-snug">{item.question}</span>
        <ChevronIcon isOpen={isOpen} reducedMotion={reducedMotion} />
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${item.question}`}
            role="region"
            aria-labelledby={`faq-trigger-${item.question}`}
            initial={reducedMotion ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            animate={reducedMotion ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              reducedMotion
                ? REDUCED_TRANSITION
                : { height: { duration: DURATION.component, ease: EASE.entrance }, opacity: { duration: DURATION.micro, ease: EASE.sharp } }
            }
            className="overflow-hidden"
          >
            <div ref={contentRef} className="px-6 pb-5 text-base leading-relaxed text-sl-silver/80">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Accordion (single-open)                                                     */
/* -------------------------------------------------------------------------- */

/**
 * FAQAccordion — Artisan glass accordion with gold-accented expanded state.
 *
 * Uses a single-open pattern: expanding one row closes any previously open row.
 * Fully keyboard-navigable and respects `prefers-reduced-motion`.
 */
export function FAQAccordion({ items, className }: FAQAccordionProps) {
  const reducedMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const handleToggle = useCallback(
    (index: number) => {
      setOpenIndex((prev) => (prev === index ? null : index));
    },
    [],
  );

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={reducedMotion ? REDUCED_TRANSITION : { duration: DURATION.component, ease: EASE.entrance }}
      className={cn('flex flex-col gap-3', className)}
    >
      {items.map((item, index) => (
        <AccordionRow
          key={item.question}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
          reducedMotion={reducedMotion}
        />
      ))}
    </motion.div>
  );
}

export type { FAQItem, FAQAccordionProps };
