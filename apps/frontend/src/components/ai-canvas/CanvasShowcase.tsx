'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

type MediaKind = 'image' | 'video';

interface ShowcaseItem {
  id: string;
  category: string;
  title: string;
  model: string;
  kind: MediaKind;
  src: string;
  alt: string;
}

const SHOWCASE: ShowcaseItem[] = [
  // Advertising
  {
    id: 'ad-1',
    category: 'Advertising',
    title: 'Advertising background',
    model: 'GPT Image 2',
    kind: 'image',
    src: '/media/melius/canvas-showcase/advertising/background.webp',
    alt: 'Advertising background',
  },
  {
    id: 'ad-2',
    category: 'Advertising',
    title: 'Product Mockup',
    model: 'GPT Image 2',
    kind: 'image',
    src: '/media/melius/canvas-showcase/advertising/product-mockup.webp',
    alt: 'Advertising product mockup',
  },
  {
    id: 'ad-3',
    category: 'Advertising',
    title: 'Studio Shot',
    model: 'Nano Banana Pro',
    kind: 'image',
    src: '/media/melius/canvas-showcase/advertising/studio-shot.webp',
    alt: 'Advertising studio shot',
  },
  {
    id: 'ad-4',
    category: 'Advertising',
    title: 'Lifestyle Moment',
    model: 'Seedance 2.0',
    kind: 'image',
    src: '/media/melius/canvas-showcase/advertising/lifestyle-moment.webp',
    alt: 'Advertising lifestyle moment',
  },
  {
    id: 'ad-5',
    category: 'Advertising',
    title: 'Model',
    model: 'Nano Banana Pro',
    kind: 'image',
    src: '/media/melius/canvas-showcase/advertising/model.webp',
    alt: 'Advertising model',
  },
  // E-commerce
  {
    id: 'ecom-1',
    category: 'E-commerce',
    title: 'Model',
    model: 'Nano Banana Pro',
    kind: 'image',
    src: '/media/melius/canvas-showcase/e-commerce/model.webp',
    alt: 'E-commerce model',
  },
  {
    id: 'ecom-2',
    category: 'E-commerce',
    title: 'Pack Shot',
    model: 'GPT Image 2',
    kind: 'image',
    src: '/media/melius/canvas-showcase/e-commerce/pack-shot.webp',
    alt: 'E-commerce pack shot',
  },
  {
    id: 'ecom-3',
    category: 'E-commerce',
    title: 'PDP Image',
    model: 'GPT Image 2',
    kind: 'image',
    src: '/media/melius/canvas-showcase/e-commerce/pdp-image.webp',
    alt: 'E-commerce product detail image',
  },
  {
    id: 'ecom-4',
    category: 'E-commerce',
    title: 'Product Motion',
    model: 'Kling 3.0 Omni',
    kind: 'video',
    src: '/media/melius/canvas-showcase/e-commerce/product-motion.webp',
    alt: 'E-commerce product motion',
  },
  // Filmmaking
  {
    id: 'film-1',
    category: 'Filmmaking',
    title: 'Still Sketch',
    model: 'GPT Image 2',
    kind: 'image',
    src: '/media/melius/canvas-showcase/filmmaking/still-sketch.webp',
    alt: 'Filmmaking still sketch',
  },
  {
    id: 'film-2',
    category: 'Filmmaking',
    title: 'Character Study',
    model: 'Nano Banana 2',
    kind: 'image',
    src: '/media/melius/canvas-showcase/filmmaking/character-study.webp',
    alt: 'Filmmaking character study',
  },
  {
    id: 'film-3',
    category: 'Filmmaking',
    title: 'Movie Cut 1',
    model: 'Seedance 2.0',
    kind: 'video',
    src: '/media/melius/canvas-showcase/filmmaking/movie-cut-1.webp',
    alt: 'Filmmaking movie cut 1',
  },
  {
    id: 'film-4',
    category: 'Filmmaking',
    title: 'Movie Cut 2',
    model: 'Seedance 2.0',
    kind: 'video',
    src: '/media/melius/canvas-showcase/filmmaking/movie-cut-2.webp',
    alt: 'Filmmaking movie cut 2',
  },
  // Fashion
  {
    id: 'fashion-1',
    category: 'Fashion',
    title: 'Croquis',
    model: 'Ideogram 4',
    kind: 'image',
    src: '/media/melius/canvas-showcase/fashion/croquis.webp',
    alt: 'Fashion croquis',
  },
  {
    id: 'fashion-2',
    category: 'Fashion',
    title: 'Fabric Swatch',
    model: 'GPT Image 2',
    kind: 'image',
    src: '/media/melius/canvas-showcase/fashion/fabric-swatch.webp',
    alt: 'Fashion fabric swatch',
  },
  {
    id: 'fashion-3',
    category: 'Fashion',
    title: 'Garment Mockup',
    model: 'Nano Banana Pro',
    kind: 'image',
    src: '/media/melius/canvas-showcase/fashion/garment-mockup.webp',
    alt: 'Fashion garment mockup',
  },
  {
    id: 'fashion-4',
    category: 'Fashion',
    title: 'Campaign Garment',
    model: 'Nano Banana Pro',
    kind: 'image',
    src: '/media/melius/canvas-showcase/fashion/campaign-garment.webp',
    alt: 'Fashion campaign garment',
  },
  // Branding
  {
    id: 'brand-1',
    category: 'Branding',
    title: 'Icon 01',
    model: 'Ideogram 4',
    kind: 'image',
    src: '/media/melius/canvas-showcase/branding/icon-01.webp',
    alt: 'Branding icon 1',
  },
  {
    id: 'brand-2',
    category: 'Branding',
    title: 'Icon 02',
    model: 'Ideogram 4',
    kind: 'image',
    src: '/media/melius/canvas-showcase/branding/icon-02.webp',
    alt: 'Branding icon 2',
  },
  {
    id: 'brand-3',
    category: 'Branding',
    title: 'Icon 03',
    model: 'Ideogram 4',
    kind: 'image',
    src: '/media/melius/canvas-showcase/branding/icon-03.webp',
    alt: 'Branding icon 3',
  },
  {
    id: 'brand-4',
    category: 'Branding',
    title: 'Icon 04',
    model: 'Ideogram 4',
    kind: 'image',
    src: '/media/melius/canvas-showcase/branding/icon-04.webp',
    alt: 'Branding icon 4',
  },
  {
    id: 'brand-5',
    category: 'Branding',
    title: 'Selected Mark',
    model: 'Ideogram 4',
    kind: 'image',
    src: '/media/melius/canvas-showcase/branding/selected-mark.webp',
    alt: 'Branding selected mark',
  },
  {
    id: 'brand-6',
    category: 'Branding',
    title: 'Website Mockup',
    model: 'Nano Banana Pro',
    kind: 'image',
    src: '/media/melius/canvas-showcase/branding/website-mockup.webp',
    alt: 'Branding website mockup',
  },
  {
    id: 'brand-7',
    category: 'Branding',
    title: 'OOH Billboard',
    model: 'Nano Banana Pro',
    kind: 'image',
    src: '/media/melius/canvas-showcase/branding/ooh-billboard.webp',
    alt: 'Branding out of home billboard',
  },
];

