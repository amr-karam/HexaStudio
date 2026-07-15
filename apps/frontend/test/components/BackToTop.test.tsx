import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { BackToTop } from '@/components/BackToTop';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => {
      const { initial: _i, animate: _a, exit: _e, ...rest } = props;
      return <button onClick={onClick} {...rest}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('BackToTop', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render button when scroll position is low', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    render(<BackToTop />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders button when scrolled past threshold', () => {
    render(<BackToTop />);
    Object.defineProperty(window, 'scrollY', { value: 700, writable: true });
    fireEvent.scroll(window);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('scrolls to top when clicked', () => {
    const scrollToMock = vi.fn();
    vi.stubGlobal('scrollTo', scrollToMock);

    render(<BackToTop />);
    Object.defineProperty(window, 'scrollY', { value: 700, writable: true });
    fireEvent.scroll(window);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('hides button when scrolling back to top', () => {
    render(<BackToTop />);

    // Scroll down
    Object.defineProperty(window, 'scrollY', { value: 700, writable: true });
    fireEvent.scroll(window);
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Scroll back up
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    fireEvent.scroll(window);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
