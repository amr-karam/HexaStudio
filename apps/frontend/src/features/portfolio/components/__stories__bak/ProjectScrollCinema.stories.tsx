'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { ProjectScrollCinema } from '../ProjectScrollCinema';

// Use the component's prop types instead of `any`
type ProjectProp = NonNullable<StoryObj<typeof ProjectScrollCinema>['args']>['project'];
const mockProject: ProjectProp = {
  id: '1',
  title: 'Hexa Crystal Pavilion',
  slug: 'hexa-crystal-pavilion',
  description: 'A crystalline architectural pavilion exploring the intersection of geometry and light. The pavilion features a faceted glass envelope that refracts natural light throughout the day, creating dynamic interior atmospheres.',
  shortDescription: 'Crystalline pavilion exploring geometry and light',
  coverImage: '/images/projects/hexa-crystal-cover.jpg',
  category: { id: '1', name: 'Cultural', slug: 'cultural' },
  client: 'Hexa Studio',
  location: 'Berlin, Germany',
  year: 2024,
  area: '1,200 m²',
  status: 'Completed',
  services: ['Architectural Visualization', 'Interactive 3D', 'VR Experience'],
  isPublished: true,
  editorial: {
    challenge: 'Creating a structure that dematerializes through light',
    solution: 'Faceted glass envelope with parametric geometry',
    credits: [
      { role: 'Lead Architect', name: 'Maria Schmidt', link: '#' },
      { role: '3D Artist', name: 'James Chen', link: '#' },
    ],
    technicalDetails: 'Parametric facade system with 847 unique glass panels',
  },
  heroMedia: {
    type: 'image',
    url: '/images/projects/hexa-crystal-hero.jpg',
    alt: 'Hexa Crystal Pavilion exterior',
  },
  gallery: [
    {
      id: '1',
      type: 'image',
      url: '/images/projects/hexa-crystal-1.jpg',
      alt: 'Exterior view',
      caption: 'Morning light through the crystalline facade',
    },
    {
      id: '2',
      type: 'image',
      url: '/images/projects/hexa-crystal-2.jpg',
      alt: 'Interior view',
      caption: 'Refracted light creating dynamic interior atmospheres',
    },
  ],
  storyBlocks: [
    {
      type: 'hero',
      content: {
        title: 'Hexa Crystal Pavilion',
        subtitle: 'Where geometry meets light',
        media: { type: 'image', url: '/images/projects/hexa-crystal-hero.jpg' },
      },
    },
    {
      type: 'text',
      content: {
        headline: 'The Concept',
        body: 'The pavilion explores the dematerialization of architecture through light. A faceted glass envelope refracts natural light throughout the day, creating dynamic interior atmospheres that shift with the sun\'s path.',
      },
    },
    {
      type: 'gallery',
      content: {
        images: [
          { url: '/images/projects/hexa-crystal-1.jpg', caption: 'Morning light' },
          { url: '/images/projects/hexa-crystal-2.jpg', caption: 'Interior atmosphere' },
        ],
        layout: 'grid',
      },
    },
    {
      type: 'stats',
      content: {
        items: [
          { label: 'Glass Panels', value: '847' },
          { label: 'Unique Geometries', value: '156' },
          { label: 'Refraction Index', value: '1.52' },
        ],
      },
    },
    {
      type: 'cta',
      content: {
        label: 'Explore in 3D',
        href: '/projects/hexa-crystal-pavilion#experience',
      },
    },
  ],
  modelUrl: '/models/hexa-crystal.glb',
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
  client: 'Hexa Studio',
  location: 'Berlin, Germany',
  year: 2024,
  area: '1,200 m²',
  status: 'Completed',
  services: ['Architectural Visualization', 'Interactive 3D', 'VR Experience'],
  milestones: { total: 12, completed: 8 },
  liveStatus: {
    stage: 'Construction',
    progress: 65,
    lastUpdate: '2024-01-15T00:00:00Z',
  },
  isPublished: true,
  createdAt: '2023-06-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

const meta: Meta<typeof ProjectScrollCinema> = {
  title: 'Portfolio/ProjectScrollCinema',
  component: ProjectScrollCinema,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'background',
      values: [
        { name: 'background', value: '#FAFAFA' },
        { name: 'dark', value: '#0A0A0A' },
        { name: 'light', value: '#FFFFFF' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    nextProject: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ProjectScrollCinema>;

export const Default: Story = {
  args: {
    project: mockProject,
  },
};

export const WithNextProject: Story = {
  args: {
    project: mockProject,
    nextProject: {
      ...mockProject,
      id: '2',
      title: 'Tower of Light',
      slug: 'tower-of-light',
      coverImage: '/images/projects/tower-cover.jpg',
      title: 'Tower of Light',
    },
  },
};

export const Mobile: Story = {
  args: {
    project: mockProject,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const Tablet: Story = {
  args: {
    project: mockProject,
  },
  parameters: {
    viewport: { defaultViewport: 'tablet' },
  },
};

export const Desktop: Story = {
  args: {
    project: mockProject,
  },
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
};

export const ReducedMotion: Story = {
  args: {
    project: mockProject,
  },
  parameters: {
    controls: { disable: true },
  },
};