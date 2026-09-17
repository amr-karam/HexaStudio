'use client';

import dynamic from 'next/dynamic';
import { NewHomeHeroSkeleton } from "@/app/_loading/NewHomeHeroSkeleton";
import { NewHomeSections } from "@/features/portfolio/components/NewHomeSections";
import { NewHomeChapterRail } from "@/features/portfolio/components/NewHomeChapterRail";

/**
 * Defer the hero Canvas — it imports three + @react-three/fiber + framer-motion
 * and creates a WebGL context with 24 animated monoliths. Loading it with
 * ssr:false moves all of that work off the initial hydration commit, letting
 * the page paint the skeleton first and hydrate the canvas on idle.
 */
const DeferredHero = dynamic(
  () => import("@/features/portfolio/components/NewHomeHero").then(m => ({ default: m.NewHomeHero })),
  { ssr: false, loading: () => <NewHomeHeroSkeleton /> },
);

/**
 * HomeClient — client-side composition of the homepage's interactive layers.
 * Rendered via <Suspense> from the Server Component page so the SSR payload
 * stays minimal while the multi-MB hero canvas bundle loads after first paint.
 */
export function HomeClient() {
  return (
    <>
      {/* CH. I — VISION (canvas hero — deferred to reduce hydration TBT) */}
      <DeferredHero />

      {/* Below-the-fold sections (code-split) */}
      <NewHomeSections />

      {/* Chapter navigation rail (code-split) */}
      <NewHomeChapterRail />
    </>
  );
}