'use client';

import { ProjectGrid } from '@/features/portfolio/components/ProjectGrid';
import { motion } from 'framer-motion';

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'var(--ease-out-expo)' }}
        className="max-w-screen-2xl mx-auto px-8 md:px-16 mb-24"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-6 block">
          Archives
        </span>
        <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tighter text-foreground leading-tight">
          Visual <span className="italic text-accent">Narratives</span>
        </h1>
      </motion.div>
      
      <ProjectGrid />
    </main>
  );
}
