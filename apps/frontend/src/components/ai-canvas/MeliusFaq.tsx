'use client';

import React, { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE, DURATION, REDUCED_TRANSITION } from '@/lib/motion';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface FAQItem {
  question: string;
  answer: string;
}

interface MeliusFAQProps {
  items?: FAQItem[];
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Row                                                                       */
/* -------------------------------------------------------------------------- */

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <motion.span
    animate={{ rotate: isOpen ? 90 : 0 }}
    transition={{ duration: DURATION.micro, ease: EASE.entrance }}
    className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center"
    aria-hidden="true"
  >
    <svg
      className="h-4 w-4 text-white/70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </motion.span>
);

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
        'rounded-2xl border transition-colors duration-300',
        isOpen
          ? 'border-white/20 bg-white/[0.04]'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
      )}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`melius-faq-answer-${item.question}`}
        id={`melius-faq-trigger-${item.question}`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full items-center gap-4 px-6 py-5 text-left',
          'font-serif text-base tracking-tight text-white',
          'transition-colors duration-300',
          isOpen && 'text-sl-gold-subtle',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-2xl',
        )}
      >
        <span className="flex-1 leading-snug">{item.question}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`melius-faq-answer-${item.question}`}
            role="region"
            aria-labelledby={`melius-faq-trigger-${item.question}`}
            initial={reducedMotion ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            animate={reducedMotion ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              reducedMotion
                ? REDUCED_TRANSITION
                : {
                    height: { duration: DURATION.component, ease: EASE.entrance },
                    opacity: { duration: DURATION.micro, ease: EASE.sharp },
                  }
            }
            className="overflow-hidden"
          >
            <div ref={contentRef} className="px-6 pb-5 text-sm leading-relaxed text-white/70">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What models do you support?',
    answer:
      'Melius supports the full spectrum of leading image and video models — GPT Image 2, Nano Banana Pro, Seedance 2.0, Kling 3.0 Omni, Ideogram 4, and many more. New models are added continuously so your canvas always stays current.',
  },
  {
    question: 'Can I use Melius with my existing creative workflow?',
    answer:
      'Yes. Melius is built to sit inside your existing pipeline — import brand assets, connect DAMs, push finished work back to your ad channels, and keep approvals inside your normal toolchain.',
  },
  {
    question: 'How are credits calculated?',
    answer:
      'Credits are consumed per generation. Image generations cost fewer credits than video generations. Each plan shows an approximate equivalence so you can forecast usage before you commit.',
  },
  {
    question: 'Do you offer team and enterprise plans?',
    answer:
      'Yes. Professional includes Slack access, semantic asset management, and custom voices. Enterprise adds priority queue, dedicated support, unlimited agent skills, and volume discounts.',
  },
  {
    question: 'Is my content private and brand-safe?',
    answer:
      'Workspaces are isolated by default. Professional and Enterprise plans include brand-check guardrails, semantic asset controls, and audit-ready exports for compliance and legal review.',
  },
];

export function MeliusFAQ({ className }: MeliusFAQProps) {
  const reducedMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section className="relative bg-void px-6 py-24 sm:px-10 md:px-16 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-16 text-center md:mb-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/60">
            <span className="mr-3 inline-block h-px w-8 align-middle bg-white/40" />
            FAQ
            <span className="ml-3 inline-block h-px w-8 align-middle bg-white/40" />
          </p>
          <h2 className="mt-6 font-serif text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] tracking-tight text-white">
          Frequently asked <span className="text-sl-gold-subtle">questions</span>
          </h2>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={
            reducedMotion
              ? undefined
              : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          }
          className={cn('flex flex-col gap-3', className)}
        >
          {FAQ_ITEMS.map((item, index) => (
            <AccordionRow
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              reducedMotion={!!reducedMotion}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
