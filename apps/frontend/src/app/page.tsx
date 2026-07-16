import { FloatingCardsHero } from "@/components/animation";
import { ProjectGrid } from "@/features/portfolio/components/ProjectGrid";
import { StudioSection } from "@/features/portfolio/components/StudioSection";
import { TestimonialsSection } from "@/features/portfolio/components/TestimonialsSection";
import { AchievementsSection } from "@/features/portfolio/components/AchievementsSection";
import { CTASection } from "@/components/CTASection";
import { NewsletterSection } from "@/components/ui/NewsletterSection";
import { fetchProjects } from "@/features/portfolio/lib/fetchProjects";

export default async function HomePage() {
  const projectsData = await fetchProjects();

  return (
    <div className="bg-background">
      <FloatingCardsHero
        headline="Living"
        highlight="Spaces."
        subline="Visualized. Immersive 3D architectural experiences for the world's most ambitious projects."
        ctaLabel="Explore Works"
        ctaHref="/portfolio"
      />
      <AchievementsSection />
      <ProjectGrid projects={projectsData.projects ?? []} />
      <TestimonialsSection />
      <StudioSection />
      <CTASection />
      <NewsletterSection />
    </div>
  );
}