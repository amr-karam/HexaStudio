import { HomeHero } from "@/features/portfolio";
import { ProjectGrid } from "@/features/portfolio/components/ProjectGrid";
import { StudioSection } from "@/features/portfolio/components/StudioSection";
import { TestimonialsSection } from "@/features/portfolio/components/TestimonialsSection";
import { AchievementsSection } from "@/features/portfolio/components/AchievementsSection";
import { CTASection } from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <AchievementsSection />
      <ProjectGrid />
      <TestimonialsSection />
      <StudioSection />
      <CTASection />
    </>
  );
}
