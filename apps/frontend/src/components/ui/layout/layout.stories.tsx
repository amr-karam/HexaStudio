import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './layout';
import { Flex } from './layout';
import { Box } from './layout';
import { GridCell } from './layout';

/* -------------------------------------------------------------------------- */
/*  Grid Stories                                                           */
/* -------------------------------------------------------------------------- */

const gridMeta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  argTypes: {
    cols: {
      control: 'select',
      options: [1, 2, 3, 4, 6, 12],
      description: 'Number of columns in the 12-column grid',
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'main', 'article', 'ul'],
    },
  },
};

export default gridMeta;

export const Default: StoryObj<typeof Grid> = {
  args: {
    cols: 3,
    gap: 'lg',
    children: (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--spacing-sm)',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
            }}
          >
            Cell {i}
          </div>
        ))}
      </>
    ),
  },
};

export const TwoColumns: StoryObj<typeof Grid> = {
  args: {
    cols: 2,
    gap: 'xl',
    children: (
      <>
        <div
          style={{
            background: 'var(--color-obsidian)',
            border: '1px solid var(--color-border)',
            padding: 'var(--spacing-xl)',
            borderRadius: 'var(--spacing-md)',
            color: 'var(--color-text-primary)',
          }}
        >
          <h3 style={{ color: 'var(--color-gold)', margin: '0 0 8px 0' }}>
            Main Column
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            This is the primary content area.
          </p>
        </div>
        <div
          style={{
            background: 'var(--color-obsidian-raised)',
            border: '1px solid var(--color-border)',
            padding: 'var(--spacing-xl)',
            borderRadius: 'var(--spacing-md)',
            color: 'var(--color-text-primary)',
          }}
        >
          <h3 style={{ color: 'var(--color-gold)', margin: '0 0 8px 0' }}>
            Sidebar
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            Secondary content or navigation.
          </p>
        </div>
      </>
    ),
  },
};

export const ResponsiveGrid: StoryObj<typeof Grid> = {
  args: {
    colsResponsive: { xs: 1, sm: 2, md: 3, lg: 4 },
    gap: 'md',
    children: (
      <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--color-gold-10)',
              border: '1px solid var(--color-gold-30)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--spacing-md)',
              color: 'var(--color-gold)',
              textAlign: 'center',
            }}
          >
            Card {i}
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Responsive grid: 1 column on mobile, 2 on tablet, 3 on small desktop, 4 on wide desktop. Resize the viewport to see breakpoints in action.',
      },
    },
  },
};

export const TwelveColumnGrid: StoryObj<typeof Grid> = {
  args: {
    cols: 12,
    gap: 'xs',
    children: (
      <>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div
            key={i}
            style={{
              background: i % 2 === 0 ? 'var(--color-gold-15)' : 'var(--color-obsidian-raised)',
              border: '1px solid var(--color-border)',
              padding: 'var(--spacing-sm)',
              borderRadius: '2px',
              color: 'var(--color-text-primary)',
              fontSize: '11px',
              textAlign: 'center',
            }}
          >
            {i}
          </div>
        ))}
      </>
    ),
  },
};

export const EqualHeight: StoryObj<typeof Grid> = {
  args: {
    cols: 3,
    gap: 'md',
    equalHeight: true,
    children: (
      <>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--spacing-md)',
            color: 'var(--color-text-primary)',
          }}
        >
          <div style={{ height: 40, background: 'var(--color-gold-15)', borderRadius: 4, marginBottom: 8 }} />
          Short content
        </div>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--spacing-md)',
            color: 'var(--color-text-primary)',
          }}
        >
          <div style={{ height: 80, background: 'var(--color-gold-15)', borderRadius: 4, marginBottom: 8 }} />
          Taller content that makes this cell taller than the neighbors, demonstrating equal-height rows.
        </div>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--spacing-md)',
            color: 'var(--color-text-primary)',
          }}
        >
          <div style={{ height: 50, background: 'var(--color-gold-15)', borderRadius: 4, marginBottom: 8 }} />
          Medium content
        </div>
      </>
    ),
  },
};

/* -------------------------------------------------------------------------- */
/*  Flex Stories                                                           */
/* -------------------------------------------------------------------------- */

const flexMeta: Meta<typeof Flex> = {
  title: 'Layout/Flex',
  component: Flex,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'col', 'row-reverse', 'col-reverse'],
    },
    align: {
      control: 'select',
      options: ['start', 'end', 'center', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'end', 'center', 'between', 'around', 'evenly'],
    },
    wrap: { control: 'boolean' },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    inline: { control: 'boolean' },
  },
};

export default flexMeta;

export const RowCenter: StoryObj<typeof Flex> = {
  args: {
    direction: 'row',
    justify: 'center',
    align: 'center',
    gap: 'md',
    children: (
      <>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 64,
              height: 64,
              background: 'var(--color-gold)',
              borderRadius: 'var(--spacing-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-void)',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {i}
          </div>
        ))}
      </>
    ),
  },
};

