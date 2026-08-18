/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: 'var(--spacing-lg)',
    },
    extend: {
      colors: {
        /* ── Void (60% canvas) ── */
        void: '#050505',
        voidDeep: '#020203',
        /* ── Obsidian & Slate (30% surfaces) ── */
        obsidian: '#0F0F10',
        obsidianRaised: '#161618',
        slate: '#1A1A1A',
        /* ── Borders ── */
        border: '#1F1F1F',
        borderHover: '#2A2A2A',
        /* ── Gold (10% — HEXA signature) ── */
        gold: '#D4AF37',
        goldBright: '#E5C76B',
        goldDeep: '#A8862E',
        /* ── Text ── */
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0A0',
        textMuted: '#707075',
        /* ── Status ── */
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: ['0.625rem', { lineHeight: '1rem' }],    /* 10px */
        sm: ['0.8125rem', { lineHeight: '1.25rem' }], /* 13px */
        base: ['0.9375rem', { lineHeight: '1.5rem' }], /* 15px */
        lg: ['1.0625rem', { lineHeight: '1.5rem' }],  /* 17px */
        xl: ['1.1875rem', { lineHeight: '1.5rem' }], /* 19px */
        '2xl': ['1.5rem', { lineHeight: '1.25rem' }],
        '3xl': ['1.875rem', { lineHeight: '1.25rem' }],
        '4xl': ['2.4375rem', { lineHeight: '1.1' }],
        '5xl': ['3.75rem', { lineHeight: '1.0' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        gold: 'var(--shadow-elevation-gold)',
        card: 'var(--shadow-elevation-3)',
        elevated: 'var(--shadow-elevation-2)',
      },
      transitionTimingFunction: {
        entrance: 'var(--hexa-ease-entrance)',
        interaction: 'var(--hexa-ease-interaction)',
        transition: 'var(--hexa-ease-transition)',
        sharp: 'var(--hexa-ease-sharp)',
        cinematic: 'var(--hexa-ease-cinematic)',
      },
    },
  },
  plugins: [],
};
