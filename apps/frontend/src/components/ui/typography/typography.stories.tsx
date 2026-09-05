import type { Meta, StoryObj } from '@storybook/react';
import { Heading, H1, H2, H3, H4, H5, H6, Text, Lead, Small, Caption, Mono, Code, BlockCode } from './typography';

/* -------------------------------------------------------------------------- */
/*  Heading Stories                                                      */
/* -------------------------------------------------------------------------- */

const headingMeta: Meta<typeof Heading> = {
  title: 'Typography/Heading',
  component: Heading,
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    font: {
      control: 'select',
      options: ['serif', 'sans'],
    },
    color: {
      control: 'select',
      options: ['primary', 'gold', 'muted'],
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'p'],
    },
  },
};

export default headingMeta;

export const H1: StoryObj<typeof Heading> = {
  args: {
    level: 1,
    children: 'H1 — Page Title',
  },
};

export const H2: StoryObj<typeof Heading> = {
  args: {
    level: 2,
    children: 'H2 — Section Title',
  },
};

export const H3: StoryObj<typeof Heading> = {
  args: {
    level: 3,
    children: 'H3 — Subsection Title',
  },
};

export const H4: StoryObj<typeof Heading> = {
  args: {
    level: 4,
    children: 'H4 — Card Title',
  },
};

export const H5: StoryObj<typeof Heading> = {
  args: {
    level: 5,
    children: 'H5 — Label',
  },
};

export const H6: StoryObj<typeof Heading> = {
  args: {
    level: 6,
    children: 'H6 — Caption Label',
  },
};

export const AllLevels: StoryObj<typeof Heading> = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Heading level={1}>Heading Level 1</Heading>
      <Heading level={2}>Heading Level 2</Heading>
      <Heading level={3}>Heading Level 3</Heading>
      <Heading level={4}>Heading Level 4</Heading>
      <Heading level={5}>Heading Level 5</Heading>
      <Heading level={6}>Heading Level 6</Heading>
    </div>
  ),
};

export const SerifFont: StoryObj<typeof Heading> = {
  args: {
    level: 1,
    font: 'serif',
    children: 'Serif Heading — Playfair Display',
  },
};

export const SansFont: StoryObj<typeof Heading> = {
  args: {
    level: 1,
    font: 'sans',
    children: 'Sans Heading — Inter',
  },
};

export const GoldColor: StoryObj<typeof Heading> = {
  args: {
    level: 1,
    color: 'gold',
    children: 'Gold Accent Heading',
  },
};

export const MutedColor: StoryObj<typeof Heading> = {
  args: {
    level: 2,
    color: 'muted',
    children: 'Muted Heading',
  },
};

export const PolymorphicSpan: StoryObj<typeof Heading> = {
  args: {
    level: 1,
    as: 'span',
    children: 'Rendered as <span> with h1 styles',
  },
};

/* -------------------------------------------------------------------------- */
/*  Pre-configured Components                                          */
/* -------------------------------------------------------------------------- */

const preConfigMeta: Meta = {
  title: 'Typography/PreConfigured',
  tags: ['autodocs'],
};

export default preConfigMeta;

export const H1Component: StoryObj = {
  args: {
    children: 'H1 Component',
  },
  render: (args) => <H1 {...args} />,
};

export const H2Component: StoryObj = {
  args: {
    children: 'H2 Component',
  },
  render: (args) => <H2 {...args} />,
};

export const H3Component: StoryObj = {
  args: {
    children: 'H3 Component',
  },
  render: (args) => <H3 {...args} />,
};

export const H4Component: StoryObj = {
  args: {
    children: 'H4 Component',
  },
  render: (args) => <H4 {...args} />,
};

export const H5Component: StoryObj = {
  args: {
    children: 'H5 Component',
  },
  render: (args) => <H5 {...args} />,
};

export const H6Component: StoryObj = {
  args: {
    children: 'H6 Component',
  },
  render: (args) => <H6 {...args} />,
};

/* -------------------------------------------------------------------------- */
/*  Text Stories                                                       */
/* -------------------------------------------------------------------------- */

