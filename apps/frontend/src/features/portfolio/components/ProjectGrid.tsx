'use client';
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/components/ui/cards/Card';
import { ProjectDetailModal } from '@/components/ui/modals/ProjectDetailModal';
import { Project } from '@hexastudio/types';
import { Magnetic } from '@/components/ui/Magnetic';
import { ChapterMarker } from '@/components/animation/ChapterMarker';
import { KineticTitle } from '@/components/scroll/KineticTitle';
import { OrnamentalRule, ChapterNumeral } from '@/components/storybook/BookOrnaments';
import { getGsap } from '@/lib/gsap';
import { onIdle } from '@/lib/idle';
import { cn } from '@/lib/utils';
import { EASE, DURATION, makeTransition } from '@/lib/motion';
import { velocityToSkew } from '@/lib/motion/scroll-utils';
import { GSAP_EASING, STAGGER_TOKENS } from '@/lib/motion/tokens';
import { useReducedMotion, useScrollVelocity, useFinePointer } from '@/hooks';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  index: number;
  onClick: () => void;
  isFocused: boolean;
  status?: string;
}

type ProjectGridCard = {
  title: string;
  category: string;
  image: string;
  slug: string;
  description: string;
  status?: string;
};

const ProjectCard = ({ title, category, image, index, onClick, isFocused, status }: ProjectCardProps) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageClipRef = useRef<HTMLDivElement>(null);
  const imageScaleRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { tier } = useQualityTier();
  const isLowTier = tier.level === 'low';

  useEffect(() => {
    if (reducedMotion || isLowTier) return;
    const card = cardRef.current;
    const clipTarget = imageClipRef.current;
    const scaleTarget = imageScaleRef.current;
    if (!card || !clipTarget || !scaleTarget) return;

    let cancelled = false;
    let ctx: { revert: () => void } | null = null;

    const cancelIdle = onIdle(() => {
      void (async () => {
        const gsap = await getGsap();
        if (cancelled) return;

        ctx = gsap.context(() => {
          const scrubRange = {
            trigger: card,
            start: 'top 92%',
            end: 'top 55%',
            scrub: 1,
          };
          gsap.fromTo(
            clipTarget,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', ease: GSAP_EASING.easeInOutQuint, scrollTrigger: scrubRange },
          );
          gsap.fromTo(
            scaleTarget,
            { scale: 1.08 },
            { scale: 1, ease: GSAP_EASING.easeOutExpo, scrollTrigger: scrubRange },
          );
        }, card);
      })();
    }, 1200);

    return () => {
      cancelled = true;
      cancelIdle();
      ctx?.revert();
    };
  }, [reducedMotion, isLowTier]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: -y * 10, y: x * 10 });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: DURATION.page,
        delay: (index % 4) * STAGGER_TOKENS.cards,
        ease: EASE.entrance,
      }}
      data-testid="project-card"
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label={`View details for ${title}`}
        className={cn(
          'group w-full text-left cursor-pointer perspective-1000',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg',
        )}
      >
        <motion.div
          style={{
            rotateX: rotate.x,
            rotateY: rotate.y,
            filter: isFocused ? 'blur(0px) grayscale(0%)' : 'blur(2px) grayscale(20%)',
            opacity: isFocused ? 1 : 0.7,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
          className="transition-all duration-700 ease-out"
        >
          <Card variant="solid" className="overflow-hidden p-0 aspect-[3/4]">
            <div className="absolute inset-0 bg-accent/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <div ref={imageClipRef} className="h-full w-full relative overflow-hidden bg-surface-light">
              {/* Hover zoom (CSS-owned transform) wraps the GSAP-owned settle scale */}
              <div className="h-full w-full transition-transform duration-1000 ease-out-expo group-hover:scale-110">
                <div ref={imageScaleRef} data-distortion="work-card" className="relative h-full w-full">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-1000 ease-out-expo"
                  />
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />

              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="transition-all duration-500 ease-out">
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.6em] text-accent/90 group-hover:text-accent transition-colors duration-500 mb-3 font-mono">
                    {category}
                  </p>
                  {status && (
                    <span className="mb-3 inline-block rounded-none border border-white/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] text-white/50 bg-white/5">
                      {status}
                    </span>
                  )}
                  <h3 className="text-xl md:text-2xl font-serif font-light text-foreground/95 group-hover:text-white transition-colors duration-500 leading-[1.1] tracking-tight">
                    {title}
                  </h3>
                  <div className="h-[1px] w-0 group-hover:w-full bg-accent transition-all duration-1000 mt-6 ease-out-expo" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </button>
    </motion.div>
  );
};

