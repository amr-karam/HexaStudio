import { HomeHero } from "@/features/portfolio/components/HomeHero";
import { HomeChapterRail } from "@/features/portfolio/components/HomeChapterRail";
import { HomePageDynamic } from "@/features/portfolio/components/HomePageDynamic";
import { fetchProjects } from "@/features/portfolio/lib/fetchProjects";

/** ISR: 1h background refresh + on-demand via /api/revalidate (Sprint 15 P9). */
export const revalidate = 3600;

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
    <div className="bg-background">
      <HomeChapterRail />
      <HomeHero />
      <HomePageDynamic
        featuredProject={projectsData.projects?.[0]}
        projects={projectsData.projects ?? []}
      />
    </div>
  );
}
