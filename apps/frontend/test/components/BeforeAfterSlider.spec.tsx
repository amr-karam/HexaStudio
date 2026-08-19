import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider';

describe('BeforeAfterSlider', () => {
  const defaultProps = {
    beforeImage: '/images/before.jpg',
    afterImage: '/images/after.jpg',
    beforeLabel: 'Raw CAD',
    afterLabel: 'Photoreal 3D',
  };

  it('renders before and after labels correctly', () => {
    render(<BeforeAfterSlider {...defaultProps} />);
    expect(screen.getByText('Raw CAD')).toBeInTheDocument();
    expect(screen.getByText('Photoreal 3D')).toBeInTheDocument();
  });

  it('renders slider handle with correct ARIA attributes', () => {
    render(<BeforeAfterSlider {...defaultProps} initialPosition={50} />);
    const slider = screen.getByRole('slider', { name: /comparison slider position/i });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('updates position when arrow keys are pressed', () => {
    render(<BeforeAfterSlider {...defaultProps} initialPosition={50} />);
    const slider = screen.getByRole('slider', { name: /comparison slider position/i });

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '52');

    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');

    fireEvent.keyDown(slider, { key: 'Home' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');

    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider).toHaveAttribute('aria-valuenow', '100');
  });
});