export const ColumnLayout: StoryObj<typeof Flex> = {
  args: {
    direction: 'col',
    gap: 'sm',
    children: (
      <>
        <div
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-gold-15)',
            border: '1px solid var(--color-gold-30)',
            borderRadius: 'var(--spacing-sm)',
            color: 'var(--color-gold)',
          }}
        >
          Header
        </div>
        <div
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--spacing-sm)',
            color: 'var(--color-text-primary)',
            flex: 1,
          }}
        >
          Main Content Area
        </div>
        <div
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-gold-15)',
            border: '1px solid var(--color-gold-30)',
            borderRadius: 'var(--spacing-sm)',
            color: 'var(--color-gold)',
          }}
        >
          Footer
        </div>
      </>
    ),
  },
};

export const SpaceBetween: StoryObj<typeof Flex> = {
  args: {
    direction: 'row',
    justify: 'between',
    align: 'center',
    gap: 'md',
    children: (
      <>
        <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Logo</div>
        <Flex gap="sm">
          {['Home', 'About', 'Contact'].map((item) => (
            <span
              key={item}
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {item}
            </span>
          ))}
        </Flex>
      </>
    ),
  },
};

export const WrappedFlex: StoryObj<typeof Flex> = {
  args: {
    direction: 'row',
    wrap: true,
    gap: 'md',
    children: (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              width: 120,
              height: 80,
              background: 'var(--color-gold-10)',
              border: '1px solid var(--color-gold-30)',
              borderRadius: 'var(--spacing-md)',
            }}
          />
        ))}
      </>
    ),
  },
};

/* -------------------------------------------------------------------------- */
/*  Box Stories                                                          */
/* -------------------------------------------------------------------------- */

const boxMeta: Meta<typeof Box> = {
  title: 'Layout/Box',
  component: Box,
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: 'select',
      options: ['div', 'section', 'main', 'article', 'nav', 'header', 'footer'],
    },
    display: {
      control: 'select',
      options: ['flex', 'block', 'grid', 'inline-flex', 'none'],
    },
    direction: {
      control: 'select',
      options: ['row', 'col', 'row-reverse', 'col-reverse'],
    },
    align: {
      control: 'select',
      options: ['start', 'end', 'center', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'end', 'center', 'between', 'around', 'evenly'],
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
    },
    padding: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    },
  },
};

export default boxMeta;

export const Default: StoryObj<typeof Box> = {
  args: {
    as: 'div',
    display: 'block',
    padding: 'lg',
    bg: 'var(--color-surface)',
    rounded: 'lg',
    children: 'Box content',
  },
};

export const FlexBox: StoryObj<typeof Box> = {
  args: {
    as: 'section',
    display: 'flex',
    direction: 'row',
    justify: 'between',
    align: 'center',
    gap: 'md',
    padding: 'md',
    bg: 'var(--color-obsidian)',
    rounded: 'md',
    children: (
      <>
        <span style={{ color: 'var(--color-text-primary)' }}>Left</span>
        <span style={{ color: 'var(--color-text-secondary)' }}>Center</span>
        <span style={{ color: 'var(--color-text-primary)' }}>Right</span>
      </>
    ),
  },
};

export const GridBox: StoryObj<typeof Box> = {
  args: {
    as: 'main',
    display: 'grid',
    gap: 'md',
    padding: 'lg',
    bg: 'var(--color-obsidian-raised)',
    rounded: 'xl',
    children: (
      <>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: 'var(--spacing-lg)',
              background: 'var(--color-surface)',
              borderRadius: 'var(--spacing-md)',
              color: 'var(--color-text-primary)',
            }}
          >
            Item {i}
          </div>
        ))}
      </>
    ),
  },
};

export const Container: StoryObj<typeof Box> = {
  args: {
    as: 'section',
    padding: 'xl',
    bg: 'var(--color-surface)',
    rounded: 'none',
    maxWidth: '1280px',
    width: '100%',
    children: (
      <Flex direction="col" gap="sm">
        <h2 style={{ color: 'var(--color-gold)', margin: 0 }}>Container</h2>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Centered content with max-width constraint and responsive padding.
        </p>
      </Flex>
    ),
  },
};

/* -------------------------------------------------------------------------- */
/*  GridCell Stories                                                     */
/* -------------------------------------------------------------------------- */

const gridCellMeta: Meta<typeof GridCell> = {
  title: 'Layout/GridCell',
  component: GridCell,
  tags: ['autodocs'],
};

export default gridCellMeta;

export const Default: StoryObj<typeof GridCell> = {
  args: {
    span: 12,
    children: 'Full width cell',
  },
};

export const HalfSpan: StoryObj<typeof GridCell> = {
  args: {
    span: 6,
    children: 'Half width',
  },
};

export const QuarterSpan: StoryObj<typeof GridCell> = {
  args: {
    span: 3,
    children: 'Quarter',
  },
};

export const GridWithCells: StoryObj<typeof GridCell> = {
  args: {
    span: 8,
    children: (
      <div
        style={{
          padding: 'var(--spacing-lg)',
          background: 'var(--color-gold-10)',
          border: '1px solid var(--color-gold-30)',
          borderRadius: 'var(--spacing-md)',
          color: 'var(--color-gold)',
          height: '100%',
        }}
      >
        Main Content (8 cols)
      </div>
    ),
  },
};
