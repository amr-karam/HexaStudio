import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Creative Atelier',
  description:
    'HEXA Studio Creative Atelier — behind-the-scenes process, material studies, and experimental renders from our artist-led visualization lab.',
  path: '/studio/atelier',
});

export default function StudioAtelierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
