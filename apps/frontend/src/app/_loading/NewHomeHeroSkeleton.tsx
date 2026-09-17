'use client';

/** Skeleton shown while the canvas hero hydrates. */
export function NewHomeHeroSkeleton() {
  return (
    <section
      aria-label="Loading"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-sl-void"
    >
      <div className="font-serif text-3xl font-light text-sl-gold-subtle/60">
        Loading…
      </div>
    </section>
  );
}
