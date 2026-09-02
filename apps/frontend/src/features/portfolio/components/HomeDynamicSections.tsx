'use client';

import dynamic from 'next/dynamic';
import { FeatureCardsSection } from '@/features/portfolio/components/FeatureCardsSection';
import { StudioSection } from '@/features/portfolio/components/StudioSection';

// S-019: below-the-fold homepage sections are hydrated on the client only.
// This keeps the critical / page bundle (hero + rail) lean and pushes the
// heavy scroll-cinema / WebGL-adjacent JS into on-demand chunks, improving
// LCP and TBT without removing any animations.
const MarqueeBar = dynamic(
  () => import('@/features/portfolio/components/MarqueeBar').then((m) => m.MarqueeBar),
  { ssr: false },
);
const TestimonialsSection = dynamic(
  () => import('@/features/portfolio/components/TestimonialsSection').then((m) => m.TestimonialsSection),
  { ssr: false },
);
const CTASection = dynamic(
  () => import('@/components/CTASection').then((m) => m.CTASection),
  { ssr: false },
);

/**
 * HomeDynamicSections — renders the non-critical, client-only sections of the
 * homepage (marquee, features, testimonials, studio, cta) as dynamically imported
 * client islands. This component itself is a Client Component so that
 * next/dynamic with ssr:false is permitted.
 */
export function HomeDynamicSections() {
  return (
    <>
      <MarqueeBar />

      {/* Alternating left-right feature grid */}
      <div id="features" className="pt-20 sm:pt-24 md:pt-32">
        <FeatureCardsSection />
      </div>

      {/* Testimonials carousel */}
      <TestimonialsSection />

      {/* Studio features grid */}
      <StudioSection />

      {/* Final Call to Action */}
      <CTASection />
    </>
  );
}
