'use client'

import { HyperFramesPlayer } from '@/components/animation/HyperFramesPlayer';
import Link from 'next/link';

export function HyperFramesDemoClient() {
  return (
    <main className="min-h-screen bg-sl-void text-sl-alabaster pt-28 pb-20">
      <section className="mx-auto max-w-5xl px-6 md:px-8" aria-label="HyperFrames demo">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight">
            Hyper<span className="italic text-sl-gold-hover">Frames</span>
          </h1>
          <p className="mt-4 text-base md:text-lg font-light leading-relaxed text-sl-mist/70 max-w-2xl mx-auto">
            Cinematic composition engine for programmatic, deterministic motion design.
            Integrated into HexaStudio for programmatic video generation.
          </p>
        </header>

        <div className="space-y-8">
          <HyperFramesPlayer
            src="/compositions/hexa-brand-reveal/index.html"
            compositionId="hexa-brand-reveal"
            width={1920}
            height={1080}
            autoPlay
          />

          <div className="rounded-2xl border border-sl-silver/10 bg-sl-obsidian/40 p-6 md:p-8">
            <h2 className="text-xl font-serif font-light text-sl-alabaster mb-4">
              About HyperFrames
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-sl-mist/70">
              <p>
                HyperFrames renders video from HTML. A composition is an HTML file whose DOM
                declares timing with <code className="text-sl-gold-subtle">data-*</code> attributes,
                whose animation runtime is seekable, and whose media playback is owned by the framework.
              </p>
              <p>
                This integration adds HyperFrames as a dependency to the HexaStudio frontend,
                provides a React player component, and includes a sample brand-reveal composition.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="inline-block text-xs uppercase tracking-[0.25em] text-sl-mist/60 hover:text-sl-alabaster transition-colors"
            >
              Back to HexaStudio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
