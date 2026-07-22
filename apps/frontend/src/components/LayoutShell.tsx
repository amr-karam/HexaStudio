'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/ui/nav/Navbar';
import { Footer } from '@/components/ui/Footer';
import { PageTransition } from '@/components/PageTransition';
import { SmoothScrollWrapper } from '@/components/SmoothScrollWrapper';
import { CustomCursor } from '@/components/CustomCursor';
import { BackToTop } from '@/components/BackToTop';
import { GrainOverlay } from '@/components/animation';
import CursorTrail from '@/components/effects/CursorTrail';

const FULLSCREEN_ROUTES = ['/xr-viewer'];

/** Marketing routes that benefit from the ambient WebGL background. */
const AMBIENT_ROUTES = ['/', '/about', '/services', '/projects', '/blog', '/contact'];

/** Dynamic import — AmbientScene and its R3F/Three deps only load on marketing routes. */
const AmbientScene = dynamic(
  () => import('@/components/effects/AmbientScene').then((m) => m.default),
  { ssr: false },
);

export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname.startsWith(route));

  if (isFullscreen) {
    return <>{children}</>;
  }

  const showAmbient = AMBIENT_ROUTES.some(
    (route) => pathname === route || (route !== '/' && pathname.startsWith(route)),
  );

  return (
    <SmoothScrollWrapper>
      <Navbar />
      <PageTransition>
        <main id="main-content" tabIndex={-1}>{children}</main>
      </PageTransition>
      <Footer />
      <CustomCursor />
      <CursorTrail />
      <BackToTop />
      <GrainOverlay />
      {showAmbient && <AmbientScene />}
    </SmoothScrollWrapper>
  );
}
