import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'XR Viewer — HEXA Studio',
  description: 'Immersive 3D architectural walkthrough in AR and VR — experience spaces before they exist.',
  openGraph: {
    title: 'HexaStudio XR Viewer — Immersive Architectural Walkthrough',
    description: 'Immersive 3D architectural walkthrough in AR and VR.',
    url: 'https://hexastudio.net/xr-viewer',
    type: 'website',
    images: [
      {
        url: 'https://hexastudio.net/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HexaStudio XR Viewer — Immersive Architectural Walkthrough',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HexaStudio XR Viewer — Immersive Architectural Walkthrough',
    description: 'Immersive 3D architectural walkthrough in AR and VR.',
    images: ['https://hexastudio.net/og-image.png'],
  },
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
