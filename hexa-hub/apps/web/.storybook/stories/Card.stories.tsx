// ─── HEXA Hub — Card Stories ────────────────────────────────────────────────
// Documents all Card variants, hover behaviors, padding options, compositions.
// Follows the dark luxury design system with gold (#D4A843) edge glow.
// ───────────────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
} from 'lucide-react';
import React from 'react';

// ─── Metadata ─────────────────────────────────────────────────────────────

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'elevated', 'glass'],
      description: 'Visual style of the card container.',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    hover: {
      control: 'radio',
      options: ['none', 'glow', 'lift'],
      description: 'Hover animation effect.',
      table: {
        defaultValue: { summary: 'glow' },
      },
    },
    padding: {
      control: 'radio',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Inner padding preset.',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    onClick: {
      action: 'clicked',
      description: 'If provided, the card becomes interactive (button).',
    },
    children: {
      control: false,
      description: 'Card content.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// ─── Variants ──────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    children: (
      <div className="text-white">
        <h3 className="text-base font-light tracking-wide">Default Card</h3>
        <p className="text-sm text-[#888] mt-1 font-light">
          The standard card container with subtle borders.
        </p>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    children: (
      <div className="text-white">
        <h3 className="text-base font-light tracking-wide">Elevated Card</h3>
        <p className="text-sm text-[#888] mt-1 font-light">
          Deeper shadow for layering and hierarchy.
        </p>
      </div>
    ),
  },
};

