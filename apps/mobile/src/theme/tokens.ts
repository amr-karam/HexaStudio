/**
 * HEXA Studio — Mobile Design Tokens
 *
 * Canonical luxury design tokens translated from the HEXA Vision Design System
 * (07-DESIGN/DESIGN_SYSTEM.md, COLORS.md, TYPOGRAPHY.md).
 *
 * 60-30-10 Rule:
 *   60% Void Black (background, negative space)
 *   30% Obsidian/Slate (surfaces, structure)
 *   10% Gold/White (accents, highlights, typography)
 *
 * @module theme/tokens
 */

/* ------------------------------------------------------------------ */
/*  COLOR TOKENS                                                       */
/* ------------------------------------------------------------------ */

/** The "Void" Base — neutrals providing depth and structure */
export const colors = {
  // Backgrounds (60%)
  void: '#050505', // Primary background — pure depth
  voidDeep: '#020203', // Deepest black — used for immersive areas
  obsidian: '#0F0F10', // Surface level 1 — cards
  obsidianRaised: '#161618', // Surface level 2 — elevated cards
  obsidianGlass: 'rgba(18, 18, 20, 0.55)', // Glassmorphism backdrop

  // Structure (30%)
  slate: '#1A1A1A', // Dividers, borders base
  slateLight: '#2A2A2C', // Lighter borders
  border: '#333333', // Standard border
  borderSubtle: 'rgba(255, 255, 255, 0.06)', // Hairline border
  borderGlass: 'rgba(255, 255, 255, 0.08)', // Glass border
  borderGold: 'rgba(212, 175, 55, 0.35)', // Glass gold border (hover)

  // Typography (10% — gold/white)
  textPrimary: '#FFFFFF', // Headings, high-contrast text
  textSecondary: '#A0A0A0', // Body text, captions
  textMuted: '#6A6A6E', // Tertiary, timestamps

  // Accents
  gold: '#D4AF37', // HEXA signature gold — primary CTA
  goldBright: '#E5C76B', // Champagne — lighter gold for gradients
  goldDeep: '#A8862E', // Deep gold — pressed states
  silver: '#C0C0C0', // Electric silver — technical accents
  ivory: '#F5F5F0', // Ivory — soft white
  crimson: '#B22222', // Warning crimson — critical errors only
  crimsonBright: '#EF4444', // Bright error red

  // Semantic — status
  statusPaid: '#22C55E', // Paid / completed / success
  statusPending: '#D4AF37', // Pending / in-progress (gold)
  statusOverdue: '#EF4444', // Overdue / failed
  statusDraft: '#6B7280', // Draft / neutral
} as const;

/** Gold gradient stops for shimmer effects */
export const goldGradient = {
  light: '#F7E7A8',
  base: '#D4AF37',
  deep: '#A8862E',
} as const;

/* ------------------------------------------------------------------ */
/*  SPACING TOKENS                                                     */
/* ------------------------------------------------------------------ */

/**
 * Golden ratio (1.618) spacing scale.
 * All margins, padding, and gaps must use these tokens.
 */
export const spacing = {
  /** 4px — hairline */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px — base unit */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  xl2: 24,
  /** 32px */
  xl3: 32,
  /** 48px */
  xl4: 48,
  /** 64px */
  xl5: 64,
  /** 80px — section gap */
  xl6: 80,
} as const;

/* ------------------------------------------------------------------ */
/*  TYPOGRAPHY TOKENS                                                  */
/* ------------------------------------------------------------------ */

/**
 * Architectural typographic scale.
 * Headings: Inter Tight (tight tracking, authoritative).
 * Body: Inter (regular/medium, 1.6 line-height).
 * Technical: JetBrains Mono (all-caps, wide tracking).
 */
