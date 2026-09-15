'use client';

import { ChapterProgress, type Chapter } from '@/components/animation/ChapterProgress';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useScrollProgress } from '@/hooks/useScrollProgress';

// Anchors must match real section ids: hero `ch-vision`, work `work`,
// studio note `studio-note`. Phantom ids break the IntersectionObserver
// active-state tracking in ChapterProgress.
const HOME_CHAPTERS: Chapter[] = [
  { id: 'ch-vision', label: 'Vision' },
  { id: 'work', label: 'Work' },
  { id: 'studio-note', label: 'Studio' },
];

/**
 * NewHomeChapterRail — fixed right-edge chapter navigation for the homepage
 * using HEXA STUDIO design tokens.
 * Renders the shared ChapterProgress rail; itself a tiny client island
 * inside the RSC homepage.
 *
 * Depth: a faint ghost numeral column drifts behind the rail at roughly
 * half the page-scroll rate (parallax), so the foreground dots feel pinned
 * while the background breathes. Gated on the unified motion policy —
 * static when reduced motion is preferred, hidden on coarse pointers.
 */
export const NewHomeChapterRail = () => {
  const scrollProgress = useScrollProgress();
  const { finePointer, reducedMotion } = useMotionPolicy();

  // Half-rate drift across the full page: ±36px around centre.
  const drift = reducedMotion ? 0 : (scrollProgress - 0.5) * 72;

  return (
    <>
      {finePointer && (
        <ul
          aria-hidden="true"
          className="pointer-events-none fixed right-14 top-1/2 z-0 hidden -translate-y-1/2 select-none flex-col items-end gap-2 lg:flex"
          style={reducedMotion ? undefined : { transform: `translateY(calc(-50% + ${drift.toFixed(1)}px))` }}
        >
          {HOME_CHAPTERS.map((chapter, i) => (
            <li
              key={chapter.id}
              className="font-serif text-6xl font-light leading-none text-gold/[0.06]"
            >
              {String(i + 1).padStart(2, '0')}
            </li>
          ))}
        </ul>
      )}
      <ChapterProgress chapters={HOME_CHAPTERS} ariaLabel="Homepage chapters" className="sl-chapter-rail" />
    </>
  );
};
