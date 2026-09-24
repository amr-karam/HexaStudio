'use client';

import dynamic from 'next/dynamic';
import { SectionReveal } from '@/components/scroll/SectionReveal';
import { VisionChapter } from '@/features/portfolio/components/VisionChapter';
import { CraftChapter } from '@/features/portfolio/components/CraftChapter';
import { NewStudioNote } from '@/features/portfolio/components/NewStudioNote';
import { InvitationChapter } from '@/features/portfolio/components/InvitationChapter';
import { NewHomeChapterRail } from '@/features/portfolio/components/NewHomeChapterRail';

// Lazy-load the heavy SelectedWork gallery to keep initial bundle lean
const NewSelectedWork = dynamic(
  () => import('@/features/portfolio/components/NewSelectedWork').then((m) => m.NewSelectedWork),
  { ssr: false },
);

/**
 * HomeClient — client-side composition of the homepage's below-fold interactive
 * layers with pinned chapter transitions (SectionReveal). The LCP-critical hero
 * is server-rendered in `NewHomeHeroStatic`; this component is code-split and
 * streamed in only after first paint.
 *
 * Chapter flow (each wrapped in SectionReveal for pasqua.it-style hand-off):
 *  1. VisionChapter      — Philosophy
 *  2. CraftChapter       — Process
 *  3. NewSelectedWork    — Portfolio showcase
 *  4. NewStudioNote      — Studio voice
 *  5. InvitationChapter  — Cinematic CTA (terminal, no pin needed)
 *
 * @see ADR-019
 */
export function HomeClient() {
  return (
    <>
      {/* Chapter 01: Vision — pins while Craft covers it */}
      <SectionReveal distance={1}>
        <VisionChapter />
      </SectionReveal>

      {/* Chapter 02: Craft — pins while SelectedWork covers it */}
      <SectionReveal distance={1}>
        <CraftChapter />
      </SectionReveal>

      {/* Chapter 03: The Work — pins while StudioNote covers it */}
      <SectionReveal distance={1}>
        <NewSelectedWork />
      </SectionReveal>

      {/* Chapter 04: Studio Note — pins while Invitation covers it */}
      <SectionReveal distance={1}>
        <NewStudioNote />
      </SectionReveal>

      {/* Chapter 05: Invitation — terminal chapter, no pin needed */}
      <InvitationChapter />

      {/* Chapter navigation rail (code-split) */}
      <NewHomeChapterRail />
    </>
  );
}