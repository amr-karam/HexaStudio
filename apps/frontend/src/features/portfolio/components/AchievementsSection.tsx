'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const stats = [
  { value: 12, label: 'Countries Served', suffix: '+' },
  { value: 200, label: 'Projects Delivered', suffix: '+' },
  { value: 8, label: 'Years Excellence', suffix: '' },
  { value: 100, label: 'Client Satisfaction', suffix: '%' },
];

const StatItem = ({ stat, index }: { stat: typeof stats[0], index: number }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);
  
  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;
    const controls = animate(0, stat.value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => setDisplayValue(Math.round(value).toString()),
    });
    return () => controls.stop();
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="text-center group relative"
    >
      <div className="absolute -inset-4 bg-accent/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
      <span className="text-5xl md:text-7xl font-serif text-accent font-light block mb-4 transition-all duration-500 group-hover:scale-110 group-hover:text-white relative z-10">
        {displayValue}{stat.suffix}
      </span>
      <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 group-hover:text-neutral-300 transition-colors duration-500 block relative z-10">
        {stat.label}
      </span>
    </motion.div>
  );
};

export const AchievementsSection = () => {
  return (
    <section className="px-8 md:px-16 py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-accent/30 via-accent/50 to-transparent" />
      <div className="w-full relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-24">
          {stats.map((stat, idx) => (
            <StatItem key={stat.label} stat={stat} index={idx} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent via-accent/50 to-transparent" />
    </section>
  );
};