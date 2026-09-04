import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio | HEXA Studio',
  description:
    'HEXA Studio creative studio — architectural visualization, XR experiences, and next-generation design workflows.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
