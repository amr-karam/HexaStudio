'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Navbar } from '@/components/ui/nav/Navbar';
import { Footer } from '@/components/ui/Footer';
import { PageTransition } from '@/components/PageTransition';
import { SmoothScrollWrapper } from '@/components/SmoothScrollWrapper';
import { CustomCursor } from '@/components/CustomCursor';
import { BackToTop } from '@/components/BackToTop';
import { GrainOverlay } from '@/components/animation';

const FULLSCREEN_ROUTES = ['/xr-viewer'];

export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname.startsWith(route));

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <SmoothScrollWrapper>
      <Navbar />
      <PageTransition>
        <main id="main-content" tabIndex={-1}>{children}</main>
      </PageTransition>
      <Footer />
      <CustomCursor />
      <BackToTop />
      <GrainOverlay />
    </SmoothScrollWrapper>
  );
}
