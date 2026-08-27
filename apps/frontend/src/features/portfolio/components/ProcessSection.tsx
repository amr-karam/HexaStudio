'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChapterHeading } from '@/components/scroll/ChapterHeading';
import { useReducedMotion } from '@/hooks';

const steps = [
  {
    number: '01',
    title: 'Discover',
    description:
      'We immerse ourselves in your vision, site, and constraints. Every project begins with deep research and a shared understanding of what makes it unique.',
    details: ['Site analysis & context study', 'Material & light research', 'Conceptual brief development'],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" strokeLinecap="round" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Create',
    description:
      'Our team translates architectural data into cinematic visual narratives. Real-time 3D environments allow for iterative refinement at every stage.',
    details: ['3D modeling & scene building', 'Cinematic lighting & materials', 'Real-time interactive reviews'],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Deliver',
    description:
      'The final output transcends traditional visualization. We deliver immersive experiences that communicate your vision with uncompromising fidelity.',
    details: ['8K photorealistic rendering', 'Interactive VR walkthroughs', 'Branded presentation packages'],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
        <path d="m22 4-10 10-3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/**
 * Premium Step Card — cinematic reveal with gold accents and geometric decoration
 */
const StepCard = ({ step, index }: { step: (typeof steps)[0]; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ 
        type: 'spring', 
        stiffness: 120, 
        damping: 20, 
        delay: index * 0.2 
      }}
      className="group relative"
    >
      {/* Background geometric decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold/20 group-hover:border-gold/40 transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold/20 group-hover:border-gold/40 transition-colors duration-500" />
      
      {/* Card content */}
      <div className="relative p-8 md:p-10 bg-surface/30 backdrop-blur-sm border border-border/30 group-hover:border-gold/20 transition-all duration-500">
        {/* Step number — decorative background */}
        <span className="absolute -top-6 -right-4 text-[80px] font-serif italic text-gold/[0.06] leading-none select-none pointer-events-none group-hover:text-gold/[0.1] transition-colors duration-700">
          {step.number}
        </span>

        {/* Icon with gold accent */}
        <div className="relative mb-8">
          <div className="w-14 h-14 rounded-sm bg-gold/10 group-hover:bg-gold/20 flex items-center justify-center transition-colors duration-500">
            <div className="text-gold/70 group-hover:text-gold transition-colors duration-500">
              {step.icon}
            </div>
          </div>
          {/* Gold line under icon */}
          <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-px bg-gradient-to-r from-gold/60 to-transparent transition-all duration-700 ease-out" />
        </div>

        {/* Step header */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs font-mono text-gold/60 tracking-[0.4em]">{step.number}</span>
          <div className="h-px w-12 bg-gold/20 group-hover:bg-gold/40 transition-colors duration-500" />
        </div>

        <h3 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-6 tracking-tight group-hover:text-gold/90 transition-colors duration-500">
          {step.title}
        </h3>

        <p className="text-base text-neutral-400 font-light leading-relaxed mb-8">
          {step.description}
        </p>

        {/* Details list */}
        <ul className="space-y-3">
          {step.details.map((d, i) => (
            <li 
              key={d}
              className="flex items-center gap-4 text-xs font-mono text-neutral-500 tracking-[0.15em] group-hover:text-neutral-400 transition-colors duration-500"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <span className="w-1.5 h-1.5 rounded-sm bg-gold/30 group-hover:bg-gold/60 group-hover:scale-125 transition-all duration-500 flex-shrink-0" />
              {d}
            </li>
          ))}
        </ul>

        {/* Bottom animated line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold/50 group-hover:w-3/4 transition-all duration-1000 ease-out" />
      </div>
    </motion.div>
  );
};

/**
 * Connector line between steps
 */
const StepConnector = () => (
  <div className="hidden md:flex absolute top-1/2 left-0 right-0 items-center justify-center -translate-y-1/2 pointer-events-none">
    <div className="w-full max-w-4xl flex items-center justify-between px-24">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </div>
  </div>
);

/**
 * ProcessSection — Premium cinematic three-step narrative.
 * Features geometric decorations, gold accents, and staggered reveals.
 */
export const ProcessSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const headingY = useTransform(scrollYProgress, [0, 0.3], [60, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative px-8 md:px-16 py-32 bg-void-deep overflow-hidden"
    >
      {/* Layered ambient glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gold/[0.02] rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div style={reducedMotion ? {} : { y: headingY }} className="mb-24">
          <ChapterHeading
            index={3}
            chapter="Method"
            kicker="Our Process"
            title="How We Create"
            accentWords={['Create']}
            description="From first sketch to final render, every project follows a proven workflow that balances creative ambition with architectural precision."
          />
        </motion.div>

        {/* Steps grid with connecting element */}
        <div className="relative">
          <StepConnector />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative z-10">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </section>
  );
};
