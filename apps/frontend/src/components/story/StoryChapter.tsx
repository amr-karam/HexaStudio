'use client';

import { ReactNode } from 'react';
import { ChapterHeading } from '@/components/scroll/ChapterHeading';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';

interface StoryChapterProps {
  /** 1-based chapter number (rendered as roman numeral). */
  index: number;
  /** Chapter name for the marker — e.g. "Craft". */
  chapter: string;
  /** Mono kicker above the title — e.g. "Our Process". */
  kicker?: string;
  /** Chapter heading text. */
  title: string;
  /** Words inside `title` rendered italic gold. */
  accentWords?: string[];
  /** Supporting line under the title. */
  description?: string;
  /** Chapter content — rendered with scroll-triggered fade-in. */
  children: ReactNode;
  /** Additional class for the chapter root. */
  className?: string;
  /** Background variant. */
  variant?: 'void' | 'obsidian' | 'void-alt';
}

const VARIANT_CLASSES: Record<string, string> = {
  void: 'bg-sl-void',
  obsidian: 'bg-sl-obsidian',
  'void-alt': 'bg-sl-void',
};

/**
 * StoryChapter — standard chapter wrapper for the cinematic scroll film.
 *
 * Composes:
 * - `ChapterHeading` for the kinetic title + marker + hairline
 * - `ScrollFadeIn` for content reveals
 * - Gold top/bottom hairlines for chapter separation
 */
export function StoryChapter({
  index,
  chapter,
  kicker,
  title,
  accentWords = [],
  description,
  children,
  className,
  variant = 'void',
}: StoryChapterProps) {
  return (
    <section className={cn('relative cv-section', VARIANT_CLASSES[variant], className)}>
      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />

      <div className="mx-auto max-w-[1600px] px-6 py-24 sm:px-10 md:px-16 md:py-32 lg:py-40">
        {/* Chapter heading */}
        <ChapterHeading
          index={index}
          chapter={chapter}
          kicker={kicker}
          title={title}
          accentWords={accentWords}
          description={description}
        />

        {/* Chapter content — scroll-triggered reveal */}
        <ScrollFadeIn delay={0.15}>
          <div className="mt-16 md:mt-24">
            {children}
          </div>
        </ScrollFadeIn>
      </div>

      {/* Bottom hairline */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />
    </section>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
