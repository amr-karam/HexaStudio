'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import type { Project } from '@hexastudio/types';
import { Button } from '@/components/ui/Button';
import { ChapterMarker } from '@/components/animation/ChapterMarker';
import { AnimatedCounter } from '@/components/animation/AnimatedCounter';
import { LazyProjectSceneWrapper } from '@/features/portfolio/components/LazyProjectSceneWrapper';
import { ProjectChapterRail } from '@/features/portfolio/components/ProjectChapterRail';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { getGsap } from '@/lib/gsap';


/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ProjectScrollCinemaProps {
  project: Project;
  nextProject?: Project | null;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Derive a numeric "year" from createdAt for display. */
function toYear(dateStr: string): string {
  return new Date(dateStr).getFullYear().toString();
}

/** Parse services string array into displayable stats. */
function projectStats(project: Project) {
  return [
    { label: 'Client', value: project.client ?? 'Confidential' },
    { label: 'Year', value: project.year?.toString() ?? toYear(project.createdAt) },
    { label: 'Services', value: project.services?.join(', ') ?? 'Architectural Visualization' },
    { label: 'Status', value: project.status ?? 'Completed' },
    { label: 'Area', value: project.area ?? '—' },
    { label: 'Location', value: project.location ?? '—' },
  ].filter((s) => s.value !== '—');
}

/* -------------------------------------------------------------------------- */
/*  Chapter: 01 — HERO                                                        */
/* -------------------------------------------------------------------------- */

function ChapterHero({ project }: { project: Project }) {
  const { staticMode } = useMotionPolicy();
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      id="ch-hero"
      ref={ref}
      className="relative h-screen w-full overflow-hidden bg-obsidian"
    >
      {/* 3D scene or cover image */}
      {project.modelUrl ? (
        <LazyProjectSceneWrapper project={project} />
      ) : (
        <div className="absolute inset-0">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            priority
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGAExecuteX7pAAAAAElFTkSuQmCC"
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/20 via-transparent to-background" />
        </div>
      )}

      {/* Chapter marker + title overlay */}
      <div className="relative h-full flex flex-col justify-end p-8 md:p-16 pb-24 pointer-events-none">
        <ChapterMarker index={1} title="Hero" className="mb-6" />
        <motion.span
          initial={staticMode ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs uppercase tracking-[0.5em] text-accent mb-6 block font-mono"
        >
          {project.category?.name}
        </motion.span>
        <motion.h1
          initial={staticMode ? { opacity: 1 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-foreground leading-tight"
        >
          {project.title}
        </motion.h1>
      </div>

      {/* Scroll affordance */}
      <motion.div
        initial={staticMode ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-mono">
          Scroll to explore
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-accent/60 to-transparent" />
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter: 02 — BRIEF (editorial metadata — bdsn.club DNA)                 */
/* -------------------------------------------------------------------------- */

function ChapterBrief({ project }: { project: Project }) {
  const { staticMode } = useMotionPolicy();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const stats = projectStats(project);

  return (
    <section
      id="ch-brief"
      className="relative min-h-screen w-full bg-background py-32 px-8 md:px-16"
    >
      <div ref={ref} className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-[1400px] mx-auto">
        {/* Left: editorial index + description */}
        <div className="lg:col-span-7 space-y-12">
          <ChapterMarker index={2} title="Brief" className="mb-8" />

          {/* Oversized index numeral (bdn DNA) */}
          <motion.div
            initial={staticMode ? { opacity: 1 } : { opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[120px] md:text-[200px] leading-none text-accent/10 font-light select-none pointer-events-none"
            aria-hidden="true"
          >
            02
          </motion.div>

          <motion.p
            initial={staticMode ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-neutral-400 font-light leading-relaxed max-w-2xl"
          >
            {project.description}
          </motion.p>
        </div>

        {/* Right: metadata rows with stagger (bdn DNA) */}
        <div className="lg:col-span-5">
          <div className="bg-surface border border-border/50 p-8 md:p-10 rounded-sm">
            <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-8 font-mono">
              Project Details
            </h3>
            <div className="space-y-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={staticMode ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + i * 0.08, // 80ms stagger per row
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex justify-between items-baseline border-b border-border/30 pb-4 last:border-0"
                >
                  <span className="text-[10px] uppercase text-neutral-600 tracking-widest font-mono">
                    {stat.label}
                  </span>
                  <span className="text-sm text-foreground font-light text-right max-w-[60%]">
                    {stat.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter: 03 — EXPERIENCE (pinned 3D scrub — scoutmotors + theirisk DNA)   */
/* -------------------------------------------------------------------------- */

function ChapterExperience({ project }: { project: Project }) {
  const { staticMode } = useMotionPolicy();
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (staticMode) return;
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    let cancelled = false;
    let ctx: { revert: () => void } | null = null;

    void (async () => {
      const [gsap, scrollTriggerModule] = await Promise.all([
        getGsap(),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      const { ScrollTrigger } = scrollTriggerModule;

      ctx = gsap.context(() => {
        // Pin the 3D viewport while the user scrubs through it.
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=150%', // 1.5× viewport of scrub distance
          pin: pin,
          pinSpacing: false,
          anticipatePin: 1,
        });

        // Subtle scale pulse on the pinned content as scrub progresses.
        gsap.fromTo(
          pin,
          { scale: 1 },
          {
            scale: 1.02,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: '+=150%',
              scrub: 1,
            },
          },
        );
      }, section);

      // Refresh after fonts settle.
      if (document.fonts?.ready) {
        void document.fonts.ready
          .then(() => ScrollTrigger.refresh())
          .catch(() => undefined);
      }
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [staticMode]);

  return (
    <section
      id="ch-experience"
      ref={sectionRef}
      className="relative w-full bg-obsidian"
      style={{ minHeight: '250vh' }} // extra height for scrub range
    >
      <div ref={pinRef} className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D scene fills the pinned viewport */}
        <LazyProjectSceneWrapper project={project} />

        {/* Overlay: chapter marker + scrub indicator */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16">
          <ChapterMarker index={3} title="Experience" />
          <div className="flex justify-between items-end">
            <motion.p
              initial={staticMode ? { opacity: 1 } : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-mono"
            >
              Drag to explore the model
            </motion.p>
            <div className="w-px h-16 bg-gradient-to-b from-accent/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter: 04 — DETAILS (specs grid + counters — animejs DNA)              */
/* -------------------------------------------------------------------------- */

function ChapterDetails({ project }: { project: Project }) {
  const { staticMode } = useMotionPolicy();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const counters = [
    { value: project.milestones?.total ?? 12, label: 'Milestones' },
    { value: project.milestones?.completed ?? 8, label: 'Delivered' },
    { value: project.services?.length ?? 3, label: 'Disciplines' },
  ];

  return (
    <section
      id="ch-details"
      className="relative min-h-screen w-full bg-background py-32 px-8 md:px-16"
    >
      <div ref={ref} className="max-w-[1400px] mx-auto">
        <ChapterMarker index={4} title="Details" className="mb-16" />

        {/* Oversized index numeral */}
        <motion.div
          initial={staticMode ? { opacity: 1 } : { opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-[120px] md:text-[200px] leading-none text-accent/10 font-light select-none pointer-events-none mb-16"
          aria-hidden="true"
        >
          04
        </motion.div>

        {/* Counter grid (animejs stagger DNA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          {counters.map((c, i) => (
            <motion.div
              key={c.label}
              initial={staticMode ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.2 + i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-center"
            >
              <div className="text-5xl md:text-7xl font-serif font-light text-accent mb-4">
                <AnimatedCounter value={c.value} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-mono">
                {c.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Live status from Odoo (if available) */}
        {project.liveStatus && (
          <motion.div
            initial={staticMode ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-surface border border-border/50 p-8 rounded-sm max-w-2xl"
          >
            <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-4 font-mono">
              Live Project Status
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-foreground font-light">
                {project.liveStatus.stage}
              </span>
              <span className="text-xs text-accent font-mono">
                {project.liveStatus.progress}%
              </span>
            </div>
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-1000"
                style={{ width: `${project.liveStatus.progress}%` }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter: 05 — NEXT (next project + progress ring — raven DNA)            */
/* -------------------------------------------------------------------------- */

function ChapterNext({ project: _project, nextProject }: { project: Project; nextProject?: Project | null }) {
  const { staticMode } = useMotionPolicy();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="ch-next"
      className="relative min-h-screen w-full bg-background py-32 px-8 md:px-16 flex items-center"
    >
      <div ref={ref} className="max-w-[1400px] mx-auto w-full">
        <ChapterMarker index={5} title="Next" className="mb-16" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* CTA side */}
          <motion.div
            initial={staticMode ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 font-mono block">
              Like What You See?
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-foreground leading-tight">
              Let&apos;s Create Something{' '}
              <span className="italic text-accent">Extraordinary</span>
            </h2>
            <p className="text-neutral-400 font-light leading-relaxed max-w-lg">
              Every project starts with a conversation. Tell us about your vision
              and we&apos;ll bring it to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button variant="primary" size="lg" className="group">
                  Start a Project
                  <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="outline" size="lg">
                  More Projects
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Next project card (raven DNA) */}
          {nextProject && (
            <motion.div
              initial={staticMode ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/projects/${nextProject.slug}`}
                className="group block relative overflow-hidden rounded-sm"
              >
                <div className="aspect-[16/10] relative">
                  <Image
                    src={nextProject.coverImage}
                    alt={nextProject.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                  {/* Progress ring on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-neutral-700"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-accent stroke-dasharray-[226] stroke-dashoffset-[226] group-hover:stroke-dashoffset-[0] transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <span className="absolute text-xs uppercase tracking-widest text-white font-mono">
                      Next
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-accent font-mono block mb-2">
                    Next Project
                  </span>
                  <h3 className="text-2xl font-serif font-light text-foreground group-hover:text-accent transition-colors duration-500">
                    {nextProject.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Orchestrator                                                         */
/* -------------------------------------------------------------------------- */

export function ProjectScrollCinema({ project, nextProject }: ProjectScrollCinemaProps) {
  return (
    <>
      <ProjectChapterRail />
      <ChapterHero project={project} />
      <ChapterBrief project={project} />
      <ChapterExperience project={project} />
      <ChapterDetails project={project} />
      <ChapterNext project={project} nextProject={nextProject} />
    </>
  );
}