export const Glass: Story = {
  name: 'Glass (frosted)',
  args: {
    variant: 'glass',
    padding: 'md',
    children: (
      <div className="text-white">
        <h3 className="text-base font-light tracking-wide">Glass Card</h3>
        <p className="text-sm text-[#888] mt-1 font-light">
          Frosted glass effect with backdrop blur.
        </p>
      </div>
    ),
    className: 'max-w-md',
  },
  decorators: [
    (Story) => (
      <div className="relative">
        {/* Background to show glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A843]/10 to-[#D4A843]/5 rounded-2xl" />
        <div className="absolute top-[-20%] left-[10%] w-40 h-40 bg-[#D4A843]/10 blur-[60px] rounded-full" />
        <Story />
      </div>
    ),
  ],
};

// ─── All Variants Overview ─────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card variant="default" padding="md">
        <h3 className="text-sm uppercase tracking-[0.15em] text-[#555] mb-2 font-light">
          Default
        </h3>
        <p className="text-sm text-[#888] font-light">
          Standard card with minimal styling.
        </p>
      </Card>
      <Card variant="elevated" padding="md">
        <h3 className="text-sm uppercase tracking-[0.15em] text-[#555] mb-2 font-light">
          Elevated
        </h3>
        <p className="text-sm text-[#888] font-light">
          Pronounced shadow for depth.
        </p>
      </Card>
      <Card variant="glass" padding="md">
        <h3 className="text-sm uppercase tracking-[0.15em] text-[#555] mb-2 font-light">
          Glass
        </h3>
        <p className="text-sm text-[#888] font-light">
          Frosted glass transparency.
        </p>
      </Card>
    </div>
  ),
};

// ─── Padding Options ───────────────────────────────────────────────────────

export const PaddingNone: Story = {
  args: {
    variant: 'default',
    padding: 'none',
    children: (
      <div className="text-white p-0">
        <div className="bg-gradient-to-br from-[#D4A843]/10 to-transparent h-32 rounded-2xl flex items-center justify-center">
          <p className="text-sm text-[#888] font-light">No padding card</p>
        </div>
      </div>
    ),
  },
};

export const PaddingOptions: Story = {
  name: 'Padding Options',
  render: () => (
    <div className="space-y-4">
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <Card key={padding} variant="default" padding={padding}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#555] uppercase tracking-[0.15em] font-light w-10">
              {padding}
            </span>
            <span className="text-sm text-[#888] font-light">
              Padding preset {padding}
            </span>
          </div>
        </Card>
      ))}
    </div>
  ),
};

// ─── Hover Behaviors ───────────────────────────────────────────────────────

export const HoverGlow: Story = {
  name: 'Hover: Glow',
  args: {
    variant: 'default',
    hover: 'glow',
    padding: 'md',
    children: (
      <p className="text-sm text-[#888] font-light">
        Hover over me — I glow with a gold edge accent.
      </p>
    ),
  },
};

export const HoverLift: Story = {
  name: 'Hover: Lift',
  args: {
    variant: 'elevated',
    hover: 'lift',
    padding: 'md',
    children: (
      <p className="text-sm text-[#888] font-light">
        Hover over me — I lift up slightly.
      </p>
    ),
  },
};

export const HoverNone: Story = {
  name: 'Hover: None',
  args: {
    variant: 'default',
    hover: 'none',
    padding: 'md',
    children: (
      <p className="text-sm text-[#888] font-light">
        No hover effect — completely static.
      </p>
    ),
  },
};

// ─── Interactive (Clickable) Card ──────────────────────────────────────────

export const Clickable: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    onClick: () => {},
    children: (
      <div className="flex items-center justify-between">
        <p className="text-sm text-white font-light">
          Click me — I&apos;m interactive
        </p>
        <ArrowUpRight size={16} className="text-[#D4A843]" />
      </div>
    ),
  },
};

// ─── Real-World Compositions ───────────────────────────────────────────────

export const StatCard: Story = {
  name: 'Composition: Stat Card',
  render: () => (
    <Card variant="elevated" padding="md" className="max-w-[280px]">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 border border-[#D4A843]/10 flex items-center justify-center">
          <TrendingUp size={18} className="text-[#D4A843]" strokeWidth={1.5} />
        </div>
        <Badge variant="success">+12.5%</Badge>
      </div>
      <h3 className="text-2xl font-light text-white tracking-tight">$48,290</h3>
      <p className="text-xs text-[#555] mt-1 font-light tracking-wide">
        Monthly Revenue
      </p>
    </Card>
  ),
};

export const MetricGrid: Story = {
  name: 'Composition: Metric Grid',
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[
        { icon: <TrendingUp size={18} />, label: 'Revenue', value: '$48.2K', change: '+12.5%', positive: true },
        { icon: <Users size={18} />, label: 'Active Users', value: '2,847', change: '+8.2%', positive: true },
        { icon: <DollarSign size={18} />, label: 'Deals Closed', value: '124', change: '-3.1%', positive: false },
      ].map((metric) => (
        <Card key={metric.label} variant="default" hover="glow" padding="md">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4A843]/5 border border-[#D4A843]/10 flex items-center justify-center">
              <span className="text-[#D4A843]">{metric.icon}</span>
            </div>
            <span
              className={`text-[11px] font-light ${metric.positive ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {metric.change}
            </span>
          </div>
          <h3 className="text-xl font-light text-white tracking-tight">
            {metric.value}
          </h3>
          <p className="text-[10px] text-[#555] uppercase tracking-[0.15em] mt-0.5 font-light">
            {metric.label}
          </p>
        </Card>
      ))}
    </div>
  ),
};

export const ProjectCard: Story = {
  name: 'Composition: Project Card',
  render: () => (
    <Card
      variant="default"
      hover="glow"
      padding="md"
      className="max-w-[400px]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar
            size="sm"
            fallback="PN"
            className="bg-[#D4A843]/20 text-[#D4A843]"
          />
          <div>
            <h3 className="text-sm font-light text-white tracking-wide">
              Project Nexus
            </h3>
            <p className="text-[11px] text-[#555] font-light">
              Client: HEXA Innovations
            </p>
          </div>
        </div>
        <button className="text-[#555] hover:text-white transition-colors p-1">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-[#555] uppercase tracking-[0.15em] font-light">
            Progress
          </span>
          <span className="text-[10px] text-[#888] font-light">68%</span>
        </div>
        <div className="h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D4A843] rounded-full transition-all"
            style={{ width: '68%' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#1F1F1F]">
        <div className="flex items-center gap-2 text-[11px] text-[#555] font-light">
          <Clock size={12} />
          Due Dec 15
        </div>
        <Badge variant="default">In Progress</Badge>
      </div>
    </Card>
  ),
};

export const ActionCard: Story = {
  name: 'Composition: Action Card',
  render: () => (
    <Card variant="elevated" padding="lg" className="max-w-[360px] text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D4A843]/10 border border-[#D4A843]/10 flex items-center justify-center mb-5">
        <Plus size={28} className="text-[#D4A843]" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-light text-white tracking-wide mb-2">
        Create New Project
      </h3>
      <p className="text-sm text-[#666] font-light mb-6 leading-relaxed">
        Start fresh with a new workspace. Define milestones, assign your team,
        and set deadlines.
      </p>
      <Button variant="primary" className="w-full">
        Get Started
        <ArrowRight size={14} />
      </Button>
    </Card>
  ),
};

export const CardGrid: Story = {
  name: 'Composition: Dense Grid',
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} variant="default" hover="glow" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4A843]/10 border border-[#D4A843]/5 flex items-center justify-center shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-white font-light truncate">
                Item {i + 1}
              </p>
              <p className="text-[10px] text-[#555] font-light">
                Category
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  ),
};
