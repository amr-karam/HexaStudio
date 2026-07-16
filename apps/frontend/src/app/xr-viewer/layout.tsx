import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'XR Viewer — HEXA Studio',
  description: 'Immersive 3D architectural walkthrough in AR and VR',
};

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
