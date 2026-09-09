'use client';

import React from 'react';
import { cn } from '@/components/ui/cn';
import { Heading, Text, Code, Lead } from '@/components/ui/typography';

/* ─── Visual Regression Baseline ───────────────────────────────
   This component captures the visual baseline for the typography system.
   Screenshot this at each breakpoint (320px, 768px, 1024px, 1440px)
   and store as the regression reference.
────────────────────────────────────────────────────────────────────── */

interface TypographyBaselineProps {
  className?: string;
}

const TypographyBaseline: React.FC<TypographyBaselineProps> = ({ className }) => {
  return (
    <section
      className={cn(
        'flex flex-col gap-8 p-6 max-w-4xl mx-auto',
        'bg-void text-foreground',
        className,
      )}
      data-testid="typography-baseline"
    >
      {/* ── Hierarchy Chain ── */}
      <div className="flex flex-col gap-4">
        <Heading level="h1" gradient>Heading 1</Heading>
        <Heading level="h2">Heading 2</Heading>
        <Heading level="h3">Heading 3</Heading>
        <Heading level="h4">Heading 4</Heading>
        <Heading level="h5">Heading 5</Heading>
        <Heading level="h6">Heading 6</Heading>
      </div>

      {/* ── Text Scale ── */}
      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <Heading level="h4">Text Scale</Heading>
        <Text size="xs">Extra small text — 10px</Text>
        <Text size="sm">Small text — 13px</Text>
        <Text size="base">Base text — 15px</Text>
        <Text size="lg">Large text — 17px</Text>
        <Text size="xl">Extra large text — 19px</Text>
        <Text size="2xl">2XL text — 24px</Text>
        <Text size="3xl">3XL text — 30px</Text>
      </div>

      {/* ── Weights ── */}
      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <Heading level="h4">Weights</Heading>
        <Text weight="light">Light weight</Text>
        <Text weight="regular">Regular weight</Text>
        <Text weight="medium">Medium weight</Text>
        <Text weight="bold">Bold weight</Text>
      </div>

      {/* ── Code ── */}
      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <Heading level="h4">Code</Heading>
        <Code variant="inline">inline code</Code>
        <Code variant="block" language="typescript">
{`const greeting = "Hello, HEXA STUDIO";`}
        </Code>
      </div>

      {/* ── Lead ── */}
      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <Heading level="h4">Lead</Heading>
        <Lead>
          This is a lead paragraph — large, light text for introductory
          sections and hero content areas.
        </Lead>
      </div>

      {/* ── Colors ── */}
      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <Heading level="h4">Colors</Heading>
        <Text color="primary">Primary</Text>
        <Text color="secondary">Secondary</Text>
        <Text color="muted">Muted</Text>
        <Text color="gold">Gold</Text>
        <Text color="foreground">Foreground</Text>
      </div>
    </section>
  );
};

export { TypographyBaseline };
export default TypographyBaseline;
