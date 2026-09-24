import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { XRGuidedTour } from '@/features/xr/components/XRGuidedTour';
import { useXRStore } from '@/features/xr/store/xr-store';

describe('XRGuidedTour', () => {
  beforeEach(() => {
    useXRStore.setState({ status: 'idle', placementPhase: 'idle', mode: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when session is idle', () => {
    useXRStore.setState({ status: 'idle' });
    const { container } = render(<XRGuidedTour />);
    expect(container.firstChild).toBeNull();
  });

  it('shows guided steps when session is active', () => {
    useXRStore.setState({ status: 'active' });
    render(<XRGuidedTour />);
    expect(screen.getByText('Welcome to HEXA Studio')).toBeInTheDocument();
  });

  it('advances through steps and hides after final step', () => {
    useXRStore.setState({ status: 'requesting' });
    render(<XRGuidedTour />);
    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    expect(screen.queryByText('Welcome to HEXA Studio')).not.toBeInTheDocument();
  });
});
