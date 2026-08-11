import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Design System/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['featured', 'minimal', 'luxury', 'solid'],
    },
    hover: { control: 'boolean' },
    as: {
      control: 'select',
      options: ['div', 'article', 'section'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Featured: Story = {
  args: {
    title: 'Villa Serenity',
    description: 'A minimalist retreat where architecture meets the Mediterranean horizon.',
    variant: 'featured',
  },
};

export const Luxury: Story = {
  args: {
    title: 'The Meridian Penthouse',
    description: 'Gold-leafed interiors suspended above the city skyline.',
    variant: 'luxury',
  },
};

export const Minimal: Story = {
  args: {
    title: 'Kintsugi Pavilion',
    description: 'Celebrating the beauty of imperfection through spatial repair.',
    variant: 'minimal',
  },
};

export const Solid: Story = {
  args: {
    title: 'Project Brief',
    description: 'A structured summary of scope, timeline, and deliverables.',
    variant: 'solid',
  },
};

export const WithChildren: Story = {
  args: {
    title: 'Featured Villa',
    variant: 'featured',
    children: (
      <div>
        <p className="text-sm mb-4">Additional content passed as children.</p>
        <span className="inline-block rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-medium text-white">
          Available
        </span>
      </div>
    ),
  },
};
