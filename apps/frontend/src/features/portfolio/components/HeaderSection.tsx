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
      className="px-8 md:px-16 mb-24"
    >
      <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono">
        Archives
      </span>
      <div className="text-6xl md:text-8xl font-serif font-light tracking-tighter text-foreground leading-tight">
        <TextSplit>Visual Narratives</TextSplit>
      </div>
    </motion.div>
  );
}