const fallbackProjects: ProjectGridCard[] = [
  {
    title: 'The Obsidian Villa',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    slug: 'obsidian-villa',
    status: 'Active',
    description: 'A minimalist residential masterpiece carved into a volcanic hillside, where raw black stone meets floor-to-ceiling glass. The interplay of shadow and light creates an ever-changing atmosphere across every surface.',
  },
  {
    title: 'Lumina Pavilion',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    slug: 'lumina-pavilion',
    status: 'Proposal Sent',
    description: 'A translucent commercial pavilion that appears to float above its waterfront site. ETFE cushions and precision steel form a crystalline envelope that refracts sunlight throughout the day.',
  },
  {
    title: 'Azure Heights',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    slug: 'azure-heights',
    status: 'Active',
    description: 'A vertical garden tower in the heart of the city, where every residence opens to sky terraces with cascading greenery. The facade breathes — opening and closing in response to solar exposure.',
  },
  {
    title: 'Zenith Office Headquarters',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d4b62?w=800&q=80',
    slug: 'zenith-office',
    status: 'Consultation',
    description: 'A reimagined workplace where biophilic design meets cutting-edge technology. Triple-height atriums, living walls, and adaptive lighting create an environment that evolves with its occupants.',
  },
  {
    title: 'Kaze Mountain Sanctuary',
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=80',
    slug: 'kaze-sanctuary',
    status: 'Active',
    description: 'A serene timber retreat suspended over an alpine ravine, celebrating traditional craftsmanship through modern parametric joinery and acoustic isolation.',
  },
  {
    title: 'Solstice Cultural Center',
    category: 'Public',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    slug: 'solstice-center',
    status: 'Active',
    description: 'A civic landmark celebrating natural light cycles. Curved white concrete shell structures frame winter and summer solstice sun paths, creating dramatic interior light corridors.',
  },
];

interface ProjectGridProps {
  projects: Project[];
}

/**
 * ProjectGridSection — frames the project grid in storybook chapter aesthetics.
 *
 * Provides a book-page border, corner flourishes, a large Roman numeral,
 * ornamental rules, and the chapter marker — wrapping the existing grid logic.
 */
