'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/inputs/Input';

export function NewsletterSection() {
  return (
    <section className="px-8 md:px-16 py-32 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5 blur-[120px] rounded-full translate-y-1/2" />
      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-8 block font-mono"
        >
          Stay Informed
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-serif font-light text-foreground mb-12 leading-tight"
        >
          Join the <span className="italic text-accent">Inner Circle.</span>
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
        >
          <Input placeholder="Enter your email" className="flex-1" />
          <Button variant="primary" size="lg">Subscribe</Button>
        </motion.div>
        <p className="text-neutral-500 text-xs font-light mt-8 uppercase tracking-widest">
          No spam. Only curated architectural insights.
        </p>
      </div>
    </section>
  );
}
