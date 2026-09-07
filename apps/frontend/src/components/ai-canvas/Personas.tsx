'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

interface Persona {
  id: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  alt: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'agencies',
    title: 'Agencies',
    description:
      'Concept work that wins the pitch. Variant work that runs the campaign. The same canvas does both — treatments and concept art at the brief\'s pace, ad variants and campaign creative at the campaign\'s volume.',
    features: [
      'Concept Boards',
      'Campaign Variants',
      'Treatment Decks',
      'Spec Ads',
    ],
    image: '/media/melius/personas/agencies.webp',
    alt: 'Agencias persona',
  },
  {
    id: 'filmmakers',
    title: 'CD / Filmmakers',
    description:
      'You can see the shot. You can describe it. Single-model tools can\'t make it. Work with tunable, multimodal nodes until the frame matches what you imagined.',
    features: [
      'Storyboards',
      'AI Shorts',
      'Lookbooks',
      'Reference Boards',
    ],
    image: '/media/melius/personas/filmmakers.webp',
    alt: 'Filmmaker persona',
  },
  {
    id: 'marketers',
    title: 'Marketers',
    description:
      'The hero shot in minutes. The thousand-variant cascade in an afternoon. Localized for every market, sized for every channel, brand-checked before every approval.',
    features: [
      'LCM Creatives',
      'Ad Variants',
      'Animated Statics',
      'Localized Copy',
    ],
    image: '/media/melius/personas/marketers.webp',
    alt: 'Marketer persona',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    description:
      'The shoot that used to take three weeks, an afternoon on the canvas. Pack shots, on-model, hero imagery, all brand-consistent across every frame, at the pace of your ambitions.',
    features: [
      'Pack Shots',
      'On-Model Imagery',
      'Lifestyle Heroes',
      'PDP Variants',
    ],
    image: '/media/melius/personas/ecommerce.webp',
    alt: 'E-commerce persona',
  },
  {
    id: 'gtm',
    title: 'GTM / Growth',
    description:
      'Skip the design ticket. Event graphics, blog heroes, conference posters, decks that don\'t look like they were made in five minutes — all on the fly, without learning a single tool or writing a single prompt.',
    features: [
      'Event Graphics',
      'Conference Posters',
      'Sales Decks',
      'Blog Heroes',
    ],
    image: '/media/melius/personas/gtm-growth.webp',
    alt: 'GTM and growth persona',
  },
];

/* -------------------------------------------------------------------------- */
/*  Subcomponents                                                            */
/* -------------------------------------------------------------------------- */

const CHECK_ICON = (
  <svg
    aria-hidden
    className="h-4 w-4 text-[#D4AF37]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function PersonaCard({ persona, index }: { persona: Persona; index: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={
        reducedMotion
          ? undefined
          : { duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }
      }
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] transition-colors duration-500 hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={persona.image}
          alt={persona.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      <div className="relative px-6 pb-6 pt-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.25em] text-white/70">
            MELIUS
          </span>
          <h3 className="font-serif text-2xl font-light tracking-tight text-white">
            {persona.title}
          </h3>
        </div>

        <p className="mt-4 text-sm font-light leading-relaxed text-white/60">
          {persona.description}
        </p>

        <ul className="mt-5 space-y-2">
          {persona.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/5">
                {CHECK_ICON}
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export function Personas() {
  return (
    <section className="relative bg-[#030303] px-6 py-24 sm:px-10 md:px-16 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-16 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/60">
              <span className="mr-3 inline-block h-px w-8 align-middle bg-white/40" />
              Personas
            </p>
            <h2 className="mt-6 max-w-3xl font-serif text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] tracking-tight text-white">
              Built for <span className="text-[#D4AF37]">every creative team</span>.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PERSONAS.map((persona, index) => (
            <PersonaCard key={persona.id} persona={persona} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
