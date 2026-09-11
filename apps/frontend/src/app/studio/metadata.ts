/**
 * studio/metadata.ts — Server-side metadata for the /studio route
 * HEXA Studio — Sprint S022.2
 *
 * Separated from page.tsx (which is a "use client" component) to avoid:
 * "You are attempting to export 'metadata' from a component marked with
 * 'use client', which is disallowed."
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Studio | HEXA Studio | HexaStudio',
  description:
    'HEXA Studio creative studio — architectural visualization, XR experiences, and next-generation design workflows.',
  openGraph: {
    title: 'HexaStudio Studio — The Creative Process',
    description:
      'Immersive 3D architectural visualization, cinematic walkthroughs, and spatial intelligence.',
    url: 'https://hexastudio.net/studio',
    type: 'website',
    images: [
      {
        url: 'https://hexastudio.net/logo.svg',
        width: 1200,
        height: 630,
        alt: 'HexaStudio Studio — The Creative Process',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HexaStudio Studio — The Creative Process',
    description:
      'Immersive 3D architectural visualization, cinematic walkthroughs, and spatial intelligence.',
    images: ['https://hexastudio.net/logo.svg'],
  },
}

export default metadata
