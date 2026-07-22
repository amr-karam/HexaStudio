'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { ChapterMarker } from '@/components/animation/ChapterMarker';
import { KineticTitle } from '@/components/scroll/KineticTitle';
import { EASE, DURATION, makeTransition, STAGGER } from '@/lib/motion';
import { useFeaturedTestimonials } from '@/features/testimonials/hooks/useTestimonials';
import { useLocale } from '@/i18n/LocaleProvider';

const fallbackTestimonials = [
  {
    content: 'HexaStudio transformed our architectural presentation. The interactive 3D walkthrough allowed our clients to experience the space before construction began — it was a game-changer for approvals.',
    clientName: 'James Crawford',
    clientRole: 'Principal Architect, Crawford Associates',
  },
  {
    content: 'The level of detail and cinematic quality exceeded our expectations. Every material, every shadow was meticulously crafted. This is visualization at its finest.',
    clientName: 'Elena Voss',
    clientRole: 'Design Director, Voss Architecture',
  },
  {
    content: 'We have worked with many visualization studios, but none matched the technical precision and artistic vision that HexaStudio brings to the table.',
    clientName: 'Marcus Chen',
    clientRole: 'Founder, Chen Development Group',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.component, ease: EASE.entrance, delay: i * STAGGER.component },
  }),
};

const TestimonialCard = ({
  quote,
  author,
  role,
  index,
}: {
  quote: string;
  author: string;
  role: string;
  index: number;
}) => (
  <motion.div
    custom={index}
    variants={cardVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
  >
    <GlassCard variant="default" hover={true} className="flex flex-col gap-6 p-8 md:p-10 group">
      {/* Decorative quote mark */}
      <span className="text-5xl font-serif italic text-gold/10 leading-none select-none">
        &ldquo;
      </span>

      <blockquote className="text-base md:text-lg text-neutral-300 font-light leading-relaxed flex-1">
        {quote}
      </blockquote>

      <div className="flex flex-col gap-1 pt-4 border-t border-border/10">
        <p className="text-sm font-medium text-foreground tracking-widest uppercase">
          {author}
        </p>
        <p className="text-[10px] text-gold/50 font-mono tracking-[0.2em]">
          {role}
        </p>
      </div>

      {/* Gold accent on hover */}
      <div className="absolute top-0 left-0 w-0 h-0.5 bg-gold/60 group-hover:w-full transition-all duration-700 ease-out" />
    </GlassCard>
  </motion.div>
);

/**
 * TestimonialsSection — A 2-column card grid of client testimonials with
 * staggered scroll-triggered reveals. Each card has a decorative gold
 * accent line that animates on hover.
 */
export const TestimonialsSection = () => {
  const { t } = useLocale();
  const { data } = useFeaturedTestimonials();

  const testimonials = (data && data.length > 0 ? data : fallbackTestimonials).map((item) => ({
    quote: item.content,
    author: item.clientName,
    role: item.clientRole || '',
  }));

  return (
    <section className="relative px-8 md:px-16 py-32 bg-surface border-y border-border/30 overflow-hidden">
      <div className="absolute top-12 left-8 md:left-16 z-20">
        <ChapterMarker index={4} title="Proof" />
      </div>
      <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={makeTransition('entrance', 'component')}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            {t('home.stats.clients')}
          </motion.span>

          <KineticTitle
            text="What Our Partners Say"
            accentWords={['Say']}
            className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground leading-tight"
          />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((item, idx) => (
            <TestimonialCard
              key={idx}
              quote={item.quote}
              author={item.author}
              role={item.role}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
