import type { Metadata } from 'next';
import { Suspense } from 'react';
import { XRViewerClient } from './XRViewerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'XR Viewer',
    description: 'Interactive XR viewer for architectural visualization.',
    alternates: { canonical: 'https://hexastudio.net/xr-viewer' },
    openGraph: {
      title: 'HexaStudio XR Viewer',
      description: 'Explore architectural visualization in interactive XR.',
      url: 'https://hexastudio.net/xr-viewer',
      type: 'website',
      images: [
        {
          url: 'https://hexastudio.net/og/xr-viewer',
          width: 1200,
          height: 630,
          alt: 'HexaStudio XR Viewer',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HexaStudio XR Viewer',
      description: 'Explore architectural visualization in interactive XR.',
      images: ['https://hexastudio.net/og/xr-viewer'],
    },
  };
}

export default function XRViewerPage() {
  return (
    <Suspense fallback={null}>
      <XRViewerClient />
    </Suspense>
  );
}
