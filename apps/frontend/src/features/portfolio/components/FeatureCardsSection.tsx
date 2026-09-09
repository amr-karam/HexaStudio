'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { STAGGER, staggerContainer, fadeLift } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const FEATURES = [
  {
    title: 'Immersion',
    body: 'Interactive 3D environments powered by R3F, enabling intuitive exploration of built and imagined spaces.',
    img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Fidelity',
    body: '8K photorealistic rendering with a relentless focus on material authenticity and light behavior.',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Precision',
    body: 'Measured against the physics of the real world for absolute truth in every rendered frame.',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  },
] as const;

/**
 * FeatureCardsSection — The three alternating left-right feature articles
 * on the homepage. Uses staggered fade-lift reveals with viewport triggering.
 */
export function FeatureCardsSection() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.section
      id="features"
      variants={staggerContainer(STAGGER.page, 0.1)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="max-w-7xl mx-auto px-5 sm:px-6 md:px-16 py-20 sm:py-28 md:py-32"
      aria-label="Features"
    >
      {/* Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop */}
      <h2 className="sr-only">Our craft</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
        {FEATURES.map((f, _i) => (
          <motion.article
            key={f.title}
            variants={fadeLift}
            custom={prefersReduced}
            className="group relative flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden border border-sl-silver/20 mb-6">
              <Image
                src={f.img}
                alt={f.title}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition duration-700"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Gold corner accents */}
              <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-sl-gold-subtle/20 group-hover:border-sl-gold-subtle/50 transition-colors duration-700" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-sl-gold-subtle/20 group-hover:border-sl-gold-subtle/50 transition-colors duration-700" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light tracking-tighter text-sl-alabaster mb-3 group-hover:text-sl-gold-hover transition-colors duration-500">
              {f.title}
            </h3>
            <p className="text-sm sm:text-base text-sl-mist/60 font-light leading-relaxed">
              {f.body}
            </p>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
