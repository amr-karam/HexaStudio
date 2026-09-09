import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import * as React from 'react';

/* -------------------------------------------------------------------------- */
/*  Meta                                                                    */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'glass'],
      description: 'Visual elevation depth',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable hover lift + click feedback',
    },
    as: {
      control: 'select',
      options: ['div', 'article', 'section', 'aside'],
      description: 'Semantic HTML element',
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A compound Card component with composition-friendly API.

## Usage

\`\`\`tsx
<Card elevation="md" interactive>
  <Card.Header>
    <h3>Title</h3>
  </Card.Header>
  <Card.Body>
    <p>Content</p>
  </Card.Body>
  <Card.Footer>
    <button>Action</button>
  </Card.Footer>
</Card>
\`\`\`
        `,
      },
    },
  },
};

export default meta;

/* -------------------------------------------------------------------------- */
/*  Stories                                                                */
/* -------------------------------------------------------------------------- */

export const Default: StoryObj = {
  args: {
    elevation: 'sm',
    interactive: false,
    as: 'div',
    children: (
      <>
        <Card.Header>
          <h3 className="text-lg font-serif text-sl-alabaster">Card Title</h3>
          <p className="text-sm text-sl-silver">Supporting text</p>
        </Card.Header>
        <Card.Body>
          <p className="text-sl-mist text-sm leading-relaxed">
            Card body content with responsive padding. The compound API allows
            flexible composition of header, body, and footer sections.
          </p>
        </Card.Body>
        <Card.Footer>
          <button className="text-sm text-sl-gold hover:text-sl-gold-bright transition-colors">
            Learn more →
          </button>
        </Card.Footer>
      </>
    ),
  },
};

export const Interactive: StoryObj = {
  args: {
    elevation: 'md',
    interactive: true,
    as: 'article',
    children: (
      <>
        <Card.Header>
          <h3 className="text-xl font-serif text-sl-alabaster">
            Interactive Card
          </h3>
        </Card.Header>
        <Card.Body>
          <p className="text-sl-mist text-sm">
            Hover to see lift and shadow animation. Click for tactile feedback.
          </p>
        </Card.Body>
        <Card.Footer>
          <button className="text-sm text-sl-gold hover:text-sl-gold-bright transition-colors">
            Click me →
          </button>
        </Card.Footer>
      </>
    ),
  },
};

export const GlassElevation: StoryObj = {
  args: {
    elevation: 'glass',
    interactive: true,
    as: 'section',
    children: (
      <>
        <Card.Header>
          <h3 className="text-lg font-serif text-sl-alabaster">
            Glass Elevation
          </h3>
        </Card.Header>
        <Card.Body>
          <p className="text-sl-mist text-sm">
            Uses the artisan glass shadow and highlight tokens for a frosted
            depth effect.
          </p>
        </Card.Body>
        <Card.Footer>
          <span className="text-xs text-sl-silver">Glass variant</span>
        </Card.Footer>
      </>
    ),
  },
};

