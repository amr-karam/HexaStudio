'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/inputs/Input';
import { EASE, DURATION, STAGGER } from '@/lib/motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.page,
      delayChildren: 0.1,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.component, ease: EASE.entrance },
  },
};

export function NewsletterSection() {
  return (
    <section className="relative px-8 md:px-16 py-32 border-t border-border/50 overflow-hidden bg-background">
      {/* Ambient gold glow */}
      <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />

      {/* Decorative top gold line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="max-w-3xl mx-auto relative z-10 text-center"
      >
        <motion.span
          variants={childVariants}
          className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-8 block font-mono"
        >
          Stay Informed
        </motion.span>

        <motion.div variants={childVariants} className="overflow-hidden mb-6">
          <h2 className="text-4xl md:text-6xl font-serif font-light text-foreground leading-tight">
            Join the <span className="italic text-accent">Inner Circle.</span>
          </h2>
        </motion.div>

        <motion.p
          variants={childVariants}
          className="text-base text-neutral-400 font-light leading-relaxed mb-12 max-w-lg mx-auto"
        >
          Be the first to receive exclusive architectural insights, project reveals, and
          behind-the-scenes narratives from our studio.
        </motion.p>

        <motion.div
          variants={childVariants}
          className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto group"
        >
          <div className="relative flex-1">
            <Input
              placeholder="Enter your email"
              className="flex-1 transition-all duration-500 focus:ring-1 focus:ring-accent/30 focus:border-accent/50"
            />
            <div className="absolute bottom-0 left-0 h-px bg-accent/0 group-focus-within:bg-accent/50 transition-all duration-700 w-0 group-focus-within:w-full" />
          </div>
          <Button variant="primary" size="lg" className="group relative overflow-hidden">
            <span className="relative z-10">Subscribe</span>
            <span className="absolute inset-0 bg-accent/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
          </Button>
        </motion.div>

        <motion.div
          variants={childVariants}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <div className="h-px w-8 bg-accent/20" />
          <p className="text-neutral-600 text-[10px] uppercase tracking-[0.3em] font-mono">
            No spam. Only curated architectural insights.
          </p>
          <div className="h-px w-8 bg-accent/20" />
        </motion.div>
      </motion.div>

      {/* Decorative bottom gold line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
    </section>
  );
}
