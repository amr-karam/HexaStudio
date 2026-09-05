import type { Metadata } from 'next';
import { fetchServices } from '@/features/services/lib/fetchServices';
import { ServicesPageContent } from '@/features/services/components/ServicesPageContent';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Services',
    description: 'Professional 3D architectural visualization services — from concept to photorealistic rendering, real-time walkthroughs, and cinematic animation.',
    alternates: { canonical: 'https://hexastudio.net/services' },
    openGraph: {
      title: 'HexaStudio Services — Architectural Visualization',
      description: 'From photorealistic stills to interactive 3D walkthroughs — services born from curiosity and precision.',
      url: 'https://hexastudio.net/services',
      type: 'website',
      images: [
        {
          url: 'https://hexastudio.net/logo.svg',
          width: 1200,
          height: 630,
          alt: 'HexaStudio Services — Architectural Visualization',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HexaStudio Services — Architectural Visualization',
      description: 'From photorealistic stills to interactive 3D walkthroughs.',
      images: ['https://hexastudio.net/logo.svg'],
    },
  };
}

export default async function ServicesPage() {
  const data = await fetchServices();
  return <ServicesPageContent services={data.services} />;
}
