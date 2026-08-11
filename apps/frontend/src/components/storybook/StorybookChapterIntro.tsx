'use client';

import { ReactNode } from 'react';
import { OrnamentalRule, CornerFlourish, ChapterNumeral } from './BookOrnaments';

/**
 * StorybookChapterIntro — book-like chapter opening.
 *
 * Renders before the chapter content: a large translucent chapter numeral,
 * an ornamental rule, and the chapter title in book-style typography.
 * On low quality tiers or reduced motion, renders a simplified static version.
 */
export function StorybookChapterIntro({
  chapterNumber,
  chapterTitle,
  id,
  children,
}: {
  chapterNumber: number;
  chapterTitle: string;
  id?: string;
  children?: ReactNode;
}) {
  const containerId = id ?? `ch-${chapterNumber}`;

  return (
    <section
      id={containerId}
      className="storybook-page-padding page-shadow storybook-border relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(26,22,18,0.35) 0%, rgba(15,13,10,0.55) 100%)',
      }}
    >
      {/* Double border frame */}
      <div className="storybook-border absolute inset-0 pointer-events-none" />

      {/* Corner flourishes */}
      <CornerFlourish position="top-left" className="corner-flourish-tl" />
      <CornerFlourish position="top-right" className="corner-flourish-tr" />

      {/* Chapter opening: numeral + rule + title */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Large chapter numeral */}
        <div
          className="mb-8"
          aria-hidden="true"
        >
          <ChapterNumeral number={chapterNumber} />
        </div>

        {/* Ornamental rule */}
        <div className="mb-6" aria-hidden="true">
          <OrnamentalRule />
        </div>

        {/* Chapter title */}
        <h2
          id={`chapter-title-${chapterNumber}`}
          className="chapter-title mb-2"
        >
          {chapterTitle}
        </h2>

        {/* Secondary ornamental rule */}
        <div className="mb-12" aria-hidden="true">
          <OrnamentalRule />
        </div>

        {/* Chapter epigraph / description (optional) */}
        {children}
      </div>

      {/* Bottom ornamental double rule */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <OrnamentalRule />
      </div>

      {/* Subtle page-edge shadow (left side only, like a physical page) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.15) 0%, transparent 100%)',
        }}
      />
    </section>
  );
}
