'use client';

import { ChapterProgress, type Chapter } from '@/components/animation/ChapterProgress';

const HOME_CHAPTERS: Chapter[] = [
  { id: 'ch-vision', label: 'Vision' },
  { id: 'ch-work', label: 'Work' },
  { id: 'ch-process', label: 'Process' },
  { id: 'ch-method', label: 'Method' },
  { id: 'ch-contact', label: 'Contact' },
];

/**
 * HomeChapterRail — fixed right-edge chapter navigation for the homepage
 * scroll film (01–05 dots + hairlines).
 * Renders the shared ChapterProgress rail; itself a tiny client island
 * inside the RSC homepage.
 */
export const HomeChapterRail = () => (
  <ChapterProgress chapters={HOME_CHAPTERS} ariaLabel="Homepage chapters" />
);
