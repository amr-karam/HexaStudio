import type { Metadata } from 'next';
import DemoCodeBlock from '@/components/ui/DemoCodeBlock';

export const metadata: Metadata = {
  title: 'Demo',
  description: 'Explore HexaStudio demo features and capabilities — architectural visualization components and interactive showcases.',
  openGraph: {
    title: 'HexaStudio Demo — Features & Capabilities',
    description: 'Explore HexaStudio demo features and capabilities.',
    url: 'https://hexastudio.net/demo',
    type: 'website',
    images: [
      {
        url: 'https://hexastudio.net/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HexaStudio Demo — Features & Capabilities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HexaStudio Demo — Features & Capabilities',
    description: 'Explore HexaStudio demo features and capabilities.',
    images: ['https://hexastudio.net/og-image.png'],
  },
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-sl-void text-sl-alabaster pt-28 pb-20">
      <section className="max-w-5xl mx-auto px-6 md:px-8" aria-label="Demo showcase">
        <DemoCodeBlock />
      </section>
    </div>
  );
}
