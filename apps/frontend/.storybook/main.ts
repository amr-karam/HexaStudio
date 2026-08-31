import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-onboarding'],
  framework: '@storybook/nextjs',
  staticDirs: ['../public'],
};
export default config;