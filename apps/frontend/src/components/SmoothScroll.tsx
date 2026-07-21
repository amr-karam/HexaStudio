"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useMotionPolicy } from "@/hooks/useMotionPolicy";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number>(0);
  const { staticMode, finePointer } = useMotionPolicy();

  useEffect(() => {
    // Cancel any existing RAF and destroy Lenis before deciding
    cancelAnimationFrame(rafIdRef.current);
    if (lenisRef.current) {
      lenisRef.current.destroy();
      lenisRef.current = null;
      window.__lenis = undefined;
    }

    // When in static mode (reduced-motion or paused), don't initialise Lenis
    if (staticMode) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      // Lower touch multiplier on fine pointer; on coarse we still allow smooth
      // scroll but at a reduced multiplier to avoid gesture conflicts.
      touchMultiplier: finePointer ? 2 : 1.5,
      infinite: false,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;

    function onFrame(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(onFrame);
    }
    rafIdRef.current = requestAnimationFrame(onFrame);

    // Pause when tab is hidden
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafIdRef.current);
      } else {
        rafIdRef.current = requestAnimationFrame(onFrame);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.__lenis = undefined;
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [staticMode, finePointer]);

  return <>{children}</>;
}
