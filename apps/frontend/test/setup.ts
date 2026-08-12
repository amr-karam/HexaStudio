import '@testing-library/jest-dom/vitest';

// Next.js compiles styled-jsx (`<style jsx global>`) at build time via SWC,
// but Vitest renders it as a plain `<style>` element. React then warns about
// the `jsx` and `global` boolean attributes, which are build-time-only
// styled-jsx markers and never reach the real DOM. Filter those two known
// warnings while keeping every other console.error intact.
const styledJsxAttributeWarning = /non-boolean attribute `%s`/;
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = args.map(String).join(' ');
  if (
    styledJsxAttributeWarning.test(message) &&
    args.some((arg) => arg === 'jsx' || arg === 'global')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// jsdom does not implement IntersectionObserver, which components using
// framer-motion's useInView or IntersectionObserver rely on. Polyfill it.
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class MockIntersectionObserver implements IntersectionObserver {
    root = null;
    rootMargin = '';
    thresholds = [0];
    private callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).IntersectionObserver = MockIntersectionObserver;
}

// jsdom does not implement matchMedia, which HEXA's reduced-motion hooks
// (useReducedMotion, useHEXAMotion, useMediaQuery) rely on. Polyfill it so
// component tests render without throwing. Defaults to "no preference".
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
