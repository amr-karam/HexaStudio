import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FractureRingHero } from '@/features/experience/components/FractureRingHero';

// FractureRingHero -> SceneErrorBoundary imports @sentry/nextjs. Its CJS build
// requires next/constants, which cannot be resolved from the root-hoisted
// @sentry/nextjs in this monorepo (next is nested under apps/frontend/node_modules).
// Unit tests render the static fallback path and never need real Sentry, so
// stub the SDK surface the component graph touches.
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

vi.mock('@/providers/quality-provider', () => ({
  useQualityTier: () => ({ tier: { level: 'low' }, ready: true }),
}));

vi.mock('@/hooks/useMotionPolicy', () => ({
  useMotionPolicy: () => ({ staticMode: false, animationsEnabled: true }),
}));

describe('FractureRingHero', () => {
  it('renders a static fallback on low quality tier without throwing', () => {
    const { container } = render(
      <FractureRingHero
        qualityTier={{ tier: { level: 'low' }, ready: true } as never}
        staticMode={false}
        finePointer={true}
        animationsEnabled={true}
      />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders a static fallback in static mode', () => {
    vi.doMock('@/providers/quality-provider', () => ({
      useQualityTier: () => ({ tier: { level: 'high' }, ready: true }),
    }));
    const { container } = render(
      <FractureRingHero
        qualityTier={{ tier: { level: 'high' }, ready: true } as never}
        staticMode={true}
        finePointer={true}
        animationsEnabled={true}
      />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
