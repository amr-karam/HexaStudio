import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Photographer',
  description:
    'Photography by HexaStudio — capturing light, form, and atmosphere across architectural projects. Editorial framing, natural studies, and commissioned work.',
  path: '/photographer',
});

export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
