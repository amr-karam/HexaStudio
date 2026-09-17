'use client';

import dynamic from 'next/dynamic';
import { NewStudioNote } from './NewStudioNote';

// Lazy-load the heavy SelectedWork gallery to keep initial bundle lean
const NewSelectedWork = dynamic(
  () => import('./NewSelectedWork').then((m) => m.NewSelectedWork),
  { ssr: false },
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
