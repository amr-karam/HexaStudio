'use client';

import dynamic from 'next/dynamic';
import { StoryChapter } from '@/components/story/StoryChapter';
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
      {/* Ch. 01 — Vision */}
      <StoryChapter
        index={1}
        chapter="Vision"
        kicker="Philosophy"
        title="We design for the moment of recognition"
        accentWords={['moment of recognition']}
        description="When a space stops being a rendering and starts being a memory."
        variant="void"
        showNextPeek
        nextChapterLabel="Ch. 02 / Craft"
        id="vision"
      >
        <VisionChapter />
      </StoryChapter>

      {/* Ch. 02 — Craft */}
      <StoryChapter
        index={2}
        chapter="Craft"
        kicker="Process"
        title="How We Create"
        accentWords={['Create']}
        description="From first sketch to final render, every project follows a proven workflow."
        variant="obsidian"
        showNextPeek
        nextChapterLabel="Ch. 03 / Portfolio"
        id="craft"
      >
        <CraftChapter />
      </StoryChapter>

      {/* Ch. 03 — Portfolio */}
      <StoryChapter
        index={3}
        chapter="Portfolio"
        kicker="Selected Work"
        title="Four rooms, four worlds"
        accentWords={['four worlds']}
        description="A curated selection of recent work across residential, cultural, and hospitality."
        variant="void"
        showNextPeek
        nextChapterLabel="Ch. 04 / Studio"
        id="work"
      >
        <NewSelectedWork />
      </StoryChapter>

      {/* Ch. 04 — Studio Note */}
      <StoryChapter
        index={4}
        chapter="Studio"
        kicker="Studio Note"
        title="We do not render buildings"
        accentWords={['the moment']}
        description="A small studio in Cairo and Dubai. Twenty-two projects shipped in 2025."
        variant="obsidian"
        showNextPeek
        nextChapterLabel="Ch. 05 / Begin"
        id="studio-note"
      >
        <NewStudioNote />
      </StoryChapter>

      {/* Ch. 05 — Invitation */}
      <StoryChapter
        index={5}
        chapter="Next"
        kicker="Begin"
        title="Ready to build something that has never been seen?"
        accentWords={['never been seen']}
        variant="void"
        id="invitation"
      >
        <InvitationChapter />
      </StoryChapter>
    </>
  );
}
