'use client';

import React, { useEffect } from 'react';
import { useSpring, useTransform, motion as m } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CounterProps {
  value: string;
}

/**
 * Counter animates a numeric value from 0 to the target value.
 * It handles strings with suffixes (e.g., '12+', '200+') by extracting the number.
 *
 * Accessibility: when the user prefers reduced motion, the value is shown
 * immediately at its final state (no count-up animation).
 */
export const Counter = ({ value }: CounterProps) => {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const suffix = value.replace(/[0-9]/g, '');
  const reducedMotion = useReducedMotion();

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    mass: 1,
  });

  const displayValue = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    if (reducedMotion) {
      spring.jump(numericValue);
    } else {
      spring.set(numericValue);
    }
  }, [numericValue, spring, reducedMotion]);

  return (
    <span>
      <m.span>{displayValue}</m.span>
      {suffix}
    </span>
  );
};
