'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';

/**
 * SmoothScroll — Lenis-powered smooth scrolling synced to GSAP's ticker.
 *
 * Phase 1 contract (MOTION_SYSTEM.md + quality policy):
 * - NOT initialized when reduced-motion/paused (`staticMode`) or when the
 *   detected quality tier is `low` — native scrolling remains.
 * - Driven by `gsap.ticker` (with `lagSmoothing(0)`) so Lenis, ScrollTrigger
 *   and every GSAP animation share a single clock; `ScrollTrigger.update`
 *   fires on every Lenis scroll event.
 * - Anchor links are intercepted by Lenis itself (`anchors: true`) so in-page
 *   `#hash` navigation stays smooth; browser back/forward is untouched.
 * - The ticker is rAF-driven, so it pauses automatically while the tab is
 *   hidden; the instance is destroyed cleanly on unmount or policy change.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { staticMode, finePointer } = useMotionPolicy();
  const { tier } = useQualityTier();
  const isLowQuality = tier.level === 'low';

  useEffect(() => {
    // Native-scroll mode: reduced motion, paused animations, or low tier.
    // Guarantee no stale instance survives a policy change.
    if (staticMode || isLowQuality) {
      if (window.__lenis) {
        window.__lenis.destroy();
        window.__lenis = undefined;
      }
      return;
    }

    let cancelled = false;
    let detachGsap: (() => void) | null = null;
    let fallbackRafId: number | null = null;

    const lenis = new Lenis({
      duration: 1.2,
      // easeOutExpo-equivalent curve (see src/lib/motion/tokens.ts).
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      // Lower touch multiplier on fine pointers; on coarse we keep smooth
      // scroll but at a reduced multiplier to avoid gesture conflicts.
      touchMultiplier: finePointer ? 2 : 1.5,
      // Smooth in-page anchor navigation (#hash links).
      anchors: true,
      infinite: false,
    });
    window.__lenis = lenis;

    // Bridge Lenis into GSAP: one shared clock for scroll + animation.
    // Loaded dynamically so GSAP stays out of the critical path.
    const wireGsapBridge = async () => {
      try {
        const [gsapModule, scrollTriggerModule] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);
        if (cancelled) return;

        const gsap = gsapModule.default;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);
        gsap.ticker.lagSmoothing(0);

        const raf = (time: number) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(raf);
        lenis.on('scroll', ScrollTrigger.update);

        detachGsap = () => {
          gsap.ticker.remove(raf);
          lenis.off('scroll', ScrollTrigger.update);
        };
      } catch {
        // GSAP is an enhancement: if it fails to load, keep Lenis alive on a
        // plain rAF loop so smooth scroll still works.
        if (cancelled) return;
        const fallbackLoop = (time: number) => {
          lenis.raf(time);
          fallbackRafId = requestAnimationFrame(fallbackLoop);
        };
        fallbackRafId = requestAnimationFrame(fallbackLoop);
      }
    };
    void wireGsapBridge();

    return () => {
      cancelled = true;
      detachGsap?.();
      if (fallbackRafId !== null) {
        cancelAnimationFrame(fallbackRafId);
      }
      lenis.destroy();
      if (window.__lenis === lenis) {
        window.__lenis = undefined;
      }
    };
  }, [staticMode, finePointer, isLowQuality]);

  return <>{children}</>;
}
