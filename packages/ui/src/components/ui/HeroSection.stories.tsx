import type { Meta, StoryObj } from '@storybook/react';
import HeroSection from './HeroSection';

const meta: Meta<typeof HeroSection> = {
  title: 'Design System/Hero Section',
  component: HeroSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

export const Default: Story = {};
