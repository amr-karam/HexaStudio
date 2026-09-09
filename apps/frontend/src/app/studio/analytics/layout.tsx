import { createMetadata, NOINDEX } from '@/lib/seo';

export const metadata = {
  ...createMetadata({
    title: 'Analytics',
    description:
      'Real-time WebGL rendering telemetry and performance analytics for HEXA Studio immersive 3D architectural visualization platform.',
    path: '/studio/analytics',
  }),
  robots: NOINDEX,
};

export default function StudioAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
