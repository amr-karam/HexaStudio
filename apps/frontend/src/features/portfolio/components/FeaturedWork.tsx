'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { EASE, DURATION } from '@/lib/motion';
import { useReducedMotion } from '@/hooks';

/**
 * FeaturedWork — A full-bleed project showcase with a split-screen reveal.
 * On scroll, the image halves slide apart from center, revealing the project
 * title and metadata between them. Uses the signature entrance easing.
 */
export const FeaturedWork = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  });

  const leftX = useTransform(scrollYProgress, [0, 1], ['-5%', '0%']);
  const rightX = useTransform(scrollYProgress, [0, 1], ['5%', '0%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0, 1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [40, 0]);

  // Reduced motion: static layout
  if (reducedMotion) {
    return (
      <section ref={sectionRef} className="relative h-screen min-h-[600px] bg-background overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <div
            className="h-full w-full bg-cover bg-center opacity-30"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-background" />
        </div>

        <div className="relative z-10 h-full flex items-center px-8 md:px-16">
          <div className="max-w-3xl">
            <span className="text-[9px] uppercase tracking-[0.5em] text-gold/60 mb-6 block font-mono">
              Featured Project
            </span>
            <h2 className="text-6xl md:text-8xl font-serif font-light text-white leading-[1.05] mb-6">
              Lumina <span className="italic text-gold">Pavilion</span>
            </h2>
            <p className="text-base text-white/40 font-light leading-relaxed max-w-lg mb-10">
              A translucent commercial pavilion that appears to float above its waterfront site.
              ETFE cushions and precision steel form a crystalline envelope.
            </p>
            <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono mb-10">
              <span>Commercial · 2025</span>
              <span>Location: Dubai Marina</span>
              <span>Status: Built</span>
            </div>
            <Link href="/portfolio/lumina-pavilion">
              <Button variant="primary" size="lg">View Project</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[700px] bg-background overflow-hidden">
      {/* Split image halves */}
      <motion.div
        style={{ x: leftX }}
        className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
      >
        <div
          className="h-full w-[200%] bg-cover bg-right opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
      </motion.div>

      <motion.div
        style={{ x: rightX }}
        className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
      >
        <div
          className="h-full w-[200%] bg-cover bg-left opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-background via-background/20 to-transparent" />
      </motion.div>

      {/* Center divider line (animated) */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: DURATION.page, ease: EASE.entrance }}
        className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent origin-top"
      />

      {/* Content overlay — appears after split */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full flex items-center px-8 md:px-16"
      >
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION.component, ease: EASE.entrance }}
            className="text-[9px] uppercase tracking-[0.5em] text-gold/60 mb-6 block font-mono"
          >
            Featured Project
          </motion.span>

          <h2 className="text-6xl md:text-8xl font-serif font-light text-white leading-[1.05] mb-6">
            Lumina <span className="italic text-gold">Pavilion</span>
          </h2>

          <p className="text-base text-white/40 font-light leading-relaxed max-w-lg mb-10">
            A translucent commercial pavilion that appears to float above its waterfront site.
            ETFE cushions and precision steel form a crystalline envelope that refracts
            sunlight throughout the day.
          </p>

          <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono mb-10">
            <span className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold/60" />
              Commercial · 2025
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold/40" />
              Location: Dubai Marina
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold/40" />
              Status: Built
            </span>
          </div>

          <Magnetic>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DURATION.component, ease: EASE.entrance, delay: 0.3 }}
            >
              <Link href="/portfolio/lumina-pavilion">
                <Button variant="primary" size="lg" className="group">
                  View Project
                  <span className="ml-3 inline-block transition-transform duration-500 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Button>
              </Link>
            </motion.div>
          </Magnetic>
        </div>
      </motion.div>

      {/* Bottom gold accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </section>
  );
};
