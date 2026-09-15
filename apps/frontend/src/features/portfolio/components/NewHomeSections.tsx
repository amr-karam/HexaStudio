'use client';

import dynamic from 'next/dynamic';
import { NewStudioNote } from './NewStudioNote';

// Lazy-load the heavy SelectedWork gallery to keep initial bundle lean.
// Skeleton fallback keeps layout stable while the chunk loads.
const NewSelectedWork = dynamic(
  () => import('./NewSelectedWork').then((m) => m.NewSelectedWork),
  {
    ssr: false,
    loading: () => (
      <div aria-hidden="true" className="bg-sl-void px-6 py-24 md:px-16 md:py-32">
        <div className="mx-auto max-w-[1600px]">
          <div className="h-10 w-64 animate-pulse bg-sl-gold-subtle/10" />
          <div className="mt-12 grid grid-cols-1 gap-px sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse bg-sl-obsidian" />
            ))}
          </div>
        </div>
      </div>
    ),
  },
);

/**
 * NewHomeSections — the redesigned below-the-fold stack.
 *
 *  1. NewSelectedWork   (editorial 2x2 grid, no chips, no carousel)
 *  2. NewStudioNote     (one quiet editorial block, sets the studio's voice)
 */
export function NewHomeSections() {
  return (
    <>
      <NewSelectedWork />
      <NewStudioNote />
    </>
  );
}
