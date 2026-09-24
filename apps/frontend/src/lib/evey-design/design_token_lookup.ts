/**
 * design_token_lookup — HEXA STUDIO Design Token Lookup
 *
 * Provides programmatic access to the verified HEXA STUDIO design token set
 * sourced from `apps/frontend/src/app/globals.css` and `src/lib/motion.ts`.
 *
 * @module evey-design/design_token_lookup
 */

import { EASE, DURATION, STAGGER } from '../motion'
import type { Transition, Variants } from 'framer-motion'

/* -------------------------------------------------------------------------- */
/*  Token Definitions — Mirror of globals.css @theme + :root                 */
/* -------------------------------------------------------------------------- */

export interface ColorTokens {
  void: string
  voidDeep: string
  obsidian: string
  obsidianRaised: string
  slate: string
  surface: string
  surfaceLight: string
  surfaceDark: string
  foreground: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  gold: string
  goldBright: string
  goldDeep: string
  goldRGB: string
  alabaster: string
  onyx: string
  white: string
  black: string
  brandPrimary: string
  brandSecondary: string
  brandTertiary: string
  divider: string
  bg: string
  fg: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  input: string
  ring: string
  destructive: string
  destructiveForeground: string
  destructiveInk: string
  destructiveBright: string
  destructiveFaint: string
  destructiveSoft: string
  destructiveDark: string
  success: string
  successForeground: string
  successInk: string
  successBright: string
  successFaint: string
  successSoft: string
  successDark: string
  radius: string
  radiusSm: string
  radiusMd: string
  radiusLg: string
  radiusXl: string
  radius2xl: string
  radius3xl: string
  cssVar: Record<string, string>
}

export interface MotionTokens {
  easings: Record<string, readonly [number, number, number, number]>
  durations: Record<string, number>
  stagger: Record<string, number>
  transitions: Record<string, Transition>
  variants: Record<string, Variants>
}

export interface TypographyTokens {
  headingFont: string
  bodyFont: string
  monoFont: string
  headingTracking: string
  bodySize: string
  letterSpacingLabel: string
}

export type TokenLookupResult = {
  colors: ColorTokens
  motion: MotionTokens
  typography: TypographyTokens
}

/* -------------------------------------------------------------------------- */
/*  Canonical Token Map                                                      */
/* -------------------------------------------------------------------------- */

const COLORS: ColorTokens = {
  void: '#050505',
  voidDeep: '#020203',
  obsidian: '#0F0F10',
  obsidianRaised: '#161618',
  slate: '#1A1A1A',
  surface: '#1A1A1A',
  surfaceLight: '#262626',
  surfaceDark: '#030303',
  foreground: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#6A6A6E',
  gold: '#D4AF37',
  goldBright: '#E5C76B',
  goldDeep: '#A8862E',
  goldRGB: '212, 175, 55',
  alabaster: '#FAFAF8',
  onyx: '#1a1a1a',
  white: '#ffffff',
  black: '#000000',
  brandPrimary: '#60a5fa',
  brandSecondary: '#a855f7',
  brandTertiary: '#a855f7',
  divider: '#f5f5f4',
  bg: '#ffffff',
  fg: '#1a1a1a',
  card: '#ffffff',
  cardForeground: '#1a1a1a',
  popover: '#ffffff',
  popoverForeground: '#1a1a1a',
  primary: '#1a1a1a',
  primaryForeground: '#ffffff',
  secondary: '#f5f5f4',
  secondaryForeground: '#1a1a1a',
  muted: '#f5f5f4',
  mutedForeground: '#71717a',
  accent: '#f5f5f4',
  accentForeground: '#1a1a1a',
  border: '#f5f5f4',
  input: '#f5f5f4',
  ring: '#1a1a1a',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  destructiveInk: '#f87171',
  destructiveBright: '#fca5a5',
  destructiveFaint: '#7f1d1d',
  destructiveSoft: '#7f1d1d',
  destructiveDark: '#450a0a',
  success: '#10b981',
  successForeground: '#ffffff',
  successInk: '#34d399',
  successBright: '#6ee7b7',
  successFaint: '#064e3b',
  successSoft: '#064e3b',
  successDark: '#052e1d',
  radius: '0.5rem',
  radiusSm: 'calc(0.5rem - 2px)',
  radiusMd: 'calc(0.5rem + 0.25rem)',
  radiusLg: '0.5rem',
  radiusXl: '2rem',
  radius2xl: '4rem',
  radius3xl: '6rem',
  cssVar: {
    void: 'var(--color-void)',
    voidDeep: 'var(--color-void-deep)',
    obsidian: 'var(--color-obsidian)',
    obsidianRaised: 'var(--color-obsidian-raised)',
    slate: 'var(--color-slate)',
    gold: 'var(--color-gold)',
    goldBright: 'var(--color-gold-bright)',
    goldDeep: 'var(--color-gold-deep)',
    alabaster: 'var(--color-sl-alabaster)',
    onyx: 'var(--color-sl-onyx)',
    bg: 'var(--background)',
    fg: 'var(--foreground)',
    card: 'var(--card)',
    primary: 'var(--primary)',
    accent: 'var(--accent)',
    border: 'var(--border)',
    radius: 'var(--radius)',
    brandPrimary: 'var(--color-brand-primary)',
    brandSecondary: 'var(--color-brand-secondary)',
    goldSubtle: 'var(--color-sl-gold-subtle)',
  },
}

