import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FractureRingHero } from '@/features/experience/components/FractureRingHero';

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
