'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * NewStudioNote — single editorial text block instead of crowded section grids.
 * Sets the studio's voice; one paragraph, one quote, one CTA.
 */
export function NewStudioNote() {
  return (
    <section
      id="studio-note"
      className="relative bg-sl-obsidian px-6 py-32 sm:px-10 md:px-16 md:py-48"
    >
      {/* Top + bottom hairlines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />

      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-[10px] uppercase tracking-[0.5em] text-sl-gold-subtle/70"
        >
          <span className="mr-3 inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
          Ch. 03 — Studio Note
          <span className="ml-3 inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
        </motion.div>

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 font-serif text-[clamp(1.5rem,3.5vw,2.75rem)] font-light leading-[1.25] tracking-[-0.01em] text-sl-alabaster"
        >
          We do not render buildings. We render{' '}
          <span className="italic text-sl-gold-hover">the moment a building becomes real</span>{' '}
          — the first light, the first step inside, the first silence.
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.4 }}
          className="mt-12 text-sm font-light leading-relaxed text-sl-mist/60"
        >
          A small studio in Cairo and Dubai. Twenty-two projects shipped in 2025. One engineer, one
          artist, one obsession with how light behaves.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.55 }}
          className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8"
        >
          <Link
            href="/about"
            className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-sl-mist/70 transition-colors duration-500 hover:text-sl-gold-hover"
          >
            About the studio
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
          <span className="hidden h-3 w-px bg-sl-mist/30 sm:inline-block" />
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-sl-gold-hover transition-colors duration-500"
          >
            Begin a project
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
