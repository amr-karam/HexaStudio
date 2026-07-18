'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { makeTransition } from '@/lib/motion';
import { useReducedMotion } from '@/hooks';

const steps = [
  {
    number: '01',
    title: 'Discover',
    description:
      'We immerse ourselves in your vision, site, and constraints. Every project begins with deep research and a shared understanding of what makes it unique.',
    details: ['Site analysis & context study', 'Material & light research', 'Conceptual brief development'],
  },
  {
    number: '02',
    title: 'Create',
    description:
      'Our team translates architectural data into cinematic visual narratives. Real-time 3D environments allow for iterative refinement at every stage.',
    details: ['3D modeling & scene building', 'Cinematic lighting & materials', 'Real-time interactive reviews'],
  },
  {
    number: '03',
    title: 'Deliver',
    description:
      'The final output transcends traditional visualization. We deliver immersive experiences that communicate your vision with uncompromising fidelity.',
    details: ['8K photorealistic rendering', 'Interactive VR walkthroughs', 'Branded presentation packages'],
  },
];

const StepCard = ({ step, index }: { step: (typeof steps)[0]; index: number }) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className="flex flex-col gap-4 p-8 bg-surface/50 border border-border/20">
        <span className="text-[10px] font-mono text-gold/60 tracking-[0.3em]">
          {step.number}
        </span>
        <h3 className="text-2xl font-serif font-light text-foreground">{step.title}</h3>
        <p className="text-sm text-neutral-400 font-light leading-relaxed">{step.description}</p>
        <ul className="space-y-2 mt-4">
          {step.details.map((d) => (
            <li key={d} className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] flex items-center gap-3">
              <span className="inline-block w-1 h-1 rounded-full bg-gold/40" />
              {d}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={makeTransition('entrance', 'page', index * 0.15)}
      className="relative flex flex-col gap-4 p-8 md:p-10 bg-surface/30 border border-border/10 hover:border-gold/20 transition-colors duration-700 group"
    >
      {/* Step number — large, decorative */}
      <span className="text-[40px] md:text-[60px] font-serif italic text-gold/10 absolute -top-2 -right-2 leading-none select-none">
        {step.number}
      </span>

      {/* Index line */}
      <div className="flex items-center gap-4 mb-2">
        <span className="text-xs font-mono text-gold/60 tracking-[0.3em]">{step.number}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
      </div>

      <h3 className="text-2xl md:text-3xl font-serif font-light text-foreground group-hover:text-gold/90 transition-colors duration-500">
        {step.title}
      </h3>

      <p className="text-sm text-neutral-400 font-light leading-relaxed">{step.description}</p>

      <ul className="space-y-2 mt-2">
        {step.details.map((d) => (
          <li
            key={d}
            className="text-[10px] font-mono text-neutral-600 tracking-[0.2em] flex items-center gap-3"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-gold/30 group-hover:bg-gold/60 transition-colors duration-500" />
            {d}
          </li>
        ))}
      </ul>

      {/* Bottom accent line on hover */}
      <div className="absolute bottom-0 left-0 w-0 h-px bg-gold/40 group-hover:w-full transition-all duration-700 ease-out" />
    </motion.div>
  );
};

/**
 * ProcessSection — "How We Create" three-step narrative.
 * Replaces the old StudioSection with a more engaging, process-driven layout.
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
      className="relative px-8 md:px-16 py-32 bg-background overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div style={reducedMotion ? {} : { y: headingY }} className="mb-24">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={makeTransition('entrance', 'component')}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            Our Process
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={makeTransition('entrance', 'page')}
            className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground leading-[1.1]"
          >
            How We <span className="italic text-gold">Create</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={makeTransition('entrance', 'page', 0.15)}
            className="text-base text-neutral-500 font-light leading-relaxed max-w-lg mt-6"
          >
            From first sketch to final render, every project follows a proven workflow
            that balances creative ambition with architectural precision.
          </motion.p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </section>
  );
};
