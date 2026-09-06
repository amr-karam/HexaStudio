'use client';

import dynamic from "next/dynamic";
import { NewHomeHeroSkeleton } from "@/app/_loading/NewHomeHeroSkeleton";

// Code-split the heavy client-side components (canvas hero with Three.js/R3F,
// Framer Motion, and the below-the-fold section blocks). They are rendered
// lazily via next/dynamic with a skeleton fallback. Since this file is a
// Client Component, next/dynamic works correctly with ssr:false behavior under
// Turbopack's App Router.
const NewHomeHero = dynamic(
  () =>
    import("@/features/portfolio/components/NewHomeHero").then(
      (m) => m.NewHomeHero,
    ),
  { ssr: false, loading: NewHomeHeroSkeleton },
);
const NewHomeSections = dynamic(
  () =>
    import("@/features/portfolio/components/NewHomeSections").then(
      (m) => m.NewHomeSections,
    ),
  { ssr: false },
);
const HomeChapterRail = dynamic(
  () =>
    import("@/features/portfolio/components/HomeChapterRail").then(
      (m) => m.HomeChapterRail,
    ),
  { ssr: false },
);

/**
 * HomeClient — client-side composition of the homepage's interactive layers.
 * Rendered via <Suspense> from the Server Component page so the SSR payload
 * stays minimal while the multi-MB canvas bundle loads after first paint.
 */
export function HomeClient() {
  return (
    <>
      {/* CH. I — VISION (canvas hero, code-split for TTI) */}
      <NewHomeHero />

      {/* Below-the-fold sections (code-split) */}
      <NewHomeSections />

      {/* Chapter navigation rail (code-split) */}
      <HomeChapterRail />
    </>
  );
}
