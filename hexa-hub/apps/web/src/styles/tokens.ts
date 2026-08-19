/**
 * HEXA STUDIO — Design Tokens (TypeScript Mirror of CSS Custom Properties)
 * Canonical values live in src/app/globals.css. This file mirrors them as
 * typed constants so React inline styles and JS calculations stay in sync.
 */

export interface DesignTokens {
  colors: {
    void: string;
    voidDeep: string;
    obsidian: string;
    obsidianRaised: string;
    slate: string;
    border: string;
    borderHover: string;
    gold: string;
    goldBright: string;
    goldDeep: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: Record<string, number>;
  borderRadius: Record<string, number>;
  fontSize: Record<string, { size: string; lineHeight: number }>;
  motion: {
    ease: Record<string, [number, number, number, number]>;
    duration: Record<string, number>;
    stagger: Record<string, number>;
  };
  shadows: Record<string, string>;
  zIndex: Record<string, number>;
  baseUnit: number;
}

export const designTokens: DesignTokens = {
  baseUnit: 4,
  colors: {
    /* Void (60% canvas) */
    void: 'var(--color-void-deep)',
    voidDeep: '#020203',
    /* Obsidian & Slate (30% surfaces) */
    obsidian: '#0F0F10',
    obsidianRaised: '#161618',
    slate: '#1A1A1A',
    /* Borders */
    border: 'var(--color-border)',
    borderHover: '#2A2A2A',
    /* Gold (10% — HEXA signature) */
    gold: '#D4AF37',
    goldBright: '#E5C76B',
    goldDeep: '#A8862E',
    /* Text */
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textMuted: '#707075',
    /* Status */
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    '4xl': 64,
    '5xl': 96,
    '6xl': 128,
    '7xl': 192,
    '8xl': 256,
    '9xl': 320,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    '2xl': 28,
    full: 9999,
  },
  fontSize: {
    xs: { size: '0.625rem', lineHeight: 1.0 },
    sm: { size: '0.8125rem', lineHeight: 1.25 },
    base: { size: '0.9375rem', lineHeight: 1.5 },
    lg: { size: '1.0625rem', lineHeight: 1.5 },
    xl: { size: '1.1875rem', lineHeight: 1.5 },
    '2xl': { size: '1.5rem', lineHeight: 1.25 },
    '3xl': { size: '1.875rem', lineHeight: 1.25 },
    '4xl': { size: '2.4375rem', lineHeight: 1.1 },
    '5xl': { size: '3.75rem', lineHeight: 1.0 },
  },
  motion: {
    ease: {
      entrance: [0.16, 1, 0.3, 1],
      interaction: [0.34, 1.56, 0.64, 1],
      transition: [0.25, 0.1, 0.25, 1],
      sharp: [0.4, 0, 0.6, 1],
      cinematic: [0.76, 0, 0.24, 1],
    },
    duration: {
      micro: 0.2,
      component: 0.4,
      scene: 0.8,
      transition: 0.7,
      page: 0.75,
      camera: 1.4,
    },
    stagger: {
      char: 0.03,
      card: 0.08,
      line: 0.05,
    },
  },
  shadows: {
    elevation0: '0 0 0 0 rgba(0, 0, 0, 0)',
    elevation1: '0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    elevation2: '0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
    elevation3: '0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
    elevation4: '0 20px 24px 4px rgba(0, 0, 0, 0.10), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
    gold: '0 0 30px 0 rgba(212, 175, 55, 0.15)',
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    toast: 1900,
    above: 2000,
    below: -2000,
  },
};

/** Convenience CSS-variable string generator for inline styles. */
export const cssVar = (name: string, fallback?: string): string => {
  const val = `var(--${name})`;
  return fallback ? `${val}, ${fallback}` : val;
};

/** Hex → rgba helper for runtime alpha compositing. */
export const hexToRgba = (hex: string, alpha = 1): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 2 + ((h.length - 2) >> 1)), 16);
  const b = parseInt(h.slice(h.length - 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default designTokens;
