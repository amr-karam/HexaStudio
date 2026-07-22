'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@hexastudio/types';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { EASE, DURATION } from '@/lib/motion';
import { useReducedMotion } from '@/hooks';

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
 * FeaturedWork — A full-bleed project showcase with a split-screen reveal.
 * On scroll, the image halves slide apart from center, revealing the project
 * title and metadata between them. Uses the signature entrance easing.
 */
export const FeaturedWork = ({ project }: FeaturedWorkProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const content = resolveContent(project);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  });

  const leftX = useTransform(scrollYProgress, [0, 1], ['-5%', '0%']);
  const rightX = useTransform(scrollYProgress, [0, 1], ['5%', '0%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0, 1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [40, 0]);

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

        <div className="relative z-10 h-full flex items-center px-8 md:px-16">
          <div className="w-full max-w-3xl">
            <span className="text-[9px] uppercase tracking-[0.5em] text-gold/60 mb-6 block font-mono">
              Featured Project
            </span>
            <h2 className="text-6xl md:text-8xl font-serif font-light text-white leading-[1.05] mb-6">
              {content.titleLead}{' '}
              {content.titleAccent && <span className="italic text-gold">{content.titleAccent}</span>}
            </h2>
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
      {/* Split image halves */}
      <motion.div
        style={{ x: leftX }}
        className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
      >
        <div className="relative h-full w-[200%] opacity-40">
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
        style={{ x: rightX }}
        className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
      >
        <div className="relative h-full w-[200%] -translate-x-1/2 opacity-40">
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

          <h2 className="text-6xl md:text-8xl font-serif font-light text-white leading-[1.05] mb-6">
            {content.titleLead}{' '}
            {content.titleAccent && <span className="italic text-gold">{content.titleAccent}</span>}
          </h2>

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
