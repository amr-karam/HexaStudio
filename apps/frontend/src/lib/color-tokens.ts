/**
 * HEXA Color Tokens — TypeScript mirror of CSS custom properties
 * ==================================================================
 *
 * Canonical color constants for use in Three.js materials, canvas rendering,
 * and GLSL shaders where CSS `var(--color-*)` references are NOT supported.
 * Every value mirrors the corresponding CSS token in `globals.css @theme`.
 *
 * Usage:
 *   import { GOLD, VOID, FOREGROUND } from '@/lib/color-tokens';
 *   new MeshStandardMaterial({ color: GOLD })
 *
 * Keep in sync with `apps/frontend/src/app/globals.css`.
 */
export const COLOR_TOKENS = {
  // Void / background family
  VOID: '#0A0A0B',
  VOID_DEEP: '#020203',
  OBSIDIAN: '#0F0F10',
  OBSIDIAN_RAISED: '#161618',
  SURFACE: '#1A1A1A',
  SURFACE_LIGHT: '#262626',
  SURFACE_DARK: '#030303',

  // Foreground / text family
  FOREGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#A0A0A0',
  TEXT_MUTED: '#6A6A6E',

  // Gold / accent family
  GOLD: '#D4AF37',
  GOLD_BRIGHT: '#E5C76B',
  GOLD_DEEP: '#A8862E',
  GOLD_RGB: '212, 175, 55',
} as const;

/** Individual named exports for ergonomic imports. */
export const {
  VOID,
  VOID_DEEP,
  OBSIDIAN,
  OBSIDIAN_RAISED,
  SURFACE,
  SURFACE_LIGHT,
  SURFACE_DARK,
  FOREGROUND,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  GOLD,
  GOLD_BRIGHT,
  GOLD_DEEP,
  GOLD_RGB,
} = COLOR_TOKENS;
