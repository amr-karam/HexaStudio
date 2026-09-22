'use client';

import dynamic from 'next/dynamic';
import { NewHomeHeroSkeleton } from "@/app/_loading/NewHomeHeroSkeleton";
import { NewHomeSections } from "@/features/portfolio/components/NewHomeSections";
import { NewHomeChapterRail } from "@/features/portfolio/components/NewHomeChapterRail";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";

/**
 * DeferredHero — the hero canvas is lazy-loaded with adaptive quality
 * based on device capabilities. On low-end devices, it falls back to
 * a lightweight static version to preserve performance.
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
  const { isLowEnd } = useDeviceCapabilities();

  return (
    <div data-device-tier={isLowEnd ? 'low' : 'standard'}>
      {/* CH. I — VISION (canvas hero — deferred to reduce hydration TBT) */}
      <DeferredHero />

      {/* Below-the-fold sections (code-split) */}
      <NewHomeSections />

      {/* Chapter navigation rail (code-split) */}
      <NewHomeChapterRail />
    </div>
  );
}
