'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { TextReveal } from '@/components/ui/TextReveal';
import { TeamSection } from '@/features/team/components/TeamSection';
import { makeTransition } from '@/lib/motion';
import Link from 'next/link';
import Image from 'next/image';

const milestones = [
  { year: '2020', label: 'Founded', description: 'HexaStudio was established with a vision to redefine architectural visualization.' },
  { year: '2021', label: 'First Major Project', description: 'Delivered award-winning visuals for a flagship commercial development.' },
  { year: '2023', label: '3D Expansion', description: 'Integrated real-time 3D experiences using React Three Fiber.' },
  { year: '2025', label: 'Global Reach', description: 'Partnered with architecture firms across 12 countries.' },
];

const values = [
  { title: 'Craft', description: 'Every pixel, every light, every shadow is deliberate.' },
  { title: 'Innovation', description: 'We push past traditional rendering into real-time immersion.' },
  { title: 'Collaboration', description: 'Your vision refined through our technical lens.' },
  { title: 'Precision', description: 'Architectural accuracy meets cinematic artistry.' },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 pt-20 overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        <div className="text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-8 block font-mono"
          >
            The Studio
          </motion.span>
          <div className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-foreground mb-12 leading-[0.9]">
            <TextReveal delay={0.1}>
              Vision <br />
              <span className="italic text-accent">Realized.</span>
            </TextReveal>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-neutral-400 text-lg font-light w-full max-w-4xl mx-auto leading-relaxed"
          >
            We are a multidisciplinary studio specializing in the intersection of architecture and digital art. 
            Our mission is to create photorealistic environments that transcend traditional rendering.
          </motion.p>
        </div>
      </section>

      <section className="px-8 md:px-16 py-32 bg-surface border-y border-border/50">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-square overflow-hidden bg-surface-light border border-border/30 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full relative"
              >
                <Image
                  src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80"
                  alt="Studio Space"
                  fill
                  className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              </motion.div>
              <div className="absolute inset-0 border-[30px] border-background/20 pointer-events-none group-hover:border-background/10 transition-all duration-700" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.5em] text-accent mb-6 block font-mono">Our Philosophy</span>
              <h2 className="text-4xl md:text-6xl font-serif font-light text-foreground mb-8 leading-tight">
                Precision in <br />Every Detail.
              </h2>
              <p className="text-neutral-400 font-light text-lg leading-relaxed mb-12">
                We believe that the difference between a good render and a masterpiece lies in the details. 
                From the way light hits a brushed metal surface to the subtle imperfection of a concrete wall, 
                we obsess over the physics of reality to create believable digital worlds.
              </p>
              <Link href="/contact">
                <Button variant="primary" size="lg">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-16 py-32 relative">
        <div className="w-full">
          <div className="text-center mb-24">
            <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono">Our Journey</span>
            <h2 className="text-5xl md:text-7xl font-serif font-light text-foreground">Evolution of Vision</h2>
          </div>
          <div className="relative border-s border-border/30 ms-4 md:ms-0 ps-8 space-y-24">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="absolute -start-[41px] top-0 w-4 h-4 bg-background border-2 border-accent rounded-full z-10" />
                <span className="text-3xl font-serif italic text-accent block mb-2">{m.year}</span>
                <h3 className="text-xl font-medium text-foreground mb-3">{m.label}</h3>
                <p className="text-neutral-500 font-light text-sm leading-relaxed w-full max-w-3xl">
                  {m.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 md:px-16 py-32 bg-surface/30 relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        <div className="w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={makeTransition('entrance', 'page', i * 0.1)}
              >
                <GlassCard variant="subtle" className="p-8 h-full group">
                  <h3 className="text-xl font-serif font-light text-foreground mb-4 group-hover:text-accent transition-colors duration-500">{v.title}</h3>
                  <p className="text-neutral-500 font-light text-sm leading-relaxed">
                    {v.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TeamSection />

      {/* CTA */}
      <section className="px-8 md:px-16 py-32 border-t border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        <div className="w-full text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            Work With Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-serif font-light tracking-tight text-foreground mb-8 leading-tight"
          >
            Ready to <span className="italic text-accent">Collaborate?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-neutral-400 font-light leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            We partner with architects, developers, and visionaries worldwide. Let&apos;s create something extraordinary together.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/contact">
              <Button variant="primary" size="lg" className="group">
                Start a Conversation
                <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
