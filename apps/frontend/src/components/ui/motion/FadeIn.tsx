'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Distance (px) the element lifts from. Defaults to system standard. */
  y?: number;
}

export function FadeIn({ children, delay = 0, className, y }: FadeInProps) {
  const { transition } = useHEXAMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: y ?? 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition('entrance', 'component', delay)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInView({ children, className, y }: FadeInProps) {
  const { transition } = useHEXAMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: y ?? 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={transition('entrance', 'component')}
      className={className}
    >
      {children}
    </motion.div>
  );
}
