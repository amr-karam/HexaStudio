import '@testing-library/jest-dom/vitest';

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
