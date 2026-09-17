import type { Metadata } from 'next';
import { HomeHero } from "@/features/portfolio/components/HomeHero";
import { HomeChapterRail } from "@/features/portfolio/components/HomeChapterRail";
import { HomePageDynamic } from "@/features/portfolio/components/HomePageDynamic";
import { fetchProjects } from "@/features/portfolio/lib/fetchProjects";

/** ISR: 1h background refresh + on-demand via /api/revalidate (Sprint 15 P9). */
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Studio',
  description:
    'Experience the HexaStudio creative process — immersive 3D architectural visualization, cinematic walkthroughs, and spatial intelligence.',
  openGraph: {
    title: 'HexaStudio Studio — The Creative Process',
    description:
      'Immersive 3D architectural visualization, cinematic walkthroughs, and spatial intelligence.',
    url: 'https://hexastudio.net/studio',
    type: 'website',
    images: [
      {
        url: 'https://hexastudio.net/logo.svg',
        width: 1200,
        height: 630,
        alt: 'HexaStudio Studio — The Creative Process',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HexaStudio Studio — The Creative Process',
    description:
      'Immersive 3D architectural visualization, cinematic walkthroughs, and spatial intelligence.',
    images: ['https://hexastudio.net/logo.svg'],
  },
};

/**
 * Studio / Experience — the full 3D chaptered scroll film (Prompt 017).
 *
 *   CH. I   — VISION  → HomeHero (FractureRingHero 3D canvas)
 *   CH. II  — CRAFT   → MarqueeBar + FeaturedWork
 *   CH. III — METHOD  → ProcessSection + AchievementsSection
 *   CH. IV  — PROOF   → ProjectGrid + TestimonialsSection
 *   CH. V   — CONTACT → CTASection + NewsletterSection
 *
 * This page hosts the 3D architectural visualization experience that was
 * previously on the root homepage. Ambient WebGL background is active here.
 */
export default async function StudioPage() {
  const projectsData = await fetchProjects();

  return (
    <div className="bg-sl-void">
      <HomeChapterRail />
      <HomeHero />
      <main className="px-4 sm:px-8 md:px-16">
        <HomePageDynamic
        featuredProject={projectsData.projects?.[0]}
        projects={projectsData.projects ?? []}
      />
      </main>
    </div>
  );
}
