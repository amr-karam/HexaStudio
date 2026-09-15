'use client';

import { NewHomeHero } from "@/features/portfolio/components/NewHomeHero";
import { NewHomeSections } from "@/features/portfolio/components/NewHomeSections";
import { NewHomeChapterRail } from "@/features/portfolio/components/NewHomeChapterRail";

/**
 * HomeClient — client-side composition of the homepage's interactive layers.
 * Rendered via <Suspense> from the Server Component page so the SSR payload
 * stays minimal while the multi-MB hero canvas bundle loads after first paint.
 */
export function HomeClient() {
  return (
    <>
      {/* CH. I — VISION (canvas hero with golden-ratio monolith spiral) */}
      <NewHomeHero />

      {/* Below-the-fold sections (code-split) */}
      <NewHomeSections />

      {/* Chapter navigation rail (code-split) */}
      <NewHomeChapterRail />
    </>
  );
}