const textMeta: Meta<typeof Text> = {
  title: 'Typography/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['body', 'lead', 'small', 'caption', 'mono'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'accent', 'inverse'],
    },
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'h1', 'h2', 'h3'],
    },
    strong: { control: 'boolean' },
  },
};

export default textMeta;

export const Body: StoryObj<typeof Text> = {
  args: {
    variant: 'body',
    children: 'This is body text. It uses the Inter typeface at 18px with relaxed line-height for comfortable reading.',
  },
};

export const Lead: StoryObj<typeof Text> = {
  args: {
    variant: 'lead',
    children: 'This is a lead paragraph. Larger and set in serif for editorial introductions.',
  },
};

export const Small: StoryObj<typeof Text> = {
  args: {
    variant: 'small',
    children: 'This is small text — secondary information, footnotes, helper text.',
  },
};

export const Caption: StoryObj<typeof Text> = {
  args: {
    variant: 'caption',
    color: 'muted',
    children: 'Last updated 2 hours ago — metadata caption text.',
  },
};

export const MonoText: StoryObj<typeof Text> = {
  args: {
    variant: 'mono',
    children: 'const greeting = "Hello, HEXA STUDIO";',
  },
};

export const Strong: StoryObj<typeof Text> = {
  args: {
    variant: 'body',
    strong: true,
    children: 'This is strong body text — semibold weight for emphasis.',
  },
};

export const ColorPrimary: StoryObj<typeof Text> = {
  args: {
    variant: 'body',
    color: 'primary',
    children: 'Primary colored text.',
  },
};

export const ColorAccent: StoryObj<typeof Text> = {
  args: {
    variant: 'body',
    color: 'accent',
    children: 'Accent colored text — gold.',
  },
};

export const SemanticVariants: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Lead>Lead paragraph for introductions</Lead>
      <Text>Regular body text for content</Text>
      <Small>Small text for secondary information</Small>
      <Caption>Caption text for metadata</Caption>
      <Mono>Monospace text for code</Mono>
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Semantic Text Components                                           */
/* -------------------------------------------------------------------------- */

const semanticMeta: Meta = {
  title: 'Typography/Semantic',
  tags: ['autodocs'],
};

export default semanticMeta;

export const LeadComponent: StoryObj = {
  args: {
    children: 'This is a lead paragraph. Larger and set in serif for editorial introductions.',
  },
  render: (args) => <Lead {...args} />,
};

export const SmallComponent: StoryObj = {
  args: {
    children: 'Small text for secondary information, footnotes, and helper text.',
  },
  render: (args) => <Small {...args} />,
};

export const CaptionComponent: StoryObj = {
  args: {
    children: 'Last updated 2 hours ago — metadata caption text.',
  },
  render: (args) => <Caption {...args} />,
};

export const MonoComponent: StoryObj = {
  args: {
    children: 'const greeting = "Hello, HEXA STUDIO";',
  },
  render: (args) => <Mono {...args} />,
};

/* -------------------------------------------------------------------------- */
/*  Code Stories                                                       */
/* -------------------------------------------------------------------------- */

const codeMeta: Meta<typeof Code> = {
  title: 'Typography/Code',
  component: Code,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['inline', 'block'],
    },
    language: {
      control: 'select',
      options: ['tsx', 'ts', 'jsx', 'js', 'css', 'json', 'html', 'bash', 'yaml'],
    },
    copyable: { control: 'boolean' },
  },
};

export default codeMeta;

export const Inline: StoryObj<typeof Code> = {
  args: {
    mode: 'inline',
    children: 'const name = "HEXA"',
  },
};

export const InlineTsx: StoryObj<typeof Code> = {
  args: {
    mode: 'inline',
    language: 'tsx',
    children: '<Heading level={1}>Title</Heading>',
  },
};

export const InlineCss: StoryObj<typeof Code> = {
  args: {
    mode: 'inline',
    language: 'css',
    children: 'color: var(--color-gold)',
  },
};

