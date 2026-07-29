// ─── HEXA Hub — Storybook Preview Configuration ────────────────────────────
// Global decorators: dark theme wrapper, motion context, TailwindCSS import.
// Every story is rendered within the HEXA dark luxury design context.
// ───────────────────────────────────────────────────────────────────────────

import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/app/globals.css';

// ─── Preview Configuration ────────────────────────────────────────────────

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: 'requiredFirst',
    },
    backgrounds: {
      default: 'obsidian',
      values: [
        {
          name: 'obsidian',
          value: '#050505',
        },
        {
          name: 'surface',
          value: '#141414',
        },
      ],
    },
    viewport: {
      viewports: {
        desktop: {
          name: 'Desktop (1920)',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
        desktopSmall: {
          name: 'Desktop Small (1440)',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
        tablet: {
          name: 'Tablet (768)',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        mobile: {
          name: 'Mobile (390)',
          styles: {
            width: '390px',
            height: '844px',
          },
        },
      },
    },
    docs: {
      theme: {
        base: 'dark',
        appBg: '#050505',
        appContentBg: '#0A0A0A',
        appBorderColor: '#1F1F1F',
        appBorderRadius: 12,
        textColor: '#E5E5E5',
        textInverseColor: '#0A0A0A',
        barTextColor: '#888',
        barSelectedColor: '#D4A843',
        barBg: '#0A0A0A',
        inputBg: '#141414',
        inputBorder: '#1F1F1F',
        inputTextColor: '#E5E5E5',
        inputBorderRadius: 8,
        colorPrimary: '#D4A843',
        colorSecondary: '#1F1F1F',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },

  // ── Global Decorators ───────────────────────────────────────────────────

  decorators: [
    (Story) => (
      <div className="bg-[#050505] text-white antialiased min-h-screen p-8">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');

          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: #050505;
            color: #fff;
          }

          /* Storybook-specific overrides */
          .sb-show-main {
            background: #050505 !important;
          }

          .docs-story {
            background: #050505 !important;
          }
        `}</style>
        <Story />
      </div>
    ),
  ],

  // ── Global Types ─────────────────────────────────────────────────────────

  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Color theme for components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark', icon: 'circle' },
          { value: 'light', title: 'Light', icon: 'circlehollow' },
        ],
        showName: true,
      },
    },
  },
};

export default preview;
