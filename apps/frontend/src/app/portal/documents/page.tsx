'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const DocumentCenterView = dynamic(
  () => import('@/features/portal/components/DocumentCenterView').then(m => m.DocumentCenterView),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[60vh] animate-pulse bg-white/[0.02] rounded-2xl border border-border/10 flex items-center justify-center">
        <div className="text-neutral-500 font-mono text-xs uppercase tracking-widest">Loading Document Center...</div>
      </div>
    )
  }
);

export default function DocumentsPage() {
  return (
    <Suspense fallback={null}>
      <DocumentCenterView />
    </Suspense>
  );
}
