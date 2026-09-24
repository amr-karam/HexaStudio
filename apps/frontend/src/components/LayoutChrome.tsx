'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/ui/nav/Navbar';

const Footer = dynamic(
  () => import('@/components/ui/Footer').then((m) => ({ default: m.Footer })),
  { ssr: false },
);

const FULLSCREEN_ROUTES = ['/xr-viewer'];

export function LayoutChrome() {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname.startsWith(route));

  if (isFullscreen) return null;

  return (
    <>
      <Navbar />
      <Footer />
    </>
  );
}
