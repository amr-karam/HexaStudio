'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const CHAPTERS = [
  { label: 'CH. 01', title: 'VISION', href: '#hero' },
  { label: 'CH. 02', title: 'CRAFT', href: '#craft' },
  { label: 'CH. 03', title: 'PROCESS', href: '#process' },
  { label: 'CH. 04', title: 'IMPACT', href: '#impact' },
];

/**
 * HomeChapterRail — Fixed side navigation for the homepage narrative.
 *
 * Tracks scroll progress against the four main chapters, highlights the
 * active chapter, and provides smooth-scroll affordances. Rendered as a
 * vertical rail on desktop and collapses to a minimal horizontal bar on
 * mobile to preserve the silent-luxury grid.
 */
export function HomeChapterRail() {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? scrollY / height : 0;
      const index = Math.min(CHAPTERS.length - 1, Math.floor(progress * CHAPTERS.length));
      setActive(index);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <nav
      ref={railRef}
      aria-label="Chapter navigation"
      className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-6 md:flex"
    >
      {CHAPTERS.map((chapter, i) => {
        const isActive = i === active;
        return (
          <Link
            key={chapter.label}
            href={chapter.href}
            onClick={(e) => handleClick(e, chapter.href)}
            className="group relative flex items-center gap-3"
            aria-current={isActive ? 'true' : undefined}
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.3em] transition-colors duration-500 ${
                isActive ? 'text-sl-gold' : 'text-sl-mist/40 group-hover:text-sl-mist/80'
              }`}
            >
              {chapter.label}
            </span>
            <span
              className={`hidden text-xs font-light transition-colors duration-500 sm:block ${
                isActive ? 'text-sl-alabaster' : 'text-sl-mist/40 group-hover:text-sl-mist/80'
              }`}
            >
              {chapter.title}
            </span>
            <span
              className={`h-px transition-all duration-500 ${
                isActive ? 'w-6 bg-sl-gold' : 'w-4 bg-sl-mist/30 group-hover:w-6 group-hover:bg-sl-mist/60'
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
