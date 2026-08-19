'use client';

import { ShimmerSkeleton } from '@/components/ui/ShimmerSkeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12" aria-hidden="true">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden rounded-2xl border border-border/20 bg-surface p-6 sm:p-8 lg:p-10">
        <div className="space-y-4">
          <ShimmerSkeleton variant="text" className="h-4 w-40" />
          <ShimmerSkeleton variant="text" className="h-8 w-80" />
          <ShimmerSkeleton variant="text" className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-6 border-t border-border/15">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-border/15 space-y-2">
              <ShimmerSkeleton variant="text" className="h-3 w-24" />
              <ShimmerSkeleton variant="text" className="h-8 w-16" />
            </div>
          ))}
        </div>
      </section>

      {/* KPI cards skeleton */}
      <section aria-label="Key performance indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="artisan-glass relative overflow-hidden rounded-xl p-6 space-y-3">
              <ShimmerSkeleton variant="rect" className="h-10 w-10" />
              <ShimmerSkeleton variant="text" className="h-8 w-24" />
              <ShimmerSkeleton variant="text" className="h-3 w-16" />
            </div>
          ))}
        </div>
      </section>

      {/* Two-column layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/20 bg-surface p-6 space-y-4">
              <ShimmerSkeleton variant="text" className="h-5 w-48" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="p-4 rounded-xl bg-white/[0.02] border border-border/15 space-y-2">
                  <ShimmerSkeleton variant="text" className="h-4 w-64" />
                  <ShimmerSkeleton variant="text" className="h-3 w-40" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-border/20 bg-surface p-6 space-y-4">
            <ShimmerSkeleton variant="text" className="h-5 w-40" />
            <div className="flex justify-center">
              <ShimmerSkeleton variant="rect" className="h-36 w-36 rounded-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <ShimmerSkeleton variant="text" className="h-3 w-20" />
                    <ShimmerSkeleton variant="text" className="h-3 w-8" />
                  </div>
                  <ShimmerSkeleton variant="rect" className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
