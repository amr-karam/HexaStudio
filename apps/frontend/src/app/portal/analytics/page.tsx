'use client';

/**
 * HEXA Portal — Analytics Page
 *
 * Full-page analytics dashboard with executive KPIs,
 * project progress, activity heatmaps, and financial overview.
 */

import React from 'react';
import { AnalyticsView } from '@/features/portal/components/AnalyticsView';

export default function AnalyticsPage() {
  return (
    <main
      className="min-h-screen bg-background"
      aria-label="Analytics Dashboard"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsView />
      </div>
    </main>
  );
}
