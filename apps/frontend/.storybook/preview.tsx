import type { Preview } from '@storybook/nextjs';
import React from 'react';
import { QualityProvider } from '@/providers/quality-provider';
import { DesignerModeProvider } from '@/features/scene/store/designer-store';
import { MotionPolicyProvider } from '@/hooks/useMotionPolicy';
import '@/app/globals.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <QualityProvider>
        <DesignerModeProvider>
          <MotionPolicyProvider>
            <Story />
          </MotionPolicyProvider>
        </DesignerModeProvider>
      </QualityProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'obsidian',
      values: [
        { name: 'obsidian', value: '#0A0A0A' },
        { name: 'dark', value: '#050505' },
        { name: 'background', value: '#FAFAFA' },
        { name: 'light', value: '#FFFFFF' },
      ],
    },
    viewport: {
      viewports: {
        mobile1: { name: 'Mobile 320', styles: { width: '320px', height: '568px' } },
        mobile2: { name: 'Mobile 375', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop 1024', styles: { width: '1024px', height: '768px' } },
        large: { name: 'Large 1440', styles: { width: '1440px', height: '900px' } },
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: false },
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['dark', 'light'],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;