// ─── HEXA Hub — Button Stories ─────────────────────────────────────────────
// Documents all Button variants, sizes, states, and interactive scenarios.
// Follows the dark luxury design system with gold (#D4A843) accents.
// ───────────────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, Plus, Settings, Trash2 } from 'lucide-react';
import React from 'react';

// ─── Metadata ─────────────────────────────────────────────────────────────

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Visual style variant of the button.',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Button size preset.',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows a spinner and disables the button.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button.',
    },
    leftIcon: {
      control: false,
      description: 'Icon placed before the label.',
    },
    rightIcon: {
      control: false,
      description: 'Icon placed after the label.',
    },
    children: {
      control: 'text',
      description: 'Button label content.',
    },
    onClick: { action: 'clicked' },
  },
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ─── Variants ──────────────────────────────────────────────────────────────

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
    size: 'md',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete Item',
    size: 'md',
  },
};

// ─── Sizes ─────────────────────────────────────────────────────────────────

export const Small: Story = {
  args: {
    variant: 'primary',
    children: 'Small',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    variant: 'primary',
    children: 'Medium',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    children: 'Large Button',
    size: 'lg',
  },
};

// ─── All Variants Overview ─────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// ─── States ────────────────────────────────────────────────────────────────

export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Saving...',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled',
    disabled: true,
  },
};

export const LoadingSecondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Processing...',
    isLoading: true,
  },
};

export const DisabledSecondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Unavailable',
    disabled: true,
  },
};

// ─── With Icons ────────────────────────────────────────────────────────────

export const WithLeftIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Search',
    leftIcon: <Search size={16} />,
    size: 'md',
  },
};

export const WithRightIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Next',
    rightIcon: <ArrowRight size={16} />,
    size: 'md',
  },
};

export const WithBothIcons: Story = {
  args: {
    variant: 'secondary',
    children: 'Settings',
    leftIcon: <Settings size={16} />,
    rightIcon: <ArrowRight size={16} />,
    size: 'md',
  },
};

export const DangerWithIcon: Story = {
  args: {
    variant: 'danger',
    children: 'Delete',
    leftIcon: <Trash2 size={16} />,
    size: 'md',
  },
};

// ─── Combined: Icon + Size Matrix ──────────────────────────────────────────

export const IconSizeMatrix: Story = {
  name: 'Icon + Size Matrix',
  render: () => (
    <div className="flex flex-col gap-6">
      {(['primary', 'secondary', 'ghost', 'danger'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <span className="text-xs text-[#555] uppercase tracking-[0.15em] w-24 font-light">
            {variant}
          </span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button
              key={`${variant}-${size}`}
              variant={variant}
              size={size}
              leftIcon={<Plus size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
            >
              {variant === 'danger' ? 'Delete' : 'Action'}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

// ─── Composition: Button Row ───────────────────────────────────────────────

export const ButtonRow: Story = {
  name: 'Form Action Row',
  render: () => (
    <div className="flex items-center gap-3">
      <Button variant="secondary" onClick={() => {}}>
        Cancel
      </Button>
      <Button variant="primary" onClick={() => {}}>
        Save Changes
      </Button>
    </div>
  ),
};

// ─── Full Width (Utility) ──────────────────────────────────────────────────

export const FullWidth: Story = {
  name: 'Full Width',
  render: () => (
    <div className="w-full space-y-3">
      <Button variant="primary" className="w-full">
        Continue to Dashboard
      </Button>
      <Button variant="secondary" className="w-full">
        Go Back
      </Button>
      <Button variant="ghost" className="w-full">
        Skip for Now
      </Button>
    </div>
  ),
};
