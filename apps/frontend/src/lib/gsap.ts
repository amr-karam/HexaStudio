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

      if (typeof window !== 'undefined' && window.__lenis) {
        window.__lenis.on('scroll', ScrollTrigger.update);
      }

      return gsap;
    })();
  }
  return gsapPromise;
}
