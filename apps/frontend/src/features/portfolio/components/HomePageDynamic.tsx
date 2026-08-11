'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import type { Project } from '@hexastudio/types';
import { SectionReveal } from '@/components/scroll/SectionReveal';
import { StorybookChapter } from '@/components/storybook/StorybookChapter';
import { BookProgress } from '@/components/storybook/BookProgress';
import { OrnamentalRule } from '@/components/storybook/BookOrnaments';

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
 * Storybook chapter epigraph — a short italic excerpt or lead-in sentence
 * that appears between the chapter title and the main content.
 */
function ChapterEpigraph({ text }: { text: string }) {
  return (
    <blockquote className="mb-12 md:mb-16 text-center">
      <OrnamentalRule className="mb-6" />
      <p className="storybook-body italic" style={{ color: 'rgba(212, 175, 55, 0.65)' }}>
        {text}
      </p>
      <OrnamentalRule className="mt-6" />
    </blockquote>
  );
}

/**
 * Wraps a section's content in the storybook chapter aesthetic.
 * Placed inside SectionReveal so the scroll mechanics stay intact.
 */
function StorybookWrappedSection({
  chapterNumber,
  chapterTitle,
  epigraph,
  children,
  id,
}: {
  chapterNumber: number;
  chapterTitle: string;
  epigraph?: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <StorybookChapter chapterNumber={chapterNumber} chapterTitle={chapterTitle} id={id}>
      {epigraph && <ChapterEpigraph text={epigraph} />}
      <div className="storybook-body">
        {children}
      </div>
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
          epigraph="How a single vision becomes a rendered world — the disciplines, the tools, the hand."
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
          epigraph="From first sketch to final frame — the process that carries every project."
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
          epigraph="The work speaks — a selection of built and imagined worlds."
        >
          <ProjectGrid projects={projects} />
          <TestimonialsSection />
        </StorybookWrappedSection>
      </SectionReveal>

      {/* CH. V — CONTACT */}
      <div id="ch-contact">
        <StorybookChapter chapterNumber={5} chapterTitle="Contact" id="ch-contact">
          <ChapterEpigraph text="Where vision becomes conversation — the studio awaits." />
          <div className="storybook-body">
            <CTASection />
            <NewsletterSection />
          </div>
        </StorybookChapter>
      </div>

      <BookProgress />
    </>
  );
}
