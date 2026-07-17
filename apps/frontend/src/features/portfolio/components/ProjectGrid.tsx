'use client';
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/components/ui/cards/Card';
import { ProjectDetailModal } from '@/components/ui/modals/ProjectDetailModal';
import { Project } from '@hexastudio/types';
import { Magnetic } from '@/components/ui/Magnetic';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  index: number;
  onClick: () => void;
  status?: string;
}

const ProjectCard = ({ title, category, image, index, onClick, isFocused, status }: ProjectCardProps & { isFocused: boolean }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: -y * 10, y: x * 10 });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 1.2,
        delay: (index % 4) * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="group cursor-pointer perspective-1000"
      data-testid="project-card"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div 
        style={{ 
          rotateX: rotate.x, 
          rotateY: rotate.y,
          filter: isFocused ? 'blur(0px) grayscale(0%)' : 'blur(2px) grayscale(20%)',
          opacity: isFocused ? 1 : 0.7
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        className="transition-all duration-700 ease-out"
      >
        <Card variant="solid" className="overflow-hidden p-0 aspect-[3/4]">
          <div className="absolute inset-0 bg-accent/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          <div className="h-full w-full relative overflow-hidden bg-surface-light">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out-expo"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="transition-all duration-500 ease-out">
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-accent/80 group-hover:text-accent transition-colors duration-500 mb-2 font-mono">
                    {category}
                  </p>
                  {status && (
                    <span className="mb-2 inline-block rounded-full border border-white/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white/60">
                      {status}
                    </span>
                  )}
                  <h3 className="text-lg md:text-xl lg:text-2xl font-serif font-light text-foreground/90 group-hover:text-foreground transition-colors duration-500 leading-tight">
                    {title}
                  </h3>
                <div className="h-[1px] w-0 group-hover:w-full bg-accent transition-all duration-700 mt-4" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const fallbackProjects = [
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
    title: 'Zenith Office',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d4b62?w=800&q=80',
    slug: 'zenith-office',
    status: 'Consultation',
    description: 'A reimagined workplace where biophilic design meets cutting-edge technology. Triple-height atriums, living walls, and adaptive lighting create an environment that evolves with its occupants.',
  },
];

interface ProjectGridProps {
  projects: Project[];
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

  const allProjects = useMemo(() => {
    const mapped = projects?.map((p) => ({
      title: p.title,
      category: p.category?.name ?? 'Project',
      image: p.coverImage ? `${p.coverImage}?w=800&q=80` : '',
      slug: p.slug,
      description: p.shortDescription || p.description,
      status: p.status,
    })) ?? fallbackProjects;
    return mapped;
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

  return (
    <>
      <section ref={sectionRef} className="px-8 md:px-16 py-32 bg-background">
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
            <motion.h2
              style={{ y: headingY }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground leading-[1.1]"
            >
              Creating <span className="italic text-accent">Visual</span> Truth
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-neutral-500 font-light text-sm leading-relaxed max-w-xs"
          >
            A curation of architectural narratives defined by light, material, and space.
          </motion.p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((cat) => (
            <Magnetic key={cat}>
              <button
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-6 py-2 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 rounded-full border',
                  activeCategory === cat 
                    ? 'bg-accent text-obsidian border-accent' 
                    : 'bg-transparent text-neutral-500 border-border hover:border-neutral-400'
                )}
              >
                {cat}
              </button>
            </Magnetic>
          ))}
        </div>

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
      </section>

      <ProjectDetailModal
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        project={selectedProject ?? fallbackProjects[0]}
      />
    </>
  );
};
