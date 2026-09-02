import type { Metadata } from 'next';
import PremiumChatClient from './PremiumChatClient';

export const metadata: Metadata = {
  title: 'Premium Chat',
  description:
    'Private concierge chat with the HEXA Studio atelier — bespoke conversations for architecture, visualization, and spatial intelligence.',
  openGraph: {
    title: 'HexaStudio Premium Chat — Private Atelier Concierge',
    description:
      'Private concierge chat with the HEXA Studio atelier — bespoke conversations for architecture and visualization.',
    url: 'https://hexastudio.net/premium-chat',
    type: 'website',
    images: [
      {
        url: 'https://hexastudio.net/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HexaStudio Premium Chat — Private Atelier Concierge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HexaStudio Premium Chat — Private Atelier Concierge',
    description:
      'Private concierge chat with the HEXA Studio atelier.',
    images: ['https://hexastudio.net/og-image.png'],
  },
};

export default function PremiumChatPage() {
  return <PremiumChatClient />;
}
