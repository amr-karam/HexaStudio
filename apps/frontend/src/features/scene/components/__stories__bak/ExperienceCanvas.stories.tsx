'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { ExperienceCanvas } from '../ExperienceCanvas';

import React from 'react';
import { QualityProvider } from '@/providers/quality-provider';
import { DesignerModeProvider } from '@/features/scene/store/designer-store';

interface ExperienceCanvasProps {
  projectModelUrl?: string;
  hotspots?: Record<string, unknown>[];
  projectTitle?: string;
  status?: string;
  milestones?: { total: number; completed: number };
}

const _ExperienceCanvasWithProviders: React.FC<ExperienceCanvasProps> = (props) => {
  return (
    <QualityProvider>
      <DesignerModeProvider>
        <ExperienceCanvas {...props} />
      </DesignerModeProvider>
    </QualityProvider>
  );
};

const meta: Meta<typeof ExperienceCanvas> = {
  title: '3D/ExperienceCanvas',
  component: ExperienceCanvas,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'obsidian',
      values: [
        { name: 'obsidian', value: '#0A0A0A' },
        { name: 'dark', value: '#050505' },
        { name: 'background', value: '#FAFAFA' },
        { name: 'light', value: '#FFFFFF' },
      ],
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: false },
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <QualityProvider>
        <DesignerModeProvider>
          <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
            <ExperienceCanvas {...Story.args} />
          </div>
        </DesignerModeProvider>
      </QualityProvider>
    ),
  ],
  argTypes: {
    projectModelUrl: { control: 'text' },
    projectTitle: { control: 'text' },
    status: { control: 'text' },
    milestones: {
      control: 'object',
      description: 'Milestone progress { total, completed }',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ExperienceCanvas>;

export const Default: Story = {
  args: {
    projectTitle: 'Hexa Crystal Pavilion',
    status: 'Active',
    milestones: { total: 12, completed: 8 },
  },
};

export const WithModel: Story = {
  args: {
    projectModelUrl: '/models/hexa-crystal.glb',
    projectTitle: 'Hexa Crystal Pavilion',
    status: 'Active',
    milestones: { total: 12, completed: 8 },
  },
};

export const WithHotspots: Story = {
  args: {
    projectTitle: 'Hexa Crystal Pavilion',
    status: 'Active',
    milestones: { total: 12, completed: 8 },
    hotspots: [
      {
        id: '1',
        title: 'Entrance Canopy',
        description: 'Parametric glass canopy with integrated lighting',
        position: [0, 2, 3],
        lookAt: [0, 1.5, 3],
      },
      {
        id: '2',
        title: 'Main Atrium',
        description: 'Triple-height space with dynamic light refraction',
        position: [0, 5, 0],
        lookAt: [0, 3, 0],
      },
    ],
  },
};

export const WithMilestones: Story = {
  args: {
    projectTitle: 'Hexa Crystal Pavilion',
    status: 'Completed',
    milestones: { total: 15, completed: 15 },
  },
};

export const ReducedMotion: Story = {
  args: {
    projectTitle: 'Hexa Crystal Pavilion',
    status: 'Active',
    milestones: { total: 12, completed: 8 },
  },
  parameters: {
    controls: { disable: true },
  },
};

export const NoWebGL: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: () => (
    <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
        <h3 style={{ color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>
          3D Scene Unavailable
        </h3>
        <p style={{ color: '#999', fontSize: '12px', lineHeight: 1.5 }}>
          WebGL is not supported in this browser. Please try a different browser.
        </p>
      </div>
    </div>
  ),
};