const CATEGORIES = Array.from(new Set(SHOWCASE.map((item) => item.category)));

/* -------------------------------------------------------------------------- */
/*  Helpers / Subcomponents                                                   */
/* -------------------------------------------------------------------------- */

const KIND_BADGE: Record<MediaKind, { label: string; className: string }> = {
  image: {
    label: 'Image',
    className: 'border-white/10 bg-white/5 text-white/70',
  },
  video: {
    label: 'Video',
    className: 'border-white/10 bg-white/5 text-white/70',
  },
};

function NodeCard({ item, index }: { item: ShowcaseItem; index: number }) {
  const reducedMotion = useReducedMotion();
  const badge = KIND_BADGE[item.kind];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={
        reducedMotion
          ? undefined
          : { duration: 0.55, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }
      }
      className="group relative overflow-hidden rounded-2xl border bg-white/[0.02] backdrop-blur-sm transition-colors duration-500 hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={item.src}
          alt={item.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${badge.className}`}
          >
            <span className="h-1 w-1 rounded-full bg-current opacity-70" />
            {badge.label}
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">
            {item.model}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
          {item.category}
        </span>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export function CanvasShowcase() {
  return (
    <section className="relative bg-void px-6 py-24 sm:px-10 md:px-16 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-16 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/60">
              <span className="mr-3 inline-block h-px w-8 align-middle bg-white/40" />
              Creative canvas
            </p>
            <h2 className="mt-6 max-w-3xl font-serif text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] tracking-tight text-white">
              Every brief, <span className="text-sl-gold-subtle">every output</span>, one canvas.
            </h2>
            <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-white/60">
              Browse curated work across advertising, e-commerce, film, fashion, and
              branding — assembled by Mel and polished by your team.
            </p>
          </div>
        </div>

        {CATEGORIES.map((category) => {
          const items = SHOWCASE.filter((item) => item.category === category);
          return (
            <div key={category} className="mb-20 last:mb-0">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/60">
                  {category}
                </h3>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {items.length} outputs
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item, index) => (
                  <NodeCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
