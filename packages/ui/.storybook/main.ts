import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    // Root-level stories under src/**/*.stories.@(js|jsx|ts|tsx)
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Enable TypeScript types for_parameters
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  core: {
    builder: '@storybook/builder-vite',
  },
};

export default config;
EOF