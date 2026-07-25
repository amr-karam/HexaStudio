'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/ui/nav/Navbar';
import { Footer } from '@/components/ui/Footer';
import { PageTransition } from '@/components/PageTransition';
import { SmoothScrollWrapper } from '@/components/SmoothScrollWrapper';

import { GrainOverlay } from '@/components/animation';

const FULLSCREEN_ROUTES = ['/xr-viewer'];

/** Marketing routes that benefit from the ambient WebGL background. */
const AMBIENT_ROUTES = ['/', '/about', '/services', '/projects', '/blog', '/contact'];

/** Dynamic import — AmbientScene and its R3F/Three deps only load on marketing routes. */
const AmbientScene = dynamic(
  () => import('@/components/effects/AmbientScene').then((m) => m.default),
  { ssr: false },
);

/**
 * TBT-optimized dynamic imports (S-018):
 * CustomCursor initializes framer-motion springs + global mouse listeners;
 * CursorTrail sets up a canvas RAF loop. Both are irrelevant on touch devices
 * and should not block initial hydration on any device — defer via next/dynamic.
 */
const CustomCursor = dynamic(
  () => import('@/components/CustomCursor').then((m) => ({ default: m.CustomCursor })),
  { ssr: false },
);

const CursorTrail = dynamic(
  () => import('@/components/effects/CursorTrail'),
  { ssr: false },
);

/**
 * TBT optimization (S-018): BackToTop is below-the-fold and only appears
 * after the user scrolls > 600px. Defer hydration until then by lazy-loading
 * with ssr: false; the framer-motion dependency is split into its own chunk.
 */
const BackToTop = dynamic(
  () => import('@/components/BackToTop').then((m) => ({ default: m.BackToTop })),
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