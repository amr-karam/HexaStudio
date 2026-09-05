import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Input } from './Input';

/* -------------------------------------------------------------------------- */
/*  Meta                                                                    |
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['underline', 'glass'],
      description: 'Visual treatment of the field shell',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input field',
    },
    as: {
      control: 'select',
      options: ['input', 'textarea', 'select'],
      description: 'Rendered element type',
    },
    label: {
      control: 'text',
      description: 'Visible label text',
    },
    error: {
      control: 'text',
      description: 'Error message (triggers error state)',
    },
    helperText: {
      control: 'text',
      description: 'Helper text below the field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether input takes full container width',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Input** — a polymorphic form primitive supporting \`input\`, \`textarea\`, and \`select\` elements.

- **Variants**: \`underline\` (default, editorial hairline) and \`glass\` (liquid-glass shell)
- **Sizes**: \`sm\`, \`md\`, \`lg\`
- **Slots**: left/right icon slots, label, helper text, error state
- **Accessibility**: ARIA-wired via \`htmlFor\`/id, \`aria-invalid\`, \`aria-describedby\`
- **Responsive**: full-width on mobile, constrained on desktop via layout system
        `,
      },
    },
  },
};

export default meta;

/* -------------------------------------------------------------------------- */
/*  Stories                                                                 |
/* -------------------------------------------------------------------------- */

const SampleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Default text input
export const Default: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Enter text...',
    label: 'Name',
    helperText: 'This is your display name',
  },
};

// With error state
export const WithError: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Enter email...',
    label: 'Email',
    error: 'Please enter a valid email address',
    helperText: 'We will never share your email',
  },
};

// Glass variant
export const GlassVariant: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Search...',
    label: 'Search',
    variant: 'glass',
    helperText: 'Glass variant for liquid-glass layouts',
  },
};

// Small size
export const Small: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Small input',
    label: 'Small',
    size: 'sm',
  },
};

// Large size
export const Large: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Large input',
    label: 'Large',
    size: 'lg',
  },
};

// With left icon
export const WithLeftIcon: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Search...',
    label: 'Search',
    icons: { left: <SampleIcon /> },
  },
};

// With right icon
export const WithRightIcon: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Enter password...',
    label: 'Password',
    icons: { right: <SampleIcon /> },
  },
};

// With both icons
export const WithBothIcons: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Search...',
    label: 'Search',
    icons: { left: <SampleIcon />, right: <SampleIcon /> },
  },
};

// Textarea
export const Textarea: StoryObj<typeof Input> = {
  args: {
    as: 'textarea',
    placeholder: 'Write something...',
    label: 'Message',
    helperText: 'Maximum 500 characters',
  },
};

// Select
export const Select: StoryObj<typeof Input> = {
  args: {
    as: 'select',
    label: 'Category',
    helperText: 'Choose a category',
    children: (
      <>
        <option value="">Select...</option>
        <option value="1">Engineering</option>
        <option value="2">Design</option>
        <option value="3">Marketing</option>
      </>
    ),
  },
};

// Disabled state
export const Disabled: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Disabled input',
    label: 'Disabled',
    disabled: true,
    helperText: 'This field is disabled',
  },
};

// Without label
export const NoLabel: StoryObj<typeof Input> = {
  args: {
    placeholder: 'No label input',
    fullWidth: false,
  },
};

// Controlled mode (with React state)
export const Controlled: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Type here...',
    label: 'Controlled',
    helperText: 'Value is managed via React state',
  },
  render: (args) => {
    const [value, setValue] = React.useState('');
    return <Input {...args} value={value} onChange={(e) => setValue(e.target.value)} />;
  },
};

// Error with glass variant
export const GlassWithError: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Enter email...',
    label: 'Email',
    variant: 'glass',
    error: 'Invalid email format',
    helperText: 'Please check and try again',
  },
};

/* -------------------------------------------------------------------------- */
/*  Responsive Matrix                                                       |
/* -------------------------------------------------------------------------- */

export const ResponsiveMatrix: StoryObj<typeof Input> = {
  name: 'Responsive Matrix',
  args: {
    label: 'Responsive Input',
    placeholder: 'Resize the viewport to see responsive behavior',
    helperText: 'Full-width on mobile, constrained on desktop',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `
Test at breakpoints:
- **xs (<640px)**: Full-width (100%)
- **sm (640px+)**: Full-width
- **md (768px+)**: Full-width
- **lg (1024px+)**: Constrained to \`max-w-md\`
- **xl (1280px+)**: Constrained to \`max-w-md\`
        `,
      },
    },
  },
};

/* -------------------------------------------------------------------------- */
/*  All Variants Matrix                                                   |
/* -------------------------------------------------------------------------- */

export const VariantsMatrix: StoryObj<typeof Input> = {
  name: 'Variants Matrix',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div>
        <h4 style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          UNDERLINE VARIANT
        </h4>
        <Input placeholder="Text input" label="Label" helperText="Helper text" />
      </div>
      <div>
        <h4 style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          GLASS VARIANT
        </h4>
        <Input placeholder="Glass input" label="Label" helperText="Glass variant" variant="glass" />
      </div>
      <div>
        <h4 style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          WITH ERROR
        </h4>
        <Input placeholder="Error state" label="Label" error="Something went wrong" variant="glass" />
      </div>
      <div>
        <h4 style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          TEXTAREA
        </h4>
        <Input as="textarea" placeholder="Textarea" label="Message" helperText="Multi-line" />
      </div>
      <div>
        <h4 style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          SELECT
        </h4>
        <Input as="select" label="Select">
          <option value="">Choose...</option>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Input>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All input variants, sizes, and element types rendered together.',
      },
    },
  },
};
