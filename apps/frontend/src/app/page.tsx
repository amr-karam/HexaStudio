import { HomeHero } from "@/features/portfolio/components/HomeHero";
import { MarqueeBar } from "@/features/portfolio/components/MarqueeBar";
import { FeaturedWork } from "@/features/portfolio/components/FeaturedWork";
import { ProcessSection } from "@/features/portfolio/components/ProcessSection";
import { AchievementsSection } from "@/features/portfolio/components/AchievementsSection";
import { ProjectGrid } from "@/features/portfolio/components/ProjectGrid";
import { TestimonialsSection } from "@/features/portfolio/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { NewsletterSection } from "@/components/ui/NewsletterSection";
import { fetchProjects } from "@/features/portfolio/lib/fetchProjects";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const projectsData = await fetchProjects();

  return (
    <div className="bg-background">
      <HomeHero />
      <MarqueeBar />
      <FeaturedWork project={projectsData.projects?.[0]} />
      <ProcessSection />
      <AchievementsSection />
      <ProjectGrid projects={projectsData.projects ?? []} />
      <TestimonialsSection />
      <CTASection />
      <NewsletterSection />
    </div>
  );
}