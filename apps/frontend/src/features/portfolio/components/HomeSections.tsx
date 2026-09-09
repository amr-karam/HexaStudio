'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

/**
 * HomeSections — the redesigned below-the-fold stack.
 *
 * Ch. II  Craft     — Selected Work (editorial 2x2 grid)
 * Ch. III Method    — The Process (cinematic three-step narrative)
 * Ch. IV Proof      — Philosophy (single-quartet of principles)
 * Ch. V  Contact    — CTA strip
 */

type WorkItem = {
  n: string;
  title: string;
  place: string;
  year: string;
  category: string;
  img: string;
};

const WORK: WorkItem[] = [
  {
    n: '01',
    title: 'Obsidian Villa',
    place: 'Aspen, US',
    year: '2025',
    category: 'Residential',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80',
  },
  {
    n: '02',
    title: 'Lumina Pavilion',
    place: 'Dubai, UAE',
    year: '2025',
    category: 'Cultural',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80',
  },
  {
    n: '03',
    title: 'Azure Heights',
    place: 'Singapore',
    year: '2024',
    category: 'Tower',
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&q=80',
  },
  {
    n: '04',
    title: 'Kaze Sanctuary',
    place: 'Hokkaido, JP',
    year: '2024',
    category: 'Hospitality',
    img: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1400&q=80',
  },
];

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Observe',
    subtitle: 'Light study & site analysis',
    body: 'We map every sun path, every shadow, every way light moves through your space across the seasons.',
  },
  {
    n: '02',
    title: 'Synthesize',
    subtitle: 'Architectural intent to pixel',
    body: 'Our pipeline translates design drawings into a real-time scene with physically-accurate materials and lighting.',
  },
  {
    n: '03',
    title: 'Render',
    subtitle: 'Cinematic output at 8K',
    body: 'Octane and Unreal Engine 5 render at full resolution — stills, animations, and real-time walkthroughs.',
  },
];

const PRINCIPLES = [
  {
    label: 'Light First',
    body: 'Every pixel serves the light. We do not decorate; we reveal.',
  },
  {
    label: 'Quiet Luxury',
    body: 'Restraint over ornament. Monochrome, deep blacks, and the occasional touch of gold.',
  },
  {
    label: 'Built to Scale',
    body: 'From concept sketch to million-dollar tower, the system grows with the project.',
  },
  {
    label: 'Spatial Intelligence',
    body: 'Data-driven design decisions, validated against real human movement and sightlines.',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

function Kicker({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-sl-gold-subtle/70">
      <span className="mr-3 inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
      {children}
    </div>
  );
}

function SelectedWork() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section id="work" className="relative bg-sl-void px-6 py-24 sm:px-10 md:px-16 md:py-40">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-16 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
          <div>
            <Kicker>Ch. 02 — Selected Work</Kicker>
            <h2 className="mt-6 max-w-3xl font-serif text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] tracking-tight text-sl-alabaster">
              Four briefs,
              <br />
              <span className="text-sl-gold-hover">four worlds</span>.
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

        <div className="grid grid-cols-1 gap-px bg-sl-gold-subtle/10 sm:grid-cols-2">
          {WORK.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="group relative aspect-[4/3] overflow-hidden bg-sl-obsidian"
            >
              {hover === i ? (
                <Image
                  src={p.img}
                  alt={p.title}
                  fill
                  priority={i === 0}
                  className="absolute h-full w-full scale-105 object-cover grayscale-0 transition-all duration-1000"
                />
              ) : (
                <Image
                  src={p.img}
                  alt={p.title}
                  fill
                  className="absolute h-full w-full object-cover grayscale transition-all duration-1000"
                />
              )}
              <div
                className="absolute inset-0 bg-sl-void transition-opacity duration-700"
                style={{ opacity: hover === i ? 0.3 : 0.65 }}
              />
              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 md:p-10">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-gold-hover/80">
                    {p.n} / {p.category}
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
              <div
                className="absolute bottom-0 left-0 h-px bg-sl-gold-subtle transition-all duration-1000"
                style={{ width: hover === i ? '100%' : '0%' }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TheProcess() {
  return (
    <section
      id="method"
      className="relative bg-sl-obsidian px-6 py-24 sm:px-10 md:px-16 md:py-40"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/20 to-transparent" />

      <div className="mx-auto max-w-[1600px]">
        <div className="mx-auto max-w-2xl text-center">
          <Kicker>Ch. 03 — The Process</Kicker>
          <h2 className="mt-6 font-serif text-[clamp(2rem,5vw,3.25rem)] font-light leading-[1.1] tracking-tight text-sl-alabaster">
            From first light to final frame.
          </h2>
          <p className="mt-6 text-sm font-light leading-relaxed text-sl-mist/60 sm:text-base">
            A three-movement system: we study how light lives in your space,
            translate design intent into a real-time scene, then render at the
            fidelity the moment deserves.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-3">
          {PROCESS_STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: i * 0.15 }}
              className="space-y-6"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-gold-subtle/70">
                {step.n} / Stage
              </div>
              <h3 className="font-serif text-3xl font-light leading-tight text-sl-alabaster">
                {step.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-sl-mist/50">
                {step.subtitle}
              </p>
              <p className="text-sm font-light leading-relaxed text-sl-mist/40">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThePhilosophy() {
  return (
    <section
      id="philosophy"
      className="relative bg-sl-void px-6 py-24 sm:px-10 md:px-16 md:py-40"
    >
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage:
          "radial-gradient(circle at 20% 50%, rgba(212,175,55,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212,175,55,0.03) 0%, transparent 50%)",
      }} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/20 to-transparent" />

      <div className="relative mx-auto max-w-[1600px]">
        <Kicker>Ch. 04 — Philosophy</Kicker>
        <h2 className="mt-6 font-serif text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] tracking-tight text-sl-alabaster">
          Four principles,
          <br />
          <span className="text-sl-gold-hover">one pursuit</span>.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12">
          {PRINCIPLES.map((principle, i) => (
            <motion.div
              key={principle.label}
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
              className="group border-l border-sl-gold-subtle/10 pl-8"
            >
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-sl-gold-subtle/70">
                {String(i + 1).padStart(2, '0')} / {principle.label}
              </div>
              <motion.div
                className="h-px w-0 bg-sl-gold-subtle/30 transition-all duration-500 group-hover:w-12"
              />
              <p className="mt-6 text-sm font-light leading-relaxed text-sl-mist/50">
                {principle.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCta() {
  return (
    <section
      id="contact"
      className="relative bg-sl-obsidian px-6 py-20 sm:px-10 md:px-16"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <Kicker>Ch. 05 — Next Brief</Kicker>
            <h2 className="mt-6 font-serif text-[clamp(1.5rem,4vw,3rem)] font-light tracking-tight text-sl-alabaster">
              Ready to render the unseen?
            </h2>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-sl-alabaster transition-colors duration-500 hover:text-sl-gold-hover"
          >
            <span>Start a project</span>
            <span className="inline-block h-px w-8 bg-sl-mist/30 transition-all duration-500 group-hover:w-12 group-hover:bg-sl-gold-subtle" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeSections() {
  return (
    <>
      <SelectedWork />
      <TheProcess />
      <ThePhilosophy />
      <ContactCta />
    </>
  );
}
