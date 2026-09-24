'use client';

/** Enhanced skeleton shown while the canvas hero hydrates. */
export function NewHomeHeroSkeleton() {
  return (
    <section
      aria-label="Loading"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-sl-void"
    >
      {/* Ambient shimmer background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sl-void via-sl-obsidian to-sl-void" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Main content with staggered reveal */}
      <div className="relative z-10 mx-auto max-w-[1600px] px-6 py-12 sm:px-10 md:px-16 md:py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
          {/* Left type stack skeleton */}
          <div className="md:col-span-7 space-y-6">
            {/* Kicker */}
            <div className="h-3 w-48 animate-pulse rounded-full bg-sl-gold-subtle/10" />

            {/* Main heading */}
            <div className="space-y-3">
              <div className="h-16 w-3/4 animate-pulse rounded-lg bg-sl-alabaster/5" />
              <div className="h-16 w-1/2 animate-pulse rounded-lg bg-sl-alabaster/5" style={{ animationDelay: '100ms' }} />
            </div>

            {/* Description */}
            <div className="space-y-2 pt-4">
              <div className="h-4 w-full animate-pulse rounded-full bg-sl-mist/5" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-sl-mist/5" style={{ animationDelay: '150ms' }} />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:gap-6">
              <div className="h-12 w-48 animate-pulse rounded-lg bg-sl-glass-border/20" />
              <div className="h-4 w-32 animate-pulse rounded-full bg-sl-mist/5" />
            </div>
          </div>

          {/* Right canvas plate skeleton */}
          <div className="md:col-span-5">
            <div className="relative aspect-square w-full max-w-[480px] mx-auto">
              {/* Frame */}
              <div className="absolute inset-0 border border-sl-gold-subtle/15 animate-pulse" />
              <div className="absolute inset-3 border border-sl-gold-subtle/8 animate-pulse" style={{ animationDelay: '200ms' }} />

              {/* Corner crops */}
              {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => {
                const map: Record<typeof corner, string> = {
                  tl: 'top-0 left-0 border-t border-l',
                  tr: 'top-0 right-0 border-t border-r',
                  bl: 'bottom-0 left-0 border-b border-l',
                  br: 'bottom-0 right-0 border-b border-r',
                };
                return (
                  <span
                    key={corner}
                    className={`pointer-events-none absolute h-4 w-4 animate-pulse border-sl-gold-subtle/60 ${map[corner]}`}
                    style={{ animationDelay: `${300 + (corner === 'tl' ? 0 : corner === 'tr' ? 100 : corner === 'bl' ? 200 : 300)}ms` }}
                  />
                );
              })}

              {/* Loading indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-sl-gold-subtle/30 border-t-sl-gold-subtle/80" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-sl-mist/30">
                    Loading Vision
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom scroll cue skeleton */}
        <div className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-6 pb-6 sm:px-10 md:px-16 md:pb-8 mt-8">
          <div className="h-2 w-16 animate-pulse rounded-full bg-sl-mist/10" />
          <div className="h-px flex-1 mx-6 bg-gradient-to-r from-sl-gold-subtle/10 via-sl-gold-subtle/10 to-transparent" />
          <div className="h-2 w-24 animate-pulse rounded-full bg-sl-mist/10" />
        </div>
      </div>
    </section>
  );
}