export const typography = {
  // Display — hero statements
  display: {
    fontSize: 36,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  // H1 — screen titles
  h1: {
    fontSize: 32,
    fontWeight: '300' as const,
    letterSpacing: -0.4,
    lineHeight: 38,
  },
  // H2 — section titles
  h2: {
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  // H3 — card titles
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  // Body Large
  bodyL: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  // Body
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  // Body Small — captions
  bodyS: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 18,
  },
  // Mono Label — technical, all-caps
  monoLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    lineHeight: 14,
  },
  // Mono Value — technical values
  monoValue: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
} as const;

/* ------------------------------------------------------------------ */
/*  BORDER RADIUS TOKENS                                               */
/* ------------------------------------------------------------------ */

export const radius = {
  none: 0,
  sm: 4, // Standard — buttons, inputs
  md: 8, // Cards
  lg: 12, // Large cards
  xl: 16, // Modals
  xl2: 24, // Sheets
  pill: 999, // Pills, badges
} as const;

/* ------------------------------------------------------------------ */
/*  MOTION TOKENS                                                      */
/* ------------------------------------------------------------------ */

/**
 * Custom cubic-bezier curves for organic, luxury movement.
 * Source: MOTION_SYSTEM.md §Easing
 */
export const motion = {
  // Easing curves
  ease: {
    /** Smooth, decelerating — entrance, hero load */
    entrance: [0.16, 1, 0.3, 1] as const,
    /** Bouncy, playful — button press, tooltip */
    interaction: [0.34, 1.56, 0.64, 1] as const,
    /** Balanced — modal open, page slide */
    transition: [0.25, 0.1, 0.25, 1] as const,
    /** Fast, precise — error messages, toggles */
    sharp: [0.4, 0, 0.6, 1] as const,
  },
  // Durations (ms)
  duration: {
    micro: 200, // Micro-interactions (150–300ms)
    short: 300, // Component transitions
    base: 400, // Standard transitions
    long: 600, // Page transitions
    cinematic: 900, // Cinematic reveals
  },
  // Spring physics (from DESIGN_SYSTEM.md §Spring Motion Tokens)
  spring: {
    /** Micro-interactions — button hover, card lift */
    micro: { stiffness: 300, damping: 25, mass: 1 },
    /** Group reveals — stagger children */
    group: { stiffness: 200, damping: 22, mass: 1 },
    /** Heading entrance */
    heading: { stiffness: 180, damping: 22, mass: 1 },
    /** Paragraph entrance */
    paragraph: { stiffness: 150, damping: 20, mass: 1 },
    /** CTA buttons */
    cta: { stiffness: 140, damping: 18, mass: 1 },
    /** Bottom/utility — footer, low-priority */
    utility: { stiffness: 100, damping: 20, mass: 1 },
  },
  // Stagger delays (ms) — cascading reveal
  stagger: {
    fast: 60,
    base: 100,
    slow: 150,
  },
} as const;

/* ------------------------------------------------------------------ */
/*  SHADOW TOKENS                                                      */
/* ------------------------------------------------------------------ */

/** Elevation tokens — subtle depth, never heavy */
export const shadows = {
  // Cards resting on void
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  // Elevated interactive cards
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  // Gold glow on focused/active elements
  goldGlow: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 0,
  },
} as const;

/* ------------------------------------------------------------------ */
/*  GLASS TOKENS                                                       */
/* ------------------------------------------------------------------ */

/** Glassmorphism material properties */
export const glass = {
  // Standard glass card
  standard: {
    backgroundColor: 'rgba(18, 18, 20, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  // Gold-tinted glass — featured cards, CTAs
  gold: {
    backgroundColor: 'rgba(28, 24, 14, 0.6)',
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1,
  },
} as const;

/* ------------------------------------------------------------------ */
/*  AGGREGATE THEME                                                     */
/* ------------------------------------------------------------------ */

export const theme = {
  colors,
  goldGradient,
  spacing,
  typography,
  radius,
  motion,
  shadows,
  glass,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Motion = typeof motion;
