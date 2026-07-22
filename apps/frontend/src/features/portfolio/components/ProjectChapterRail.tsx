'use client';

import { ChapterProgress, type Chapter } from '@/components/animation/ChapterProgress';

/**
 * Fixed chapter mapping for project detail scroll cinema (Prompt 017 §F4).
 * Mirrors the raven-trading.com side pagination dots (01–05).
 */
const PROJECT_CHAPTERS: Chapter[] = [
  { id: 'ch-hero', label: 'Hero' },
  { id: 'ch-brief', label: 'Brief' },
  { id: 'ch-experience', label: 'Experience' },
  { id: 'ch-details', label: 'Details' },
  { id: 'ch-next', label: 'Next' },
];

/**
 * ProjectChapterRail — fixed right-edge chapter navigation for the project
 * detail scroll film (01–05 dots + hairlines), per Prompt 017 §F4.
 * Renders the shared ChapterProgress rail; itself a tiny client island
 * inside the RSC project detail page.
 */
export const ProjectChapterRail = () => (
  <ChapterProgress chapters={PROJECT_CHAPTERS} ariaLabel="Case study chapters" />
);
