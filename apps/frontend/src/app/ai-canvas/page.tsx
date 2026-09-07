import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CanvasShowcase } from '@/components/ai-canvas/CanvasShowcase';
import { Personas } from '@/components/ai-canvas/Personas';
import { Integrations } from '@/components/ai-canvas/Integrations';
import { Pricing } from '@/components/ai-canvas/Pricing';
import { MeliusFAQ } from '@/components/ai-canvas/MeliusFaq';

export const metadata: Metadata = {
  title: 'Melius — the creative canvas for agents and AI models',
  description:
    'One platform. Every creative outcome. Brief our agent Mel, watch the work assemble, and steer any prompt until the output lands exactly as you imagined.',
  alternates: { canonical: 'https://www.melius.com/' },
  openGraph: {
    title: 'Melius — the creative canvas for agents and AI models',
    description:
      'One platform. Every creative outcome. Brief our agent Mel, watch the work assemble, and steer any prompt until the output lands exactly as you imagined.',
    url: 'https://www.melius.com/',
    siteName: 'Melius',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Melius — the creative canvas for agents and AI models',
    description:
      'One platform. Every creative outcome. Brief our agent Mel, watch the work assemble, and steer any prompt until the output lands exactly as you imagined.',
  },
};

export default function AiCanvasPage() {
  return (
    <div className="bg-[#050505] text-white antialiased">
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-white/60" />}>
        <main>
          <CanvasShowcase />
          <Personas />
          <Integrations />
          <Pricing />
          <MeliusFAQ />
        </main>
      </Suspense>
    </div>
  );
}
