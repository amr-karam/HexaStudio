import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from './Button';

/* -------------------------------------------------------------------------- */
/*  Meta                                                                    */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'outline', 'luxury', 'couture', 'glass'],
      description: 'Visual treatment of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    color: {
      control: 'select',
      options: ['gold', 'silver', 'neutral'],
      description: 'Accent color for focus ring',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables interaction',
    },
    isPressed: {
      control: 'boolean',
      description: 'Sets aria-pressed attribute',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Renders child element instead of button',
    },
    as: {
      control: 'select',
      options: ['button', 'a', 'div'],
      description: 'Polymorphic element type',
    },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Button primitive with responsive variants, polymorphic \`as\` prop,
and full accessibility support. Uses HEXA STUDIO design tokens.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

/* -------------------------------------------------------------------------- */
/*  Default Stories                                                         */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Luxury: Story = {
  args: {
    children: 'Luxury',
    variant: 'luxury',
  },
};

export const Couture: Story = {
  args: {
    children: 'Couture',
    variant: 'couture',
  },
};

export const Glass: Story = {
  args: {
    children: 'Glass',
    variant: 'glass',
  },
};

/* -------------------------------------------------------------------------- */
/*  Size Stories                                                          */
/* -------------------------------------------------------------------------- */

export const Sm: Story = {
  args: {
    children: 'Small',
    variant: 'primary',
    size: 'sm',
  },
};

export const Md: Story = {
  args: {
    children: 'Medium',
    variant: 'primary',
    size: 'md',
  },
};

export const Lg: Story = {
  args: {
    children: 'Large',
    variant: 'primary',
    size: 'lg',
  },
};

/* -------------------------------------------------------------------------- */
/*  Responsive Size Stories                                             */
/* -------------------------------------------------------------------------- */

export const ResponsiveSize: Story = {
  args: {
    children: 'Responsive',
    variant: 'primary',
    size: { base: 'sm', sm: 'sm', md: 'md', lg: 'lg' },
  },
  parameters: {
    docs: {
      description: {
        story: 'Button adapts size at each breakpoint using responsive Tailwind classes.',
      },
    },
  },
};

/* -------------------------------------------------------------------------- */
/*  State Stories                                                         */
/* -------------------------------------------------------------------------- */

export const Loading: Story = {
  args: {
    children: 'Loading...',
    variant: 'primary',
    isLoading: true,
  },
};

export const LoadingSecondary: Story = {
  args: {
    children: 'Loading...',
    variant: 'secondary',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    disabled: true,
  },
};

export const DisabledLoading: Story = {
  args: {
    children: 'Disabled Loading',
    variant: 'primary',
    isLoading: true,
    disabled: true,
  },
};

export const Pressed: Story = {
  args: {
    children: 'Pressed',
    variant: 'primary',
    isPressed: true,
  },
};

/* -------------------------------------------------------------------------- */
/*  Polymorphic Stories (as prop)                                       */
/* -------------------------------------------------------------------------- */

export const AsAnchor: Story = {
  args: {
    children: 'Link Button',
    variant: 'primary',
    as: 'a',
    href: '/demo',
  },
};

export const AsDiv: Story = {
  args: {
    children: 'Div Button',
    variant: 'secondary',
    as: 'div',
    role: 'button',
    tabIndex: 0,
  },
};

export const AsLink: Story = {
  args: {
    children: 'Styled Link',
    variant: 'outline',
    as: 'a',
    href: '#',
  },
};

/* -------------------------------------------------------------------------- */
/*  AsChild Composition Stories                                         */
/* -------------------------------------------------------------------------- */

export const AsChildAnchor: Story = {
  args: {
    children: <a href="/dashboard">Dashboard</a>,
    variant: 'primary',
    asChild: true,
  },
};

export const AsChildLink: Story = {
  args: {
    children: <a href="/settings">Settings</a>,
    variant: 'outline',
    asChild: true,
  },
};

/* -------------------------------------------------------------------------- */
/*  Color Stories                                                       */
/* -------------------------------------------------------------------------- */

export const ColorGold: Story = {
  args: {
    children: 'Gold Focus',
    variant: 'primary',
    color: 'gold',
  },
};

export const ColorSilver: Story = {
  args: {
    children: 'Silver Focus',
    variant: 'secondary',
    color: 'silver',
  },
};

export const ColorNeutral: Story = {
  args: {
    children: 'Neutral Focus',
    variant: 'ghost',
    color: 'neutral',
  },
};

/* -------------------------------------------------------------------------- */
/*  With Icons (children)                                               */
/* -------------------------------------------------------------------------- */

export const WithIcon: Story = {
  args: {
    children: <span>Continue</span>,
    variant: 'primary',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="luxury">Luxury</Button>
      <Button variant="couture">Couture</Button>
      <Button variant="glass">Glass</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants rendered together for visual comparison.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Default</Button>
      <Button isLoading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button isPressed>Pressed</Button>
    </div>
  ),
};