import type { Metadata } from 'next';
import PremiumChatClient from './PremiumChatClient';

export const metadata: Metadata = {
  title: 'Premium Chat',
  description:
    'Private concierge chat with the HEXA Studio atelier — bespoke conversations for architecture, visualization, and spatial intelligence.',
};

export default function PremiumChatPage() {
  return <PremiumChatClient />;
}
