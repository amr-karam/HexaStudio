module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Look for class names in source files
    './node_modules/@radix-ui/react-slot/**/*.{js,ts,jsx,tsx}', // Radix UI slots
    '../../packages/**/src/**/*.{js,ts,jsx,tsx}', // Include other workspace packages
  ],
  theme: {
    extend: {
      // ==== DESIGN TOKENS ====
      colors: {
        // Primary brand palette – deep architectural blues with indigo accent
        primary: {
          DEFAULT: '#0f172a',        // Deep Space Navy
          50: '#334155',             // Mid Navy
          100: '#1e293b',            // Darker Navy
          500: '#6366f1',            // Vibrant Indigo (accent)
        },
        secondary: {
          DEFAULT: '#15803d',        // Teal Green
          500: '#0d9488',            // Bright Teal
        },
        neutral: {
          100: '#f3f4f6',            // Light Gray
          200: '#e5e7eb',            // Gray
          700: '#374151',            // Dark Gray
          800: '#111827',            // Charcoal
          900: '#000000',            // Black
        },
        success: '#10b981',          // Emerald
        warning: '#f59e0b',          // Amber
        error: '#ef4444',            // Red

        // Gradients – subtle architectural depth
        gradientPrimary: 'linear-gradient(135deg, #0f172a, #6366f1)',
        gradientSecondary: 'linear-gradient(135deg, #15803d, #0d9488)',

        // Transparency helpers
        blackAlpha: {
          5: '0.05',
          10: '0.1',
          20: '0.2',
          30: '0.3',
          40: '0.4',
          50: '0.5',
          60: '0.6',
          70: '0.7',
          80: '0.8',
          90: '0.9',
          100: '1',
        },
      },

      // ==== TYPOGRAPHY ====
      fontFamily: {
        // Base system font – Inter (clean, legible)
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Elegant display for headings – Playfair Display
        display: ['Playfair Display', 'Georgia', 'serif'],
        // Monospace for code / technical content – Fira Code
        mono: ['Fira Code', 'source-code-pro', 'monospace'],
      },

      // ==== SPACING ====
      spacing: {
        // Direct mapping to design‑token scale
        '0': '0rem',
        '1': 'var(--space-1)',   // 0.25rem = 4px
        '2': 'var(--space-2)',   // 0.5rem  = 8px
        '3': 'var(--space-3)',   // 0.75rem = 12px
        '4': 'var(--space-4)',   // 1rem    = 16px
        '5': 'var(--space-5)',   // 1.5rem  = 24px
        '6': 'var(--space-6)',   // 2rem    = 32px
        '8': 'var(--space-8)',   // 2.5rem  = 40px
        '10': 'var(--space-10)', // 3.125rem = 50px
        '12': 'var(--space-12)', // 3.75rem  = 60px
        '16': 'var(--space-16)', // 5rem    = 80px
        '20': 'var(--space-20)', // 8rem    = 128px
      },

      // ==== RADIUS ====
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },

      // ==== SHADOWS ====
      shadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },

      // ==== ANIMATION ====
      keyframes: {
        // Simple fade‑in used by many components
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Gentle scale‑up for cards or hero sections
        scale: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        fade: 'fade 250ms var(--motion-duration-medium) ease-out',
        scale: 'scale 250ms var(--motion-duration-medium) ease-out',
      },
    },

    // ==== PLUGINS ====
    plugins: [
      // Enable class‑based variant styling for dark mode based on CSS variable
      function ({ addUtilities, theme }) {
        const colorUtilities = Object.entries(theme('colors')).flatMap(([key, value]) => {
          if (key === 'transparent') return [];
          return [
            `bg-${key}`, // background-color
            `text-${key}`, // color
            `border-${key}`, // border-color
          ];
        });
        addUtilities(colorUtilities);
      },
    ],
  },
};