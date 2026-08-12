import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Design System/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel'],
    },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your name',
    type: 'text',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
    error: 'Please enter a valid email address.',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    placeholder: '••••••••',
    type: 'password',
  },
};

export const Search: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search projects...',
    type: 'search',
  },
};
