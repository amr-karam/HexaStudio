'use client';

import dynamic from 'next/dynamic';
import { VisionChapter } from './VisionChapter';
import { CraftChapter } from './CraftChapter';
import { NewStudioNote } from './NewStudioNote';
import { InvitationChapter } from './InvitationChapter';

// Lazy-load the heavy SelectedWork gallery to keep initial bundle lean
const NewSelectedWork = dynamic(
  () => import('./NewSelectedWork').then((m) => m.NewSelectedWork),
  { ssr: false },
);

/**
 * NewHomeSections — the storytelling below-the-fold stack.
 *
 * Narrative arc:
 *  1. VisionChapter      — Philosophy (light, material, atmosphere)
 *  2. CraftChapter       — Process (5-step pipeline with measured data)
 *  3. NewSelectedWork    — Portfolio (editorial 2x2 grid)
 *  4. NewStudioNote      — Studio voice (quote + stats)
 *  5. InvitationChapter  — Cinematic CTA
 */
export function NewHomeSections() {
  return (
    <>
      <VisionChapter />
      <CraftChapter />
      <NewSelectedWork />
      <NewStudioNote />
      <InvitationChapter />
    </>
  );
}
