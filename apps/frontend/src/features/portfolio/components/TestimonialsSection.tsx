'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';

const testimonials = [
  {
    quote:
      'HexaStudio transformed our architectural presentation. The interactive 3D walkthrough allowed our clients to experience the space before construction began — it was a game-changer for approvals.',
    author: 'James Crawford',
    role: 'Principal Architect, Crawford Associates',
  },
  {
    quote:
      'The level of detail and cinematic quality exceeded our expectations. Every material, every shadow was meticulously crafted. This is visualization at its finest.',
    author: 'Elena Voss',
    role: 'Design Director, Voss Architecture',
  },
  {
    quote:
      'We have worked with many visualization studios, but none matched the technical precision and artistic vision that HexaStudio brings to the table.',
    author: 'Marcus Chen',
    role: 'Founder, Chen Development Group',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="px-8 md:px-16 py-32 bg-surface border-y border-border/50">
      <div>
        <ScrollFadeIn className="mb-24 text-center">
          <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block">
            Client Testimonials
          </span>
          <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground leading-tight">
            What Our Partners <span className="italic text-accent">Say</span>
          </h2>
        </ScrollFadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-12 border border-border hover:border-accent/30 transition-all duration-700 bg-background/30 group"
            >
              <blockquote className="text-base text-neutral-400 font-light leading-relaxed mb-12 italic">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <div>
                <p className="text-sm font-medium text-foreground">{item.author}</p>
                <p className="text-xs text-neutral-600">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};