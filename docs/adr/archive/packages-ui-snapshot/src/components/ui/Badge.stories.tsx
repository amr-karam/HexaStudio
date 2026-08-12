import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Design System/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'info'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'New',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Draft',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Completed',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Pending',
    variant: 'warning',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Overdue',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Beta',
    variant: 'outline',
  },
};

export const Info: Story = {
  args: {
    children: 'Updated',
    variant: 'info',
  },
};
