'use client';

/**
 * HEXA Portal — Analytics Page
 *
 * Full-page analytics dashboard with executive KPIs,
 * project progress, activity heatmaps, and financial overview.
 */

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const AnalyticsView = dynamic(
  () => import('@/features/portal/components/AnalyticsView').then(m => m.AnalyticsView),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[60vh] animate-pulse bg-white/[0.02] rounded-2xl border border-border/10 flex items-center justify-center">
        <div className="text-neutral-500 font-mono text-xs uppercase tracking-widest">Loading Analytics View...</div>
      </div>
    )
  }
);

export default function AnalyticsPage() {
  return (
    <main
      className="min-h-screen bg-background"
      aria-label="Analytics Dashboard"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={null}>
          <AnalyticsView />
        </Suspense>
      </div>
    </main>
  );
}
