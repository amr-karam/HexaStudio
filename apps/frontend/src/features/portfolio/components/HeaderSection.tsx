'use client';
import { EASE } from '@/lib/motion';

import { motion } from 'framer-motion';
import { TextSplit } from '@/components/ui/TextSplit';

export function HeaderSection() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE.entrance }}
      className="px-5 sm:px-6 md:px-12 lg:px-16 mb-12 sm:mb-16 md:mb-20 lg:mb-24"
    >
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.5em] text-sl-mist/60 mb-4 sm:mb-6 block font-mono">
        Archives
      </span>
      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-8xl font-serif font-light tracking-tighter text-sl-alabaster leading-tight">
        <TextSplit>Visual Narratives</TextSplit>
      </div>
    </motion.div>
  );
}
