'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@hexastudio/types';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { ChapterMarker } from '@/components/animation/ChapterMarker';
import { KineticTitle } from '@/components/scroll/KineticTitle';
import { getGsap } from '@/lib/gsap';
import { onIdle } from '@/lib/idle';
import { EASE, DURATION } from '@/lib/motion';
import { GSAP_EASING } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/hooks';
import { useQualityTier } from '@/providers/quality-provider';

interface FeaturedWorkProps {
  /** The project to feature. When omitted, a curated fallback is rendered. */
  project?: Project;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80';

interface FeaturedContent {
  titleLead: string;
  titleAccent: string;
  description: string;
  imageUrl: string;
  meta: string[];
  href: string;
}

/**
 * Resolves the display content from a real Project, falling back to the
 * curated "Lumina Pavilion" showcase when no project is available so the
 * section never renders broken on an empty feed.
 */
function resolveContent(project?: Project): FeaturedContent {
  if (!project) {
    return {
      titleLead: 'Lumina',
      titleAccent: 'Pavilion',
      description:
        'A translucent commercial pavilion that appears to float above its waterfront site. ETFE cushions and precision steel form a crystalline envelope that refracts sunlight throughout the day.',
      imageUrl: FALLBACK_IMAGE,
      meta: ['Commercial · 2025', 'Location: Dubai Marina', 'Status: Built'],
      href: '/projects/lumina-pavilion',
    };
  }

  // Split the title so the trailing word can carry the gold italic accent.
  const words = project.title.trim().split(/\s+/);
  const titleAccent = words.length > 1 ? (words.pop() as string) : '';
  const titleLead = words.join(' ') || project.title;

  const category = project.category?.name;
  const year = project.year;
  const categoryYear = [category, year].filter(Boolean).join(' · ');

  const meta = [
    categoryYear,
    project.location ? `Location: ${project.location}` : undefined,
    project.status ? `Status: ${project.status}` : undefined,
  ].filter((entry): entry is string => Boolean(entry));

  return {
    titleLead,
    titleAccent,
    description: project.shortDescription || project.description,
    imageUrl: project.coverImage || FALLBACK_IMAGE,
    meta,
    href: `/projects/${project.slug}`,
  };
}

/**
 * FeaturedWork — CH. III opener. A full-bleed showcase with a split-screen
 * parallax; on section entry the image halves wipe open via a scrubbed
 * clip-path mask while the imagery settles from scale 1.08 → 1.
 *
 * Property discipline: framer-motion owns the halves' `x` parallax; GSAP
 * owns `clip-path` (halves) and `scale` (inner image wrappers) — the two
 * engines never write the same property on one node.
 *
 * PHASE 2B SEAM: image wrappers carry `data-distortion="featured"` — the
 * WebGL hover-distortion pass targets these nodes in Phase 2B.
 */
export const FeaturedWork = ({ project }: FeaturedWorkProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const leftHalfRef = useRef<HTMLDivElement>(null);
  const rightHalfRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { tier } = useQualityTier();
  const isLowTier = tier.level === 'low';
  const content = resolveContent(project);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  });

  const leftX = useTransform(scrollYProgress, [0, 1], ['-5%', '0%']);
  const rightX = useTransform(scrollYProgress, [0, 1], ['5%', '0%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0, 1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [40, 0]);

  /* Mask-wipe reveal: clip-path on the halves + scale settle on imagery. */
  useEffect(() => {
    if (reducedMotion || isLowTier) return;
    const section = sectionRef.current;
    const halves = [leftHalfRef.current, rightHalfRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    );
    const images = [leftImageRef.current, rightImageRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (!section || halves.length === 0 || images.length === 0) return;

    let cancelled = false;
    let ctx: { revert: () => void } | null = null;

    const cancelIdle = onIdle(() => {
    void (async () => {
      const gsap = await getGsap();
      if (cancelled) return;

      ctx = gsap.context(() => {
        const scrubRange = {
          trigger: section,
          start: 'top 85%',
          end: 'top 30%',
          scrub: 1,
        };
        gsap.fromTo(
          halves,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: GSAP_EASING.easeInOutQuint, scrollTrigger: scrubRange },
        );
        gsap.fromTo(
          images,
          { scale: 1.08 },
          { scale: 1, ease: GSAP_EASING.easeOutExpo, scrollTrigger: scrubRange },
        );
      }, section);
    })();
    }, 1200);

    return () => {
      cancelled = true;
      cancelIdle();
      ctx?.revert();
    };
  }, [reducedMotion, isLowTier]);

  // Reduced motion: static layout
  if (reducedMotion) {
    return (
      <section ref={sectionRef} className="relative h-screen min-h-[600px] bg-background overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <div className="relative h-full w-full opacity-30">
            <Image
              src={content.imageUrl}
              alt={`${content.titleLead} ${content.titleAccent}`.trim()}
              fill
              sizes="100vw"
              quality={80}
              priority={false}
              className="object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-background" />
        </div>

        <div className="absolute top-12 left-8 md:left-16 z-20">
          <ChapterMarker index={3} title="Work" />
        </div>

        <div className="relative z-10 h-full flex items-center px-8 md:px-16">
          <div className="w-full max-w-3xl">
            <span className="text-[9px] uppercase tracking-[0.5em] text-gold/60 mb-6 block font-mono">
              Featured Project
            </span>
            <KineticTitle
              text={`${content.titleLead} ${content.titleAccent}`.trim()}
              accentWords={content.titleAccent ? [content.titleAccent] : []}
              className="text-6xl md:text-8xl font-serif font-light text-white leading-[1.05] mb-6"
            />
            <p className="text-base text-white/40 font-light leading-relaxed w-full max-w-lg mb-10">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono mb-10">
              {content.meta.map((entry) => (
                <span key={entry}>{entry}</span>
              ))}
            </div>
            <Link href={content.href}>
              <Button variant="primary" size="lg">View Project</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
      <section ref={sectionRef} className="relative h-screen min-h-[700px] bg-background overflow-hidden">
      {/* Split image halves — GSAP owns clip-path; framer owns x parallax */}
      <motion.div
        ref={leftHalfRef}
        style={{ x: leftX }}
        className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
      >
        <div ref={leftImageRef} data-distortion="featured" className="relative h-full w-[200%] opacity-40">
          <Image
            src={content.imageUrl}
            alt=""
            aria-hidden="true"
            fill
            sizes="50vw"
            quality={80}
            priority={false}
            className="object-cover object-right"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
      </motion.div>

      <motion.div
        ref={rightHalfRef}
        style={{ x: rightX }}
        className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
      >
        <div ref={rightImageRef} data-distortion="featured" className="relative h-full w-[200%] -translate-x-1/2 opacity-40">
          <Image
            src={content.imageUrl}
            alt=""
            aria-hidden="true"
            fill
            sizes="50vw"
            quality={80}
            priority={false}
            className="object-cover object-left"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-background via-background/20 to-transparent" />
      </motion.div>

      {/* Chapter marker — CH. III */}
      <div className="absolute top-12 left-8 md:left-16 z-20">
        <ChapterMarker index={2} title="Craft" />
      </div>

      {/* Center divider line (animated) */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: DURATION.page, ease: EASE.entrance }}
        className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent origin-top"
      />

      {/* Content overlay — appears after split */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full flex items-center px-8 md:px-16"
      >
        <div className="w-full max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION.component, ease: EASE.entrance }}
            className="text-[9px] uppercase tracking-[0.5em] text-gold/60 mb-6 block font-mono"
          >
            Featured Project
          </motion.span>

          <KineticTitle
            text={`${content.titleLead} ${content.titleAccent}`.trim()}
            accentWords={content.titleAccent ? [content.titleAccent] : []}
            className="text-6xl md:text-8xl font-serif font-light text-white leading-[1.05] mb-6"
          />

          <p className="text-base text-white/40 font-light leading-relaxed w-full max-w-lg mb-10">
            {content.description}
          </p>

          <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono mb-10">
            {content.meta.map((entry, index) => (
              <span key={entry} className="flex items-center gap-2">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-gold/60' : 'bg-gold/40'}`}
                />
                {entry}
              </span>
            ))}
          </div>

          <Magnetic>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DURATION.component, ease: EASE.entrance, delay: 0.3 }}
            >
              <Link href={content.href}>
                <Button variant="primary" size="lg" className="group">
                  View Project
                  <span className="ml-3 inline-block transition-transform duration-500 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Button>
              </Link>
            </motion.div>
          </Magnetic>
        </div>
      </motion.div>

      {/* Bottom gold accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </section>
  );
};
