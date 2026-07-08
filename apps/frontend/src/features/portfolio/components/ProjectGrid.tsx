'use client';
import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/components/ui/cards/Card';
import { ProjectDetailModal } from '@/components/ui/modals/ProjectDetailModal';
import { Project } from '@hexastudio/types';

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  index: number;
  onClick: () => void;
}

const ProjectCard = ({ title, category, image, index, onClick }: ProjectCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
      duration: 0.8,
      delay: (index % 4) * 0.1,
      ease: [0.16, 1, 0.3, 1]
    }}
    whileHover={{ y: -12 }}
    className="group cursor-pointer"
    data-testid="project-card"
    onClick={onClick}
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
          <div className="transition-all duration-500 ease-out-expo">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-accent/80 group-hover:text-accent transition-colors duration-500 mb-2 font-mono">
              {category}
            </p>
            <h3 className="text-lg md:text-xl lg:text-2xl font-serif font-light text-foreground/90 group-hover:text-foreground transition-colors duration-500 leading-tight">
              {title}
            </h3>
            <div className="h-[1px] w-0 group-hover:w-full bg-accent transition-all duration-700 mt-4" />
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

const fallbackProjects = [
  {
    title: 'The Obsidian Villa',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    slug: 'obsidian-villa',
    description: 'A minimalist residential masterpiece carved into a volcanic hillside, where raw black stone meets floor-to-ceiling glass. The interplay of shadow and light creates an ever-changing atmosphere across every surface.',
  },
  {
    title: 'Lumina Pavilion',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    slug: 'lumina-pavilion',
    description: 'A translucent commercial pavilion that appears to float above its waterfront site. ETFE cushions and precisions steel form a crystalline envelope that refracts sunlight throughout the day.',
  },
  {
    title: 'Azure Heights',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    slug: 'azure-heights',
    description: 'A vertical garden tower in the heart of the city, where every residence opens to sky terraces with cascading greenery. The facade breathes — opening and closing in response to solar exposure.',
  },
  {
    title: 'Zenith Office',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    slug: 'zenith-office',
    description: 'A reimagined workplace where biophilic design meets cutting-edge technology. Triple-height atriums, living walls, and adaptive lighting create an environment that evolves with its occupants.',
  },
];

interface ProjectGridProps {
  projects: Project[];
}

export const ProjectGrid = ({ projects }: ProjectGridProps) => {
  const [selectedProject, setSelectedProject] = useState<typeof fallbackProjects[0] | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headingY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);

  const mappedProjects =
    projects?.map((p) => ({
      title: p.title,
      category: p.category?.name ?? 'Project',
      image: p.coverImage ? `${p.coverImage}?w=800&q=80` : '',
      slug: p.slug,
      description: p.shortDescription || p.description,
    })) ?? fallbackProjects;

  const displayProjects = mappedProjects.length > 0 ? mappedProjects : fallbackProjects;

  return (
    <>
      <section ref={sectionRef} className="px-8 md:px-16 py-32">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
          <div>
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
            className="text-neutral-500 font-light text-sm leading-relaxed"
          >
            A curation of architectural narratives defined by light, material, and space.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProjects.map((project, idx) => (
            <ProjectCard key={project.slug} title={project.title} category={project.category} image={project.image} index={idx} onClick={() => setSelectedProject(project)} />
          ))}
        </div>
      </section>

      <ProjectDetailModal
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        project={selectedProject ?? fallbackProjects[0]}
      />
    </>
  );
};