export const ElevationVariants: StoryObj = {
  args: {
    interactive: false,
    as: 'article',
    children: (
      <div className="flex flex-wrap gap-4">
        {(['none', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((elv) => (
          <Card
            key={elv}
            elevation={elv}
            className="w-48"
          >
            <Card.Body>
              <span className="text-xs text-sl-gold">{elv}</span>
            </Card.Body>
          </Card>
        ))}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Elevation variants from none through 2xl, plus the glass glassmorphism variant.',
      },
    },
  },
};

export const CompoundLayout: StoryObj = {
  args: {
    elevation: 'lg',
    interactive: false,
    as: 'article',
    children: (
      <>
        <Card.Header gutter="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sl-gold-10 flex items-center justify-center text-sl-gold text-sm font-bold">
              A
            </div>
            <div>
              <h3 className="text-base font-serif text-sl-alabaster">Author Name</h3>
              <p className="text-xs text-sl-silver">August 15, 2026</p>
            </div>
          </div>
        </Card.Header>
        <Card.Body padding="lg">
          <h4 className="text-xl font-serif text-sl-alabaster mb-2">
            Article Title Here
          </h4>
          <p className="text-sl-mist text-sm leading-relaxed">
            This demonstrates the full compound card layout with header, body,
            and footer sections composed together.
          </p>
        </Card.Body>
        <Card.Footer gutter="sm">
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm bg-sl-gold-15 text-sl-gold rounded-lg hover:bg-sl-gold-25 transition-colors">
              Read More
            </button>
            <button className="px-4 py-2 text-sm text-sl-silver hover:text-sl-alabaster transition-colors">
              Share
            </button>
          </div>
        </Card.Footer>
      </>
    ),
  },
};

export const ResponsivePadding: StoryObj = {
  args: {
    elevation: 'sm',
    as: 'section',
    paddingResponsive: {
      base: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
    },
    children: (
      <>
        <Card.Header>
          <h3 className="text-lg font-serif text-sl-alabaster">
            Responsive Padding
          </h3>
        </Card.Header>
        <Card.Body>
          <p className="text-sl-mist text-sm">
            Resize the viewport to see padding adapt per breakpoint: sm → md → lg → xl.
            The paddingResponsive prop maps to Tailwind responsive prefixes.
          </p>
        </Card.Body>
        <Card.Footer>
          <span className="text-xs text-sl-silver">p-sm → p-md → p-lg → p-xl</span>
        </Card.Footer>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Responsive padding adjusts across breakpoints using the paddingResponsive prop. Resize the Storybook viewport to verify.',
      },
    },
  },
};

export const ResponsiveGap: StoryObj = {
  args: {
    elevation: 'sm',
    as: 'section',
    gapResponsive: {
      base: 'sm',
      md: 'md',
      lg: 'lg',
    },
    children: (
      <div>
        <Card.Header>
          <h3 className="text-lg font-serif text-sl-alabaster">
            Responsive Gap
          </h3>
        </Card.Header>
        <Card.Body>
          <p className="text-sl-mist text-sm">
            Gap between sections adjusts per breakpoint via gapResponsive prop.
          </p>
        </Card.Body>
        <Card.Footer>
          <span className="text-xs text-sl-silver">gap-sm → gap-md → gap-lg</span>
        </Card.Footer>
      </div>
    ),
  },
};

export const SemanticArticle: StoryObj = {
  args: {
    elevation: 'md',
    interactive: true,
    as: 'article',
    children: (
      <>
        <Card.Header>
          <span className="text-xs text-sl-gold uppercase tracking-widest">
            Editorial
          </span>
          <h2 className="text-2xl font-serif text-sl-alabaser mt-1">
            Semantic HTML Article Card
          </h2>
        </Card.Header>
        <Card.Body padding="lg">
          <p className="text-sl-mist text-sm leading-relaxed">
            Using <code className="text-sl-gold">&lt;article&gt;</code> as the
            rendered element provides proper semantic structure for screen readers
            and search engines.
          </p>
        </Card.Body>
        <Card.Footer>
          <button className="text-sm text-sl-gold hover:text-sl-gold-bright transition-colors">
            Continue Reading →
          </button>
        </Card.Footer>
      </>
    ),
  },
};

export const WithoutHeaderFooter: StoryObj = {
  args: {
    elevation: 'sm',
    children: (
      <Card.Body padding="lg">
        <p className="text-sl-mist text-sm">
          Cards can be simple — body only, no header or footer needed.
        </p>
      </Card.Body>
    ),
  },
};

export const InteractiveElevationRange: StoryObj = {
  args: {
    interactive: true,
    as: 'article',
    children: (
      <div className="flex flex-wrap gap-4">
        {[
          { elev: 'sm', label: 'sm' },
          { elev: 'md', label: 'md' },
          { elev: 'lg', label: 'lg' },
          { elev: 'glass', label: 'glass' },
        ].map(({ elev, label }) => (
          <Card key={elev} elevation={elev} interactive className="w-48">
            <Card.Header>
              <span className="text-xs text-sl-gold">{label}</span>
            </Card.Header>
            <Card.Body>
              <p className="text-xs text-sl-mist">Interactive + {label}</p>
            </Card.Body>
          </Card>
        ))}
      </div>
    ),
  },
};