function ProjectGridSection({
  children,
  chapterNumber,
  chapterTitle,
  id,
}: {
  children: React.ReactNode;
  chapterNumber: number;
  chapterTitle?: string;
  id?: string;
}) {
  return (
    <section
      id={id ?? `ch-${chapterNumber}`}
      className="storybook-page-padding page-shadow storybook-border relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(26,22,18,0.38) 0%, rgba(15,13,10,0.55) 100%)',
      }}
    >
      {/* Double border frame */}
      <div className="storybook-border absolute inset-0 pointer-events-none" />

      {/* Corner flourishes */}
      <div className="corner-flourish-tl absolute" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ transform: 'rotate(0deg)', color: 'rgba(212, 175, 55, 0.28)' }} aria-hidden="true">
          <path d="M4 44 C4 20, 20 4, 44 4" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
          <circle cx="4" cy="44" r="1.5" fill="currentColor" />
          <path d="M10 38 C10 24, 22 14, 34 10" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>
      <div className="corner-flourish-tr absolute" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ transform: 'rotate(90deg)', color: 'rgba(212, 175, 55, 0.28)' }} aria-hidden="true">
          <path d="M4 44 C4 20, 20 4, 44 4" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
          <circle cx="4" cy="44" r="1.5" fill="currentColor" />
          <path d="M10 38 C10 24, 22 14, 34 10" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>

      {/* Chapter numeral (top-left, behind everything) */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8" aria-hidden="true">
        <ChapterNumeral number={chapterNumber} />
      </div>

      {/* Chapter title + ornamental rules */}
      {chapterTitle && (
        <div className="relative z-10 max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <div aria-hidden="true" className="mb-10">
            <ChapterNumeral number={chapterNumber} />
          </div>
          <div aria-hidden="true" className="mb-6">
            <OrnamentalRule />
          </div>
          <h2 className="storybook-heading mb-3" id={`chapter-title-${chapterNumber}`}>
            {chapterTitle}
          </h2>
          <div aria-hidden="true" className="mb-6">
            <OrnamentalRule />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom double rule */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', color: 'rgba(212, 175, 55, 0.1)' }} aria-hidden="true">
          <rect x="3" y="3" width="94" height="94" rx="1" fill="none" stroke="currentColor" strokeWidth="0.3" />
        </svg>
        <div className="flex flex-col items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.3)' }}>
          <span style={{ width: '48px', height: '1px', background: 'currentColor' }} />
          <span style={{ width: '14px', height: '1px', background: 'currentColor' }} />
          <span style={{ width: '48px', height: '1px', background: 'currentColor' }} />
        </div>
      </div>

      {/* Left-edge page shadow */}
      <div className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none opacity-20" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 100%)' }} />
    </section>
  );
}

export const ProjectGrid = ({ projects }: ProjectGridProps) => {
  const [selectedProject, setSelectedProject] = useState<ProjectGridCard | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headingY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);

  // demilie.ru / cuberto DNA: velocity shear on the project card grid.
  const { staticMode } = useMotionPolicy();
  const finePointer = useFinePointer();
  const velocity = useScrollVelocity();
  const skewY = useTransform(velocity, (v) => velocityToSkew(v, 3));
  const enableShear = !staticMode && finePointer;

  const allProjects = useMemo((): ProjectGridCard[] => {
    if (projects && projects.length > 0) {
      return projects.map((p) => ({
        title: p.title,
        category: p.category?.name ?? 'Project',
        image: p.coverImage ? `${p.coverImage}?w=800&q=80` : '',
        slug: p.slug,
        description: p.shortDescription || p.description,
        status: p.status,
      }));
    }
    return fallbackProjects;
  }, [projects]);

  const categories = useMemo(() => {
    const cats = new Set(['All']);
    allProjects.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return allProjects;
    return allProjects.filter(p => p.category === activeCategory);
  }, [allProjects, activeCategory]);

  // Filtering shifts card positions — re-measure all scroll choreography.
  useEffect(() => {
    let cancelled = false;
    const cancelIdle = onIdle(() => {
      void (async () => {
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        if (!cancelled) ScrollTrigger.refresh();
      })();
    });
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [filteredProjects]);

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return (
    <>
      <ProjectGridSection
        chapterNumber={4}
        chapterTitle="Proof"
        id="ch-proof"
      >
        {/* Chapter heading — within the storybook frame */}
        <section ref={sectionRef} className="px-8 md:px-16 py-32 bg-background relative overflow-hidden">
          <div className="absolute top-12 left-8 md:left-16 z-20">
            <ChapterMarker index={4} title="Proof" />
          </div>
          <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />

          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
            <div className="w-full">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
              >
                Selected Works
              </motion.span>
              <motion.div
                style={{ y: headingY }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={makeTransition('entrance', 'page')}
                className="max-w-2xl"
              >
                <KineticTitle
                  text="Creating Visual Truth"
                  accentWords={['Visual']}
                  className="text-5xl md:text-7xl font-serif font-light tracking-[-0.03em] text-foreground leading-[1.05]"
                />
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={makeTransition('entrance', 'page', 0.2)}
              className="text-neutral-500 font-light text-sm leading-relaxed w-full max-w-xs"
            >
              A curation of architectural narratives defined by light, material, and space.
            </motion.p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mb-20">
            {categories.map((cat) => (
              <Magnetic key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'text-[9px] uppercase tracking-[0.4em] transition-all duration-700 font-mono py-1 border-b border-transparent',
                    activeCategory === cat
                      ? 'text-accent border-accent'
                      : 'text-neutral-600 hover:text-neutral-400'
                  )}
                >
                  {cat}
                </button>
              </Magnetic>
            ))}
          </div>

          <motion.div
            style={enableShear ? { skewY } : undefined}
            className="will-change-transform"
          >
            <motion.div
              layout
              className="columns-1 md:columns-2 lg:columns-4 gap-8 space-y-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, idx) => (
                  <div
                    key={project.slug}
                    className="break-inside-avoid"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <ProjectCard
                      title={project.title}
                      category={project.category}
                      image={project.image}
                      index={idx}
                      isFocused={hoveredIndex === idx}
                      status={project.status}
                      onClick={() => setSelectedProject(project)}
                    />
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </section>
      </ProjectGridSection>

      <ProjectDetailModal
        isOpen={selectedProject !== null}
        onClose={handleCloseModal}
        project={selectedProject ?? fallbackProjects[0]}
      />
    </>
  );
};
