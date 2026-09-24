'use client';

import { ArchvizViewer } from '@/components/ArchvizViewer';
import { Button } from '@/components/ui/Button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';

export default function StudioPage() {
  const reduced = useReducedMotion();

  return (
    <motion.section
      initial={reduced ? undefined : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1 }}
      transition={reduced ? undefined : { duration: 0.6 }}
      className="relative min-h-screen w-full bg-sl-void text-sl-alabaster"
    >
      <div className="mx-auto max-w-[1600px] px-6 py-24 sm:px-10 md:py-32">
        <header className="mb-16">
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-silver">
            STUDIO WORKSPACE
          </span>
          <h1 className="mt-4 font-serif text-[clamp(2rem,6vw,4rem)] font-light leading-[0.9] tracking-tight text-sl-alabaster">
            Architectural
            <br />
            <span className="text-sl-gold-hover">Visualization</span>
          </h1>
          <p className="mt-6 max-w-md text-sm font-light leading-relaxed text-sl-mist/60 sm:text-base">
            Interactive 3D review environment powered by glTF streaming
            and real-time ray tracing.
          </p>
        </header>

        {reduced ? (
          <div className="aspect-video w-full max-w-4xl rounded-xl border border-sl-gold-subtle/10 bg-sl-obsidian flex items-center justify-center">
            <span className="text-sl-mist/40">Reduced motion: static view</span>
          </div>
        ) : (
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={reduced ? undefined : { duration: 0.8, delay: 0.2 }}
            className="relative aspect-video w-full max-w-4xl"
          >
            <ArchvizViewer
              modelPath="/models/sample-building.glb"
              poster="/images/studio-poster.jpg"
              className="rounded-xl"
              camera={[0, 1.5, 5]}
            />
          </motion.div>
        )}

        <div className="mt-12 flex gap-4">
          <Button variant="primary" size="md">
            Request Review
          </Button>
          <Button variant="outline" size="md">
            Export Scene
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
