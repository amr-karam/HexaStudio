import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Architectural Assistant',
  description:
    'Experience HexaStudio AI — intelligent spatial analysis, material suggestions, and real-time architectural design conversation.',
  openGraph: {
    title: 'HexaStudio AI — Architectural Design Assistant',
    description:
      'Intelligent spatial analysis, material suggestions, and real-time architectural design conversation.',
    url: 'https://hexastudio.net/ai',
    type: 'website',
    images: [
      {
        url: 'https://hexastudio.net/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HexaStudio AI — Architectural Design Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HexaStudio AI — Architectural Design Assistant',
    description:
      'Intelligent spatial analysis, material suggestions, and real-time architectural design conversation.',
    images: ['https://hexastudio.net/og-image.png'],
  },
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
