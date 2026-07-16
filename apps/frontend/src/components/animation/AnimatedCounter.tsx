'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { getGsap } from '@/lib/gsap';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  formatter?: (n: number) => string;
  trigger?: string | HTMLElement | null;
  triggerStart?: string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className,
  formatter = (n) => n.toLocaleString(),
  trigger,
  triggerStart = 'top 75%',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    if (reduced) {
      ref.current.textContent = formatter(value);
      return;
    }

    let cancelled = false;

    (async () => {
      const gsap = await getGsap();
      if (cancelled || !ref.current) return;

      const el = ref.current;
      const target = { v: 0 };

      gsap.to(target, {
        v: value,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = formatter(Math.floor(target.v));
        },
        scrollTrigger: {
          trigger: trigger || el.parentElement || el,
          start: triggerStart,
          once: true,
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [value, duration, formatter, reduced, trigger, triggerStart]);

  if (reduced) {
    return (
      <span className={className}>
        {prefix}{formatter(value)}{suffix}
      </span>
    );
  }

  return (
    <span className={cn('tabular-nums', className)} ref={ref}>
      {prefix}0{suffix}
    </span>
  );
}