const TYPOGRAPHY: TypographyTokens = {
  headingFont: 'Playfair Display',
  bodyFont: 'Inter',
  monoFont: 'JetBrains Mono',
  headingTracking: '-0.02em',
  bodySize: '1rem',
  letterSpacingLabel: '0.25em',
}

/* -------------------------------------------------------------------------- */
/*  Motion Token Resolver                                                    */
/* -------------------------------------------------------------------------- */

function buildMotionTokens(): MotionTokens {
  const easings: Record<string, readonly [number, number, number, number]> = {}
  for (const [key, value] of Object.entries(EASE)) {
    easings[key] = value
  }

  const durations: Record<string, number> = {}
  for (const [key, value] of Object.entries(DURATION)) {
    durations[key] = value
  }

  const stagger: Record<string, number> = {}
  for (const [key, value] of Object.entries(STAGGER)) {
    stagger[key] = value
  }

  const transitions: Record<string, Transition> = {}
  const variants: Record<string, Variants> = {}

  return { easings, durations, stagger, transitions, variants }
}

const MOTION = buildMotionTokens()

/* -------------------------------------------------------------------------- */
/*  Category Data Map                                                        */
/* -------------------------------------------------------------------------- */

const CATEGORY_DATA: Record<string, Record<string, unknown>> = {
  colors: COLORS as unknown as Record<string, unknown>,
  motion: MOTION as unknown as Record<string, unknown>,
  typography: TYPOGRAPHY as unknown as Record<string, unknown>,
}

/* -------------------------------------------------------------------------- */
/*  Main Lookup Function                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Look up HEXA STUDIO design tokens by category and optional keys.
 *
 * @param category - 'colors' | 'motion' | 'typography' — defaults to all
 * @param keys - Optional specific token keys to retrieve
 * @returns Token data matching the requested category and keys
 */
export function design_token_lookup(
  category?: 'colors' | 'motion' | 'typography',
  keys?: string[],
): TokenLookupResult {
  const result: TokenLookupResult = {
    colors: COLORS,
    motion: MOTION,
    typography: TYPOGRAPHY,
  }

  if (!category) return result

  if (keys && keys.length > 0) {
    const catData = CATEGORY_DATA[category]
    const filtered: Record<string, unknown> = {}
    for (const key of keys) {
      if (key in catData) {
        filtered[key] = catData[key]
      }
    }
    return {
      ...result,
      [category]: filtered as unknown as ColorTokens | MotionTokens | TypographyTokens,
    } as TokenLookupResult
  }

  return {
    ...result,
    [category]: result[category],
  } as TokenLookupResult
}

type CategoryKeys = 'colors' | 'motion' | 'typography'

/**
 * Resolve a CSS custom property reference to its hex value.
 */
export function resolveToken(name: string): string | undefined {
  if (COLORS.cssVar[name]) return COLORS.cssVar[name]
  const key = name.replace(/^--/, '') as keyof ColorTokens
  if (key in COLORS && typeof COLORS[key] === 'string') {
    return COLORS[key] as string
  }
  return undefined
}

/**
 * Get all CSS custom property declarations for the design token system.
 */
export function getCSSCustomProperties(): string {
  const entries = Object.entries(COLORS.cssVar).map(([name, value]) => `  ${name}: ${value};`)
  return `:root {\n${entries.join('\n')}\n}`
}

/**
 * Get all available token categories.
 */
export function getTokenCategories(): string[] {
  return ['colors', 'motion', 'typography']
}

/**
 * Get all token names for a given category.
 */
export function getTokenNames(category: CategoryKeys): string[] {
  const catData = CATEGORY_DATA[category]
  return catData ? Object.keys(catData) : []
}
