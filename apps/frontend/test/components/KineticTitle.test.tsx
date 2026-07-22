import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KineticTitle } from '@/components/scroll/KineticTitle';

// Static mode (reduced motion) → KineticTitle renders plain semantic text
// and never reaches for GSAP/ScrollTrigger.
vi.mock('@/hooks/useMotionPolicy', () => ({
  useMotionPolicy: () => ({ staticMode: true }),
}));

vi.mock('@/providers/quality-provider', () => ({
  useQualityTier: () => ({ tier: { level: 'high' }, ready: true }),
}));

describe('KineticTitle (static mode)', () => {
  it('renders the full text as an accessible heading', () => {
    render(<KineticTitle text="How We Create" accentWords={['Create']} />);
    expect(screen.getByRole('heading', { name: 'How We Create' })).toBeInTheDocument();
  });

  it('renders the requested heading level', () => {
    render(<KineticTitle as="h3" text="Proof in Numbers" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Proof in Numbers' })).toBeInTheDocument();
  });

  it('applies the accent class to accent words only', () => {
    const { container } = render(
      <KineticTitle text="Creating Visual Truth" accentWords={['Visual']} />,
    );
    const accents = container.querySelectorAll('.italic');
    expect(accents).toHaveLength(1);
    expect(accents[0].textContent).toContain('Visual');
  });

  it('respects a custom accent class', () => {
    const { container } = render(
      <KineticTitle
        text="How We Create"
        accentWords={['Create']}
        accentClassName="text-gold"
      />,
    );
    expect(container.querySelector('.text-gold')?.textContent).toContain('Create');
  });
});
