'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import type { Project } from '@hexastudio/types';
import { SectionReveal } from '@/components/scroll/SectionReveal';
import { StorybookChapter } from '@/components/storybook/StorybookChapter';
import { BookProgress } from '@/components/storybook/BookProgress';

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

/**
 * Wraps a section's content in the storybook chapter aesthetic.
 * Placed inside SectionReveal so the scroll mechanics stay intact.
 */
function StorybookWrappedSection({
  chapterNumber,
  chapterTitle,
  children,
  id,
}: {
  chapterNumber: number;
  chapterTitle: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <StorybookChapter chapterNumber={chapterNumber} chapterTitle={chapterTitle} id={id}>
      {children}
    </StorybookChapter>
  );
}

export function HomePageDynamic({ featuredProject, projects }: HomePageDynamicProps) {
  return (
    <>
      <MarqueeBar />

      {/* CH. II — CRAFT */}
      <SectionReveal>
        <StorybookWrappedSection
          chapterNumber={2}
          chapterTitle="Craft"
          id="ch-craft"
        >
          <FeaturedWork project={featuredProject} />
        </StorybookWrappedSection>
      </SectionReveal>

      {/* CH. III — METHOD */}
      <SectionReveal>
        <StorybookWrappedSection
          chapterNumber={3}
          chapterTitle="Method"
          id="ch-method"
        >
          <ProcessSection />
          <AchievementsSection />
        </StorybookWrappedSection>
      </SectionReveal>

      {/* CH. IV — PROOF */}
      <SectionReveal>
        <StorybookWrappedSection
          chapterNumber={4}
          chapterTitle="Proof"
          id="ch-proof"
        >
          <ProjectGrid projects={projects} />
          <TestimonialsSection />
        </StorybookWrappedSection>
      </SectionReveal>

      {/* CH. V — CONTACT */}
      <div id="ch-contact">
        <StorybookChapter chapterNumber={5} chapterTitle="Contact" id="ch-contact">
          <CTASection />
          <NewsletterSection />
        </StorybookChapter>
      </div>

      <BookProgress />
    </>
  );
}
