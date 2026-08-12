import { HomeHeroStatic } from "@/features/portfolio/components/HomeHeroStatic";
import { HomeChapterRail } from "@/features/portfolio/components/HomeChapterRail";
import { HomePageDynamic } from "@/features/portfolio/components/HomePageDynamic";
import { StudioSection } from "@/features/portfolio/components/StudioSection";
import { fetchProjects } from "@/features/portfolio/lib/fetchProjects";

/** ISR: 1h background refresh + on-demand via /api/revalidate (Sprint 15 P9).
    * Pages prerender at build (gracefully empty when backend is down); deploy
    * script pings /api/revalidate to fill with live content within seconds. */
export const revalidate = 3600;

/**
 * Homepage — the chaptered scroll film (Prompt 017), static variant.
 *
 *   CH. I   — VISION  → HomeHeroStatic (no 3D canvas)
 *   CH. II  — CRAFT   → MarqueeBar + FeaturedWork
 *   CH. III — METHOD  → ProcessSection + AchievementsSection
 *   CH. IV  — PROOF   → ProjectGrid + TestimonialsSection
 *   CH. V   — CONTACT → CTASection + NewsletterSection
 *
 * The 3D visualization experience lives at /studio.
 * SectionReveal wraps each chapter so the next sibling slides over it
 * (pasqua.it / agencidev.com sticky-stack DNA). Server component
 * composition is unchanged: every animated piece is a client island;
 * fetchProjects stays server-side.
 */
export default async function HomePage() {
  const projectsData = await fetchProjects();

  return (
    <div className="bg-background">
      <HomeChapterRail />
      <HomeHeroStatic />
      <HomePageDynamic
        featuredProject={projectsData.projects?.[0]}
        projects={projectsData.projects ?? []}
      />
      <StudioSection />
    </div>
  );
}
