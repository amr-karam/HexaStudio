"use client";

import { Suspense } from "react";
import { Toaster } from "sonner";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { AnalyticsInit } from "@/lib/analytics";
import { WebVitals } from "@/components/WebVitals";
import { LivePreview } from "@/components/LivePreview";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CinematicPreloaderMount } from "@/components/ui/overlays/CinematicPreloaderMount";
import { AnimationDebugLoader } from "@/components/dev/AnimationDebugLoader";

/**
 * App-wide interactive widgets (client-only). Rendered as a LEAF boundary that
 * does NOT wrap the page content, so it cannot force the SSR hero to bail to
 * client-side rendering. Contains the only non-deterministic client hook in the
 * layout (usePerformanceMonitor) plus the deferred/optional monitoring widgets.
 */
export function AppLayoutWidgets() {
  usePerformanceMonitor({ enabled: true });

  return (
    <>
      <CinematicPreloaderMount />
      {process.env.NODE_ENV === "development" && <AnimationDebugLoader />}
      <Suspense fallback={null}>
        <AnalyticsInit />
      </Suspense>
      <WebVitals />
      <LivePreview />
      <ScrollToTop />
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        theme="dark"
      />
    </>
  );
}
