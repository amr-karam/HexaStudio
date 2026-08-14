'use client';

import React, { useEffect, useRef } from 'react';

interface TextSplitProps {
  children: string;
  className?: string;
  delay?: number;
}

/**
 * TextSplit — declarative per-word reveal animation.
 *
 * Renders word spans in JSX (React-owned DOM) and animates them via refs.
 * NEVER mutates innerHTML or appends child nodes imperatively — that corrupts
 * React reconciliation and throws `insertBefore` NotFoundError on re-render.
 */
export const TextSplit = ({ children, className, delay = 0 }: TextSplitProps) => {
  const wordRefs = useRef<HTMLSpanElement[]>([]);
  const words = children.split(' ');

  useEffect(() => {
    let cancelled = false;

    void import('gsap').then(({ default: gsap }) => {
      if (cancelled) return;

      wordRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: 1,
            delay: delay + i * 0.1,
            ease: 'power4.out',
          },
        );
      });
    });

    return () => {
      cancelled = true;
    };
  }, [children, delay]);

  return (
    <div className={className}>
      <div className="flex flex-wrap justify-center md:justify-start">
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden mr-[0.2em]">
            <span
              ref={(el) => {
                if (el) wordRefs.current[i] = el;
              }}
              className="inline-block"
            >
              {word + ' '}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};
