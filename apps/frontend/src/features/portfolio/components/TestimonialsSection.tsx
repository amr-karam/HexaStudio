'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';
import { RadialGlow } from '@/components/animation';
import { cn } from '@/lib/utils';

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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-8 md:px-16 py-32 bg-surface border-y border-border/50 overflow-hidden">
      <RadialGlow color="#D4AF37" size={500} top="-150px" left="-80px" blur={50} opacity={0.1} />
      <RadialGlow color="#D4AF37" size={350} bottom="-100px" right="-60px" blur={40} opacity={0.07} />
      <div className="w-full">
        <ScrollFadeIn className="mb-24 text-center">
          <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block">
            Client Testimonials
          </span>
          <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground leading-tight">
            What Our Partners <span className="italic text-accent">Say</span>
          </h2>
        </ScrollFadeIn>
        
        <div className="relative h-[300px] md:h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col items-center text-center px-4"
            >
              <blockquote className="text-xl md:text-3xl text-neutral-300 font-light italic leading-relaxed max-w-5xl mb-8">
                &ldquo;{testimonials[activeIndex].quote}&rdquo;
              </blockquote>
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-medium text-foreground tracking-widest uppercase">
                  {testimonials[activeIndex].author}
                </p>
                <p className="text-xs text-accent/60 font-mono">
                  {testimonials[activeIndex].role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center gap-3 mt-12">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "h-1 transition-all duration-500 rounded-full",
                activeIndex === idx ? "w-12 bg-accent" : "w-4 bg-neutral-800"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
