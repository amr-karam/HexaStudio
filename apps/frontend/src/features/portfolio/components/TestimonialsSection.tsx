'use client';

import { motion } from 'framer-motion';
import { ChapterMarker } from '@/components/animation/ChapterMarker';
import { KineticTitle } from '@/components/scroll/KineticTitle';
import { STAGGER } from '@/lib/motion';
import { useFeaturedTestimonials } from '@/features/testimonials/hooks/useTestimonials';
import { useLocale } from '@/i18n/LocaleProvider';

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.8 };

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
    transition: { ...SPRING_TRANSITION, delay: i * STAGGER.component },
  }),
};

/**
 * Premium TestimonialCard — Editorial layout with quote, decoration, and avatar
 */
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
}) => {
  // Get initials for avatar
  const initials = author
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="group relative"
    >
      <div className="relative flex flex-col h-full p-8 md:p-10 bg-gradient-to-br from-surface/40 via-surface/20 to-surface/30 backdrop-blur-md border border-border/30 group-hover:border-gold/30 transition-all duration-700">
        
        {/* Decorative quote mark — large, gold */}
        <div className="absolute top-4 right-6 text-[80px] font-serif italic text-gold/[0.06] leading-none select-none pointer-events-none group-hover:text-gold/[0.12] transition-colors duration-700">
          &ldquo;
        </div>
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold/20 group-hover:border-gold/50 transition-colors duration-500" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold/20 group-hover:border-gold/50 transition-colors duration-500" />
        
        {/* Quote icon */}
        <div className="mb-6">
          <svg className="w-8 h-8 text-gold/40 group-hover:text-gold/70 transition-colors duration-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        {/* Quote text */}
        <blockquote className="text-base md:text-lg text-neutral-200 font-light leading-relaxed flex-1 mb-8">
          {quote}
        </blockquote>

        {/* Author section with avatar */}
        <div className="flex items-center gap-4 pt-6 border-t border-border/20 group-hover:border-gold/20 transition-colors duration-500">
          {/* Avatar circle with initials */}
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30 flex items-center justify-center group-hover:border-gold/60 group-hover:scale-110 transition-all duration-500">
            <span className="font-mono text-xs text-gold/80 group-hover:text-gold tracking-wider">
              {initials}
            </span>
            <div className="absolute inset-0 rounded-full bg-gold/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground tracking-wider uppercase group-hover:text-gold/90 transition-colors duration-500">
              {author}
            </p>
            <p className="text-[10px] text-gold/50 font-mono tracking-[0.2em] mt-0.5">
              {role}
            </p>
          </div>
        </div>

        {/* Animated bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold/60 group-hover:w-3/4 transition-all duration-1000 ease-out" />
        
        {/* Subtle top gradient on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
    </motion.div>
  );
};

/**
 * TestimonialsSection — Premium editorial testimonial cards with cinematic reveals.
 * Features avatar circles, decorative quote marks, and rich hover interactions.
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
    <section className="relative px-8 md:px-16 py-32 bg-void-deep border-y border-border/20 overflow-hidden">
      {/* Layered ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-gold/[0.015] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-gold/[0.01] rounded-full blur-[80px] pointer-events-none" />
      
      <div className="absolute top-12 left-8 md:left-16 z-20">
        <ChapterMarker index={4} title="Proof" />
      </div>
      <div className="absolute inset-0 gradient-radial-gold pointer-events-none opacity-30" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={SPRING_TRANSITION}
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