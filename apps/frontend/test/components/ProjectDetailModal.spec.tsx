import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ProjectDetailModal } from '@/components/ui/modals/ProjectDetailModal';

vi.mock('@/hooks/useHEXAMotion', () => ({
  useHEXAMotion: () => ({
    reduced: false,
    ease: { entrance: [0.16, 1, 0.3, 1] },
    duration: { component: 0.4 },
    transition: vi.fn(() => ({ duration: 0.4 })),
    withReduced: vi.fn((v: unknown) => v),
  }),
}));

const mockProject = {
  title: 'Test Project',
  category: 'Residential',
  image: '/test.jpg',
  slug: 'test-project',
  description: 'A test project description.',
  status: 'Active',
};

describe('ProjectDetailModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    const main = document.createElement('div');
    main.id = 'main-content';
    document.body.appendChild(main);
  });

  afterEach(() => {
    // Clean up rendered components and pending framer-motion animations
    cleanup();
    // Cancel all pending requestAnimationFrame callbacks from framer-motion
    const highestId = window.requestAnimationFrame(() => {});
    for (let id = 0; id <= highestId; id++) {
      window.cancelAnimationFrame(id);
    }
    document.body.style.overflow = '';
  });

  it('renders nothing when closed', () => {
    render(<ProjectDetailModal isOpen={false} onClose={onClose} project={mockProject} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when open', () => {
    render(<ProjectDetailModal isOpen={true} onClose={onClose} project={mockProject} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('sets aria-modal on the dialog', () => {
    render(<ProjectDetailModal isOpen={true} onClose={onClose} project={mockProject} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when Escape is pressed', () => {
    render(<ProjectDetailModal isOpen={true} onClose={onClose} project={mockProject} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll when open', () => {
    render(<ProjectDetailModal isOpen={true} onClose={onClose} project={mockProject} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('makes main content inert when open', () => {
    render(<ProjectDetailModal isOpen={true} onClose={onClose} project={mockProject} />);
    const main = document.getElementById('main-content');
    expect(main).toHaveAttribute('inert');
    expect(main).toHaveAttribute('aria-hidden', 'true');
  });

  it('has a close button with aria-label', () => {
    render(<ProjectDetailModal isOpen={true} onClose={onClose} project={mockProject} />);
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
  });

  it('focuses the close button after open', async () => {
    render(<ProjectDetailModal isOpen={true} onClose={onClose} project={mockProject} />);
    const closeBtn = screen.getByLabelText('Close modal');
    // Focus is set via requestAnimationFrame — wait for it
    await waitFor(() => {
      expect(document.activeElement).toBe(closeBtn);
    });
  });

  it('has focusable elements inside the dialog', () => {
    render(<ProjectDetailModal isOpen={true} onClose={onClose} project={mockProject} />);
    const dialog = screen.getByRole('dialog');
    const focusableEls = dialog.querySelectorAll('button, a, [tabindex]');
    expect(focusableEls.length).toBeGreaterThan(0);
  });
});
