import type { Metadata } from 'next';
import { siteTitleSegment } from '@/lib/site-title';

export const metadata: Metadata = {
  title: siteTitleSegment('Flowdeck — Coming Soon'),
  description: 'Flowdeck is launching soon. Join the waitlist for early access.',
  openGraph: {
    title: 'Flowdeck — Coming Soon',
    description: 'Flowdeck is launching soon. Join the waitlist for early access.',
    type: 'website',
  },
};

export default function FlowdeckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
