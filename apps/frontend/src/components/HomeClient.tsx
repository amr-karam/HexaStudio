'use client';

import dynamic from "next/dynamic";
import { NewHomeHeroSkeleton } from "@/app/_loading/NewHomeHeroSkeleton";

// Code-split the heavy client-side components (canvas hero with the golden-ratio
// monolith spiral, Framer Motion scroll animations, and the below-the-fold
// section blocks). They are rendered lazily via next/dynamic with a skeleton
// fallback. Since this file is a Client Component, next/dynamic works correctly
// with ssr:false behavior under Turbopack's App Router.
const HomeHero = dynamic(
  () =>
    import("@/features/portfolio/components/HomeHero").then(
      (m) => m.HomeHero,
    ),
  { ssr: false, loading: NewHomeHeroSkeleton },
);
const HomeSections = dynamic(
  () =>
    import("@/features/portfolio/components/HomeSections").then(
      (m) => m.HomeSections,
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
 * stays minimal while the multi-MB hero canvas bundle loads after first paint.
 */
export function HomeClient() {
  return (
    <>
      {/* CH. I — VISION (canvas hero with golden-ratio monolith spiral) */}
      <HomeHero />

      {/* Below-the-fold sections (code-split) */}
      <HomeSections />

      {/* Chapter navigation rail (code-split) */}
      <HomeChapterRail />
    </>
  );
}