'use client';

declare global {
  interface Window {
    __lenis?: import('lenis').default;
  }
}

let gsapPromise: Promise<typeof import('gsap').default> | null = null;

export function getGsap(): Promise<typeof import('gsap').default> {
  if (!gsapPromise) {
    gsapPromise = (async () => {
      const [gsapModule, ScrollTriggerModule] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      const gsap = gsapModule.default;
      const { ScrollTrigger } = ScrollTriggerModule;
      gsap.registerPlugin(ScrollTrigger);

      // NOTE: The Lenis ↔ ScrollTrigger bridge (`lenis.on('scroll',
      // ScrollTrigger.update)` + gsap.ticker driving `lenis.raf`) is owned by
      // `SmoothScroll.tsx` (Phase 1). Wiring it here raced Lenis init, so this
      // loader intentionally stays side-effect free beyond plugin registration.

      return gsap;
    })();
  }
  return gsapPromise;
}
