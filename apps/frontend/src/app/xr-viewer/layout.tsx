import type { Metadata, Viewport } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'XR Viewer — HEXA Studio',
  description:
    'Immersive WebXR architectural visualization. Explore 1:1 scale AR projections and spatial models in your browser.',
  path: '/xr-viewer',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function XRViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
