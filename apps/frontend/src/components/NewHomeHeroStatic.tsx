import Link from 'next/link';

/**
 * NewHomeHeroStatic — Server-rendered hero (LCP-critical).
 *
 * Replaces the previous all-client `NewHomeHero` on first paint so the headline,
 * type stack, and the gold "Architectural Plate" render immediately in the SSR HTML
 * with zero JS. The real-time canvas is mounted later as a non-blocking,
 * visibility-gated progressive enhancement by `HeroPlate`, which overlays this
 * static plate.
 *
 * @see PERFORMANCE.md §1 (LCP budget), ADR-019
 */
export default function NewHomeHeroStatic() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-sl-void">
      {/* Subtle grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />

      {/* Top metadata bar */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-6 font-mono text-[10px] uppercase tracking-[0.4em] text-sl-mist/40 sm:px-10 md:px-16 md:pt-8">
        <span>HEXA STUDIO · EST. 2024</span>
        <span className="hidden sm:inline">DARK · GOLD · SILENT</span>
        <span>N° 01 / VISION</span>
      </div>

      {/* Main composition: type on the left, static plate on the right */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-[1600px] grid-cols-1 items-center gap-8 px-6 py-12 sm:px-10 md:grid-cols-12 md:gap-12 md:px-16 md:py-20">
        {/* Type stack — left side, 7 cols (SSR LCP text) */}
        <div className="md:col-span-7">
          <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-sl-gold-subtle/70">
            <span className="inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
            <span className="ml-3">A studio of architectural vision</span>
          </div>

          <h1 className="mt-8 font-serif text-[clamp(2.75rem,8vw,7rem)] font-light leading-[0.95] tracking-[-0.02em] text-sl-alabaster">
            Living
            <br />
            <span className="italic text-sl-gold-hover">Spaces</span>
            <br />
            Visualized.
          </h1>

          <p className="mt-10 max-w-md text-sm font-light leading-relaxed text-sl-mist/70 sm:text-base">
            We render the spaces the world has not yet seen — photoreal, cinematic, built from
            the same light that will one day fall on the real thing.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link href="/projects" data-cursor="explore" className="inline-block">
              <button
                type="button"
                className="h-14 min-h-[52px] min-w-[200px] cursor-pointer px-8 text-base font-medium
                  bg-[var(--btn-primary-bg)] text-background shadow-lg shadow-[var(--btn-primary-shadow)]
                  hover:bg-[var(--btn-primary-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                View the Work
              </button>
            </Link>
            <Link
              href="/contact"
              data-cursor="explore"
              className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-sl-mist/70 transition-colors duration-500 hover:text-sl-gold-hover"
            >
              <span className="inline-block h-px w-8 bg-sl-mist/30 transition-all duration-500 group-hover:w-12 group-hover:bg-sl-gold-subtle" />
              Start a project
            </Link>
          </div>
        </div>

            {/* Static plate — right side, 5 cols. This inline SVG is the LCP fallback;
                the interactive canvas overlays this slot once it hydrates. */}
            <div
      </div>

      {/* Bottom hairline + scroll cue */}
      <div className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-6 pb-6 sm:px-10 md:px-16 md:pb-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-mist/40">SCROLL</span>
        <div className="mx-6 flex-1 h-px bg-gradient-to-r from-sl-gold-subtle/20 via-sl-gold-subtle/20 to-transparent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-mist/40">CH. 02 / CRAFT ↓</span>
      </div>
    </section>
  );
}

/**
 * Static stepped monolith (gold wireframe) — the no-JS LCP fallback for the
 * interactive canvas plate. Draws the same stepped volumes with isometric
 * projection so the page is never "blank" while JS loads.
 */
function MonolithPlate() {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-label=""
      className="absolute inset-0 h-full w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="320" y="320" width="1" height="1" fill="none" />
      {/* base slab */}
      <polygon
        points="95,210 225,210 245,250 75,250"
        fill="rgba(212,175,55,0.16)"
        stroke="rgba(212,175,55,0.55)"
        strokeWidth="1"
      />
      {/* lower block */}
      <polygon
        points="115,150 205,150 225,190 135,190"
        fill="rgba(212,175,55,0.12)"
        stroke="rgba(212,175,55,0.55)"
        strokeWidth="1"
      />
      {/* upper block */}
      <polygon
        points="130,100 190,100 210,140 150,140"
        fill="rgba(212,175,55,0.09)"
        stroke="rgba(212,175,55,0.55)"
        strokeWidth="1"
      />
      {/* cantilever */}
      <polygon
        points="210,120 250,120 270,150 230,150"
        fill="rgba(212,175,55,0.10)"
        stroke="rgba(212,175,55,0.55)"
        strokeWidth="1"
      />
    </svg>
  );
}
