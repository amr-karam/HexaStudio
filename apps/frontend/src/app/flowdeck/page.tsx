import { siteTitleSegment } from '@/lib/site-title';
import FlowdeckClient from './FlowdeckClient';

export const revalidate = 3600;

export const generateMetadata = () => ({
  title: siteTitleSegment('Flowdeck — Coming Soon'),
  description: 'Flowdeck is launching soon. Join the waitlist for early access.',
  openGraph: {
    title: 'Flowdeck — Coming Soon',
    description: 'Flowdeck is launching soon. Join the waitlist for early access.',
    type: 'website',
  },
});

export default function FlowdeckPage() {
  return <FlowdeckClient />;
}