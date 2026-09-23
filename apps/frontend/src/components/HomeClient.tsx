'use client';

import { NewHomeSections } from "@/features/portfolio/components/NewHomeSections";
import { NewHomeChapterRail } from "@/features/portfolio/components/NewHomeChapterRail";

/**
 * HomeClient — client-side composition of the homepage's below-fold interactive
 * layers (portfolio sections + chapter rail). The LCP-critical hero is now
 * server-rendered in `NewHomeHeroStatic`; this component is code-split and
 * streamed in only after first paint.
 *
 * @see ADR-019
 */
export function HomeClient() {
  return (
    <>
      {/* Below-the-fold sections (code-split) */}
      <NewHomeSections />

      {/* Chapter navigation rail (code-split) */}
      <NewHomeChapterRail />
    </>
  );
}
