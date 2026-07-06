'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/components/ui/cards/Card';
import Link from 'next/link';
import { Project } from '@hexastudio/types';

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  slug: string;
  index: number;
}

const ProjectCard = ({ title, category, image, slug, index }: ProjectCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ 
      duration: 0.8, 
      delay: (index % 4) * 0.1, 
      ease: 'var(--ease-out-expo)' 
    }}
    whileHover={{ y: -12 }}
    className="group cursor-pointer"
    data-testid="project-card"
  >
    <Link href={`/portfolio/${slug}`}>
      <Card variant="solid" className="overflow-hidden p-0 aspect-[3/4]">
        <div className="h-full w-full relative overflow-hidden bg-surface-light">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out-expo"
          />
          
          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out-expo">
              <p className="text-[9px] uppercase tracking-[0.4em] text-accent mb-2">
                {category}
              </p>
              <h3 className="text-2xl font-serif font-light text-foreground leading-tight">
                {title}
              </h3>
              <div className="h-[1px] w-0 group-hover:w-full bg-accent transition-all duration-700 delay-100 mt-4" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  </motion.div>
);

const fallbackProjects = [
  {
    title: 'The Obsidian Villa',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    slug: 'obsidian-villa',
  },
  {
    title: 'Lumina Pavilion',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be6c6?w=800&q=80',
    slug: 'lumina-pavilion',
  },
  {
    title: 'Azure Heights',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600607687644-c94bf900a9a7?w=800&q=80',
    slug: 'azure-heights',
  },
  {
    title: 'Zenith Office',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    slug: 'zenith-office',
  },
];

interface ProjectGridProps {
  projects: Project[];
}

export const ProjectGrid = ({ projects }: ProjectGridProps) => {
  const mappedProjects =
    projects?.map((p) => ({
      title: p.title,
      category: p.category?.name ?? 'Project',
      image: p.coverImage ? `${p.coverImage}?w=800&q=80` : '',
      slug: p.slug,
    })) ?? fallbackProjects;

  return (
    <section className="px-8 md:px-16 py-32 max-w-screen-2xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
        <div className="max-w-3xl">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-6 block"
          >
            Selected Works
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'var(--ease-out-expo)' }}
            className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground leading-[1.1]"
          >
            Creating <span className="italic text-accent">Visual</span> Truth
          </motion.h2>
        </div>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'var(--ease-out-expo)' }}
          className="text-neutral-500 font-light max-w-sm text-sm leading-relaxed"
        >
          A curation of architectural narratives defined by light, material, and space.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {mappedProjects.map((project, idx) => (
          <ProjectCard key={project.slug} {...project} index={idx} />
        ))}
      </div>
    </section>
  );
};