export const BlockTsx: StoryObj<typeof Code> = {
  args: {
    mode: 'block',
    language: 'tsx',
    copyable: true,
    children: 'import { Heading } from "@/components/ui/typography";\n\nexport function App() {\n  return (\n    <Heading level={1}>\n      HEXA STUDIO\n    </Heading>\n  );\n}',
  },
};

export const BlockCss: StoryObj<typeof Code> = {
  args: {
    mode: 'block',
    language: 'css',
    copyable: true,
    children: '@import "../components/ui/typography/typography.css";\n\n.heading-hex-1 {\n  font-size: var(--hex-responsive-text-4xl);\n  line-height: 0.85;\n}',
  },
};

export const BlockJson: StoryObj<typeof Code> = {
  args: {
    mode: 'block',
    language: 'json',
    copyable: true,
    children: '{\n  "theme": {\n    "font-sans": "Inter",\n    "font-serif": "Playfair Display"\n  }\n}',
  },
};

export const BlockTitle: StoryObj<typeof Code> = {
  args: {
    mode: 'block',
    language: 'tsx',
    copyable: true,
    title: 'App.tsx',
    children: 'export default function App() {\n  return <Heading level={1}>HEXA</Heading>;\n}',
  },
};

/* -------------------------------------------------------------------------- */
/*  BlockCode Stories                                                */
/* -------------------------------------------------------------------------- */

const blockCodeMeta: Meta<typeof BlockCode> = {
  title: 'Typography/BlockCode',
  component: BlockCode,
  tags: ['autodocs'],
};

export default blockCodeMeta;

export const BlockCodeDefault: StoryObj<typeof BlockCode> = {
  args: {
    language: 'tsx',
    title: 'heading.tsx',
    children: 'import { Heading } from "@/components/ui/typography";\n\nexport function App() {\n  return <Heading level={1}>HEXA</Heading>;\n}',
  },
};

export const BlockCodeNoTitle: StoryObj<typeof BlockCode> = {
  args: {
    language: 'css',
    children: '@import "../components/ui/typography/typography.css";',
  },
};

/* -------------------------------------------------------------------------- */
/*  Complete Type Scale                                              */
/* -------------------------------------------------------------------------- */

const typeScaleMeta: Meta = {
  title: 'Typography/TypeScale',
  tags: ['autodocs'],
};

export default typeScaleMeta;

export const FullScale: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-8">
      <h1>Heading 1 — 64px / 4rem</h1>
      <h2>Heading 2 — 48px / 3rem</h2>
      <h3>Heading 3 — 36px / 2.25rem</h3>
      <h4>Heading 4 — 24px / 1.5rem</h4>
      <h5>Heading 5 — 20px / 1.25rem</h5>
      <h6>Heading 6 — 18px / 1.125rem</h6>
      <p className="text-lg">Body Text — 18px / 1.125rem</p>
      <p className="text-sm">Small Text — 14px / 0.875rem</p>
      <p className="text-xs">Caption Text — 12px / 0.75rem</p>
    </div>
  ),
};

export const WithHeadingComponent: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      <H1>Heading Level 1 — Playfair Display</H1>
      <H2>Heading Level 2 — Serif</H2>
      <H3>Heading Level 3 — Serif</H3>
      <H4>Heading Level 4 — Serif</H4>
      <H5>Heading Level 5 — Serif</H5>
      <H6>Heading Level 6 — Serif</H6>
      <Text variant="body">Body text using Inter for comfortable reading at 18px.</Text>
      <Text variant="lead">Lead text for editorial introductions.</Text>
      <Text variant="small">Small text for secondary content.</Text>
      <Text variant="caption" color="muted">Caption text for metadata.</Text>
      <Text variant="mono">const greeting = "Hello";</Text>
    </div>
  ),
};

export const ResponsiveScale: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="caption" color="muted">Fluid type — scales with viewport</Text>
        <h1 className="text-fluid-h1 font-serif">Fluid H1</h1>
        <h2 className="text-fluid-h2 font-serif">Fluid H2</h2>
        <h3 className="text-fluid-h3 font-serif">Fluid H3</h3>
      </div>
    </div>
  ),
};