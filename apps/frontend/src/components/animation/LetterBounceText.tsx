'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getGsap } from '@/lib/gsap';

interface LetterBounceTextProps {
  children: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p';
  stagger?: number;
  duration?: number;
  delay?: number;
  y?: number;
}

export function LetterBounceText({
  children,
  className,
  tag: Tag = 'span',
  stagger = 0.05,
  duration = 1.2,
  delay = 0,
  y = 80,
}: LetterBounceTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (!ref.current) return;

    let cancelled = false;

    (async () => {
      const gsap = await getGsap();
      if (cancelled || !ref.current) return;

      const letters = ref.current.querySelectorAll('.letter');
      if (!letters.length) return;

      gsap.set(letters, { y, opacity: 0, transformOrigin: 'bottom' });
      gsap.to(letters, {
        y: 0,
        opacity: 1,
        stagger,
        duration,
        delay,
        ease: 'back.out(1.6)',
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [children, reduced, stagger, duration, delay, y]);

  const letters = children.split('').map((char, i) => {
    if (char === ' ') {
      return <span key={i} className="inline-block">&nbsp;</span>;
    }
    return (
      <span key={i} className="letter inline-block" style={{ transformOrigin: 'bottom' }}>
        {char}
      </span>
    );
  });

  return (
    <Tag ref={ref} className={cn('inline-flex flex-wrap', className)}>
      {letters}
    </Tag>
  );
}
