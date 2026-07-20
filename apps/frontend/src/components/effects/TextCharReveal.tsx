'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface Props {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  duration?: number;
  blur?: boolean;
}

export default function TextCharReveal({
  text,
  className = '',
  delay = 0,
  stagger = 0.03,
  as: Tag = 'h2',
  duration = 0.6,
  blur = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const chars = text.split('');

  const container = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: blur ? 'blur(10px)' : 'none',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <Tag ref={ref} className={`inline-block ${className}`}>
      <motion.span
        className="inline-block"
        variants={container}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        aria-label={text}
      >
        {chars.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className={`inline-block ${char === ' ' ? 'w-[0.3em]' : ''}`}
            variants={child}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
