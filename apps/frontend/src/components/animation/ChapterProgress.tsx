'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

export interface Chapter {
  /** DOM id of the section this dot scrolls to (without the leading '#'). */
  id: string;
  /** Accessible label for the chapter (e.g. "Vision"). */
  label: string;
}

interface ChapterProgressProps {
  chapters: Chapter[];
  className?: string;
  /** Accessible name for the navigation landmark. */
  ariaLabel?: string;
}

/**
 * ChapterProgress — fixed right-edge chapter rail with numbered dots.
 *
 * Decoded from raven-trading.com / staratlas.com (Prompt 017 — Scroll
 * Cinema): a side pagination rail (01–0N) that tracks the active full-height
 * section and lets the user jump between chapters.
 *
 * Accessibility & policy:
 * - Real `<nav>` landmark; each dot is a labelled `<button>` with a visible
 *   focus ring and `aria-current` on the active chapter.
 * - Uses IntersectionObserver to track the active section (disconnected on
 *   unmount). No scroll RAF, no pointer dependency.
 * - Click scrolls via Lenis when smooth scroll is active, else native
 *   `scrollIntoView`; honours reduced motion by jumping instantly.
 * - Hidden on touch/coarse pointers and small viewports (decorative nav;
 *   content order is unaffected).
 */
export const ChapterProgress = ({
  chapters,
  className,
  ariaLabel = 'Page chapters',
}: ChapterProgressProps) => {
  const { finePointer, reducedMotion } = useMotionPolicy();
  const [activeId, setActiveId] = useState<string>(chapters[0]?.id ?? '');

  useEffect(() => {
    if (chapters.length === 0) return;

    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Choose the most visible intersecting section as active.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [chapters]);

  const handleJump = useCallback(
    (id: string) => {
      const target = document.getElementById(id);
      if (!target) return;

      const lenis = window.__lenis;
      if (lenis) {
        lenis.scrollTo(target, { immediate: reducedMotion });
      } else {
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
      setActiveId(id);
    },
    [reducedMotion],
  );

  // Rail is a pointer affordance; hide where there is no hover and on small
  // screens. Content remains fully reachable via normal scroll + skip links.
  if (!finePointer || chapters.length === 0) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex',
        className,
      )}
    >
      {chapters.map((chapter, i) => {
        const isActive = chapter.id === activeId;
        return (
          <button
            key={chapter.id}
            type="button"
            onClick={() => handleJump(chapter.id)}
            aria-current={isActive ? 'true' : undefined}
            aria-label={`${String(i + 1).padStart(2, '0')} — ${chapter.label}`}
            className="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span
              className={cn(
                'font-mono text-[10px] tracking-[0.3em] transition-all duration-500',
                isActive
                  ? 'text-accent opacity-100'
                  : 'text-neutral-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={cn(
                'block h-px transition-all duration-500',
                isActive
                  ? 'w-8 bg-accent'
                  : 'w-4 bg-neutral-600 group-hover:w-6 group-hover:bg-neutral-400',
              )}
            />
          </button>
        );
      })}
    </nav>
  );
};
