import type { Preview } from '@storybook/react';
import React from 'react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0a0a0a' },
        { name: 'light', value: '#f5f5f4' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
