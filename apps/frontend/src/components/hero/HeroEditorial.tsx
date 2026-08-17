'use client';

import Link from 'next/link';

export const HeroEditorial = () => {
  return (
    <section className="fixed inset-0 z-0 h-screen w-full overflow-hidden bg-[#0a0a0a] bg-[radial-gradient(circle_at_top_right,#171717,#0a0a0a)] text-white">
      {/* Decorative Element - Skipped by Screen Readers */}
      <div 
        className="absolute -top-1/4 -right-1/4 size-[800px] border-[50px] border-white/5 rounded-full pointer-events-none"
        aria-hidden="true" 
      />

      {/* Meta Labels */}
      <nav className="absolute top-8 left-8 flex flex-col gap-2" aria-label="Editorial Metadata">
        <span className="text-[10px] tracking-[0.3em] font-mono text-white/40 uppercase">Hexa Studio / Editorial</span>
        <span className="text-[10px] tracking-[0.3em] font-mono text-white/40 uppercase">Est. 2024</span>
      </nav>

      {/* Main Title */}
      <header className="absolute bottom-8 left-8">
        <h1 className="font-serif text-[clamp(4rem,15vw,12rem)] leading-[0.8] tracking-tight">
          <span className="sr-only">Raw Vision</span>
          <span aria-hidden="true">RAW<br />VISION</span>
        </h1>
        <Link
          href="/projects"
          className="mt-8 inline-block font-mono text-sm tracking-widest text-[#ff3e00] underline underline-offset-4 decoration-2 decoration-[#ff3e00]/30 transition-colors hover:text-white"
        >
          [ ENTER PROJECT ]
        </Link>
      </div>
    </section>
  );
};
