import { HomeHero } from "@/features/portfolio/components/HomeHero";
import { MarqueeBar } from "@/features/portfolio/components/MarqueeBar";
import { FeaturedWork } from "@/features/portfolio/components/FeaturedWork";
import { ProcessSection } from "@/features/portfolio/components/ProcessSection";
import { AchievementsSection } from "@/features/portfolio/components/AchievementsSection";
import { ProjectGrid } from "@/features/portfolio/components/ProjectGrid";
import { TestimonialsSection } from "@/features/portfolio/components/TestimonialsSection";
import { HomeChapterRail } from "@/features/portfolio/components/HomeChapterRail";
import { SectionReveal } from "@/components/scroll/SectionReveal";
import { CTASection } from "@/components/CTASection";
import { NewsletterSection } from "@/components/ui/NewsletterSection";
import { fetchProjects } from "@/features/portfolio/lib/fetchProjects";

export const dynamic = 'force-dynamic';

/**
 * Homepage — the chaptered scroll film (Prompt 017).
 *
 *   CH. I   — VISION  → HomeHero
 *   CH. II  — CRAFT   → MarqueeBar + FeaturedWork
 *   CH. III — METHOD  → ProcessSection + AchievementsSection
 *   CH. IV  — PROOF   → ProjectGrid + TestimonialsSection
 *   CH. V   — CONTACT → CTASection + NewsletterSection
 *
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
      <HomeHero />
      <MarqueeBar />
      <SectionReveal>
        <div id="ch-craft">
          <FeaturedWork project={projectsData.projects?.[0]} />
        </div>
      </SectionReveal>
      <SectionReveal>
        <div id="ch-method">
          <ProcessSection />
          <AchievementsSection />
        </div>
      </SectionReveal>
      <SectionReveal>
        <div id="ch-proof">
          <ProjectGrid projects={projectsData.projects ?? []} />
          <TestimonialsSection />
        </div>
      </SectionReveal>
      <div id="ch-contact">
        <CTASection />
        <NewsletterSection />
      </div>
    </div>
  );
}
