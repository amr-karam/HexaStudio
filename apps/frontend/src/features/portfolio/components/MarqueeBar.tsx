'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks';

const brands = [
  'ArchDaily',
  'Dezeen',
  'Architectural Digest',
  'Forbes',
  'Wallpaper*',
  'DesignBoom',
  'Frame',
  'Azure',
  'Interior Design',
  'Surface',
  'Pin-Up',
  'Dwell',
];

/**
 * MarqueeBar — An infinite horizontal scroll of notable brand names.
 * Serves as social proof: "Trusted by the industry's leading publications."
 * Disabled for reduced-motion users (static centered layout instead).
 */
export const MarqueeBar = () => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <section className="py-16 bg-surface border-y border-border/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-500 mb-8 text-center font-mono">
            Featured In
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {brands.map((name) => (
              <span
                key={name}
                className="text-xs text-neutral-600 tracking-widest uppercase font-light"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-surface border-y border-border/20 overflow-hidden">
      <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-500 mb-8 text-center font-mono">
        Featured In
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-16 w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            x: {
              duration: 40,
              ease: 'linear',
              repeat: Infinity,
            },
          }}
        >
          {/* Two copies for seamless loop */}
          {[...brands, ...brands].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="text-sm text-neutral-600 hover:text-neutral-300 tracking-[0.3em] uppercase font-light transition-colors duration-500 whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
