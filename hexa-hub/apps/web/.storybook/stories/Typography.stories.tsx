import React from 'react';
import { Heading, Text, Code, Lead } from '@/components/ui/typography';
import type { HeadingProps, TextProps, CodeProps, LeadProps } from '@/components/ui/typography';

/* ─── Heading Stories ────────────────────────────────────────── */

export default {
  title: 'HEXA/UI/Typography',
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    variant: {
      control: 'select',
      options: ['display', 'subtitle', 'body'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'gold', 'muted', 'foreground'],
    },
    gradient: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#050505' }] },
  },
};

const HeadingStory = (args: HeadingProps) => <Heading {...args} />;
HeadingStory.args = {
  level: 'h2',
  children: 'Heading Component',
};

export const H1 = () => <Heading level="h1">Heading Level 1</Heading>;
export const H2 = () => <Heading level="h2">Heading Level 2</Heading>;
export const H3 = () => <Heading level="h3">Heading Level 3</Heading>;
export const H4 = () => <Heading level="h4">Heading Level 4</Heading>;
export const H5 = () => <Heading level="h5">Heading Level 5</Heading>;
export const H6 = () => <Heading level="h6">Heading Level 6</Heading>;

export const DisplayVariant = () => (
  <Heading level="h1" variant="display">Display Heading</Heading>
);

export const GoldGradient = () => (
  <Heading level="h1" gradient>Gold Gradient Heading</Heading>
);

export const Polymorphic = () => (
  <Heading as="span" level="h2" color="gold">
    Polymorphic Heading (rendered as span)
  </Heading>
);

export const ResponsiveScale = () => (
  <div className="flex flex-col gap-4">
    <Heading level="h1">H1 — Responsive</Heading>
    <Heading level="h2">H2 — Responsive</Heading>
    <Heading level="h3">H3 — Responsive</Heading>
    <Heading level="h4">H4 — Responsive</Heading>
    <Heading level="h5">H5 — Responsive</Heading>
    <Heading level="h6">H6 — Responsive</Heading>
  </div>
);

/* ─── Text Stories ───────────────────────────────────────────── */

const TextStory = (args: TextProps) => <Text {...args} />;
TextStory.args = {
  size: 'base',
  children: 'Text component with body copy that demonstrates the type scale and weight variants available for paragraphs and secondary content throughout the HEXA STUDIO design system.',
};

export const SizeScale = () => (
  <div className="flex flex-col gap-3">
    {(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const).map((size) => (
      <Text key={size} size={size}>{`Text at ${size} size</Text>`}</Text>
    ))}
  </div>
);

export const WeightVariants = () => (
  <div className="flex flex-col gap-3">
    <Text weight="light">Light weight text for secondary content</Text>
    <Text weight="regular">Regular weight text for body copy</Text>
    <Text weight="medium">Medium weight text for emphasis</Text>
    <Text weight="bold">Bold weight text for strong emphasis</Text>
  </div>
);

export const ColorVariants = () => (
  <div className="flex flex-col gap-3">
    <Text color="primary">Primary text</Text>
    <Text color="secondary">Secondary text</Text>
    <Text color="muted">Muted text</Text>
    <Text color="gold">Gold accent text</Text>
    <Text color="foreground">Foreground text</Text>
    <Text color="tertiary">Tertiary text</Text>
  </div>
);

export const Truncate = () => (
  <Text truncate className="w-48">
    This is a very long text that should be truncated with an ellipsis when it exceeds the container width
  </Text>
);

export const PolymorphicText = () => (
  <Text as="span" size="sm" color="muted">
    Inline text rendered as a span element
  </Text>
);

/* ─── Code Stories ───────────────────────────────────────────── */

const CodeStory = (args: CodeProps) => <Code {...args} />;
CodeStory.args = {
  children: 'const greeting = "Hello, HEXA STUDIO";',
};

export const Inline = () => (
  <p>
    Use the <Code variant="inline">useState</Code> hook to manage state.
  </p>
);

export const Block = () => (
  <Code variant="block" language="typescript">
{`interface HeadingProps {
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  as?: React.ElementType;
  variant?: 'display' | 'subtitle' | 'body';
  color?: 'primary' | 'secondary' | 'gold' | 'muted';
  gradient?: boolean;
}

const Heading = forwardRef<HTMLElement, HeadingProps>(
  ({ level = 'h2', as, ...props }, ref) => {
    const Component = as || level;
    return <Component ref={ref} {...props} />;
  }
);`}
  </Code>
);

/* ─── Lead Stories ───────────────────────────────────────────── */

export const LeadDefault = () => (
  <Lead>
    The lead paragraph is a large, light-weight text block used for
    introductory sections and hero content. It scales responsively
    from base to xl at larger breakpoints.
  </Lead>
);

/* ─── Composite Showcase ──────────────────────────────────────── */

export const TypographySystem = () => (
  <div className="flex flex-col gap-8 max-w-3xl">
    <Heading level="h1" gradient>HEXA STUDIO</Heading>
    <Lead>
      Design the future. Build at the edge. The HEXA STUDIO type system
      delivers pixel-perfect typography that scales gracefully across
      every viewport.
    </Lead>
    <Heading level="h2">Section Title</Heading>
    <Text size="lg" color="secondary">
      Subtitle or supporting text appears here in secondary weight
      to complement the heading hierarchy above.
    </Text>
    <Heading level="h3">Subsection</Heading>
    <Text>
      Body text uses the default size and weight. When you need to
      reference code, use the <Code variant="inline">Code</Code> component
      inline within your prose.
    </Text>
    <Code variant="block" language="typescript">
{`const greeting = "Hello, World";
console.log(greeting);`}
    </Code>
    <Heading level="h4">Small Heading</Heading>
    <Text size="sm" color="muted">
      Muted small text for metadata, captions, or timestamps.
    </Text>
  </div>
);
