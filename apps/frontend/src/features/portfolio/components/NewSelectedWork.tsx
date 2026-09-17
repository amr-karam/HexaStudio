'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const PROJECTS = [
  {
    n: '01',
    title: 'Obsidian Villa',
    place: 'Aspen, US',
    year: '2025',
    type: 'Residential',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80',
  },
  {
    n: '02',
    title: 'Lumina Pavilion',
    place: 'Dubai, UAE',
    year: '2025',
    type: 'Cultural',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80',
  },
  {
    n: '03',
    title: 'Azure Heights',
    place: 'Singapore',
    year: '2024',
    type: 'Tower',
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&q=80',
  },
  {
    n: '04',
    title: 'Kaze Sanctuary',
    place: 'Hokkaido, JP',
    year: '2024',
    type: 'Hospitality',
    img: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1400&q=80',
  },
];

/**
 * NewSelectedWork — single, editorial 2x2 grid of work.
 * No filter chips, no carousel chrome, no noise. Just plates.
 */
export function NewSelectedWork() {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <section
      id="work"
      className="relative bg-sl-void px-6 py-24 sm:px-10 md:px-16 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* Section header */}
        <div className="mb-16 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-sl-gold-subtle/70">
              <span className="mr-3 inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
              Ch. 02 — Selected Work
            </div>
            <h2 className="mt-6 max-w-3xl font-serif text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] tracking-[-0.02em] text-sl-alabaster">
              Four rooms,
              <br />
              <span className="italic text-sl-gold-hover">four worlds</span>.
            </h2>
          </div>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-3 self-start font-mono text-[10px] uppercase tracking-[0.4em] text-sl-mist/60 transition-colors duration-500 hover:text-sl-gold-hover md:self-end"
          >
            <span>Full archive</span>
            <span className="inline-block h-px w-8 bg-sl-mist/30 transition-all duration-500 group-hover:w-12 group-hover:bg-sl-gold-subtle" />
          </Link>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 gap-px bg-sl-gold-subtle/10 sm:grid-cols-2">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="group relative aspect-[4/3] overflow-hidden bg-sl-obsidian"
            >
              <Image
                src={p.img}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover transition-all duration-1000 ${
                  hover === i ? 'grayscale-0 scale-105' : 'grayscale'
                }`}
              />
              <div
                className={`absolute inset-0 bg-sl-void transition-opacity duration-700 ${
                  hover === i ? 'opacity-30' : 'opacity-65'
                }`}
              />

              {/* Overlay content */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 md:p-10">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-gold-hover/80">
                    {p.n} / {p.type}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-mist/60">
                    {p.year}
                  </span>
                </div>

                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-mist/60">
                    {p.place}
                  </div>
                  <h3 className="mt-2 font-serif text-3xl font-light leading-tight text-sl-alabaster sm:text-4xl md:text-5xl">
                    {p.title}
                  </h3>
                </div>
              </div>

              {/* Bottom border line */}
              <div
                className={`absolute bottom-0 left-0 h-px bg-sl-gold-subtle transition-all duration-1000 ${
                  hover === i ? 'w-full' : 'w-0'
                }`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
