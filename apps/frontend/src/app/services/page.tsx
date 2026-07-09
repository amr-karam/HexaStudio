'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { TextReveal } from '@/components/ui/TextReveal';
import { useServices } from '@/features/services/hooks/useServices';
import { Service } from '@/types';

const fallbackServices: (Service & { accent: string })[] = [
  {
    id: '1',
    title: 'Architectural Visualization',
    slug: 'architectural-visualization',
    description:
      'Photorealistic still renderings that capture materials, lighting, and atmosphere with uncompromising fidelity.',
    features: ['Exterior & Interior renderings', 'Material studies', 'Contextual site visuals'],
    order: 1,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
    accent: 'var(--color-accent)',
  },
  {
    id: '2',
    title: 'Real-Time 3D Experiences',
    slug: 'real-time-3d',
    description:
      'Interactive web-based walkthroughs built with React Three Fiber, allowing clients to explore spaces in real time.',
    features: ['Browser-based walkthroughs', 'Interactive hotspots', 'Quality-adaptive rendering'],
    order: 2,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
    accent: 'var(--color-accent-light)',
  },
  {
    id: '3',
    title: 'Cinematic Animation',
    slug: 'cinematic-animation',
    description:
      'Narrative-driven film sequences that guide viewers through architectural spaces with cinematic pacing and camera work.',
    features: ['Flythrough animations', 'Camera choreography', 'Post-production grading'],
    order: 3,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
    accent: 'var(--color-accent-dark)',
  },
  {
    id: '4',
    title: 'Visual Consulting',
    slug: 'visual-consulting',
    description:
      'Strategic visual direction for architectural projects, from material selection to lighting design and presentation strategy.',
    features: ['Visual strategy sessions', 'Material & lighting consultation', 'Presentation design'],
    order: 4,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
    accent: 'var(--color-accent)',
  },
];

const accentColors = [
  'var(--color-accent)',
  'var(--color-accent-light)',
  'var(--color-accent-dark)',
  'var(--color-accent)',
];

export default function ServicesPage() {
  const { data, isLoading } = useServices();
  const services = data?.services?.length ? data.services : fallbackServices;

  return (
    <div className="bg-background text-foreground">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 overflow-hidden">
        <div className="text-center relative z-10 mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            Expertise
          </motion.span>
          <div className="text-6xl md:text-8xl font-serif font-light tracking-tighter text-foreground leading-tight">
            <TextReveal delay={0.1}>
              Our <span className="italic text-accent">Services.</span>
            </TextReveal>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">
          {services.map((service, idx) => (
            <motion.div
              key={service.id || service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-8 md:p-12 bg-surface border border-border/50 hover:border-accent/50 transition-colors duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors duration-500" />
              
              <div className="relative z-10">
                <span className="text-xs font-mono text-neutral-600 mb-4 block">0{idx + 1} — SERVICE</span>
                <h3 className="text-3xl font-serif font-light text-foreground mb-6 group-hover:text-accent transition-colors duration-500">
                  {service.title}
                </h3>
                <p className="text-neutral-400 font-light leading-relaxed mb-8 max-w-md">
                  {service.description}
                </p>
                <ul className="space-y-3 mb-12">
                  {service.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-neutral-500 font-light">
                      <span className="w-1 h-1 bg-accent rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="group-hover:bg-accent group-hover:text-background transition-all duration-500">
                    Inquire about {service.title}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
