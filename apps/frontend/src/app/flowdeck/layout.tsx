import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Flowdeck — Coming Soon',
  description:
    'Flowdeck is launching soon. Join the waitlist for early access to HEXA Studio next-generation creative workflow platform.',
  path: '/flowdeck',
});

export default function FlowdeckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
