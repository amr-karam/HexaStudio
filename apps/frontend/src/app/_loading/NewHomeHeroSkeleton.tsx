'use client';

/**
 * Skeleton shown while the canvas hero hydrates.
 * Mirrors the hero grid (copy column + canvas frame column) so the
 * Suspense swap doesn't shift layout — same max-width, padding, and
 * aspect-square frame as NewHomeHero.
 */
export function NewHomeHeroSkeleton() {
  return (
    <section
      aria-label="Loading"
      className="relative min-h-screen w-full overflow-hidden bg-void"
    >
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-[1600px] grid-cols-1 items-center gap-12 px-6 py-20 sm:px-10 md:grid-cols-12 md:gap-16 md:px-16 md:py-32">
        <div className="md:col-span-7" aria-hidden="true">
          <div className="h-3 w-56 animate-pulse bg-gold/10" />
          <div className="mt-10 space-y-4">
            <div className="h-16 w-3/4 animate-pulse bg-text-primary/10" />
            <div className="h-16 w-1/2 animate-pulse bg-gold/10" />
            <div className="h-16 w-2/3 animate-pulse bg-text-primary/10" />
          </div>
          <div className="mt-10 h-4 w-80 max-w-full animate-pulse bg-text-muted/10" />
          <div className="mt-12 flex gap-6">
            <div className="h-[52px] w-[200px] animate-pulse rounded-full bg-gold/10" />
            <div className="h-[52px] w-32 animate-pulse bg-text-muted/10" />
          </div>
        </div>
        <div className="md:col-span-5" aria-hidden="true">
          <div className="relative mx-auto aspect-square w-full max-w-[480px] animate-pulse border border-gold/10 bg-gold/[0.03]" />
        </div>
      </div>
    </section>
  );
}
