'use client';

import dynamic from 'next/dynamic';
import type { Project } from '@hexastudio/types';
import { SectionReveal } from '@/components/scroll/SectionReveal';

// S-019: below-the-fold homepage sections are hydrated on the client only.
// This keeps the critical / page bundle (hero + rail) lean and pushes the
// heavy scroll-cinema / WebGL-adjacent JS into on-demand chunks, improving
// LCP and TBT without removing any animations.
const MarqueeBar = dynamic(
  () => import('@/features/portfolio/components/MarqueeBar').then((m) => m.MarqueeBar),
  { ssr: false },
);
const FeaturedWork = dynamic(
  () => import('@/features/portfolio/components/FeaturedWork').then((m) => m.FeaturedWork),
  { ssr: false },
);
const ProcessSection = dynamic(
  () => import('@/features/portfolio/components/ProcessSection').then((m) => m.ProcessSection),
  { ssr: false },
);
const AchievementsSection = dynamic(
  () => import('@/features/portfolio/components/AchievementsSection').then((m) => m.AchievementsSection),
  { ssr: false },
);
const ProjectGrid = dynamic(
  () => import('@/features/portfolio/components/ProjectGrid').then((m) => m.ProjectGrid),
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
const NewsletterSection = dynamic(
  () => import('@/components/ui/NewsletterSection').then((m) => m.NewsletterSection),
  { ssr: false },
);

interface HomePageDynamicProps {
  featuredProject?: Project;
  projects: Project[];
}

export function HomePageDynamic({ featuredProject, projects }: HomePageDynamicProps) {
  return (
    <>
      <MarqueeBar />
      <SectionReveal>
        <div id="ch-craft">
          <FeaturedWork project={featuredProject} />
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
          <ProjectGrid projects={projects} />
          <TestimonialsSection />
        </div>
      </SectionReveal>
      <div id="ch-contact">
        <CTASection />
        <NewsletterSection />
      </div>
    </>
  );
}
