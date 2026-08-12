import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

// framer-motion is mocked globally via test/setup.ts (motion.* become passthrough).
// We only need to silence Radix Slot + framer-motion type/runtime noise here.

describe('Button', () => {
  afterEach(() => {
    cleanup();
    // Cancel any lingering framer-motion rAF callbacks
    const highestId = window.requestAnimationFrame(() => {});
    for (let id = 0; id <= highestId; id++) {
      window.cancelAnimationFrame(id);
    }
  });

  describe('rendering', () => {
    it('renders a button with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('forwards ref to the button element', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Ref</Button>);
      expect(ref).toHaveBeenCalledTimes(1);
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });

    it('passes through standard button attributes', () => {
      render(
        <Button data-testid="btn" name="submit" type="submit" form="my-form">
          Submit
        </Button>
      );
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveAttribute('name', 'submit');
      expect(btn).toHaveAttribute('type', 'submit');
      expect(btn).toHaveAttribute('form', 'my-form');
    });
  });

  describe('variants', () => {
    const variants = [
      'primary',
      'secondary',
      'ghost',
      'danger',
      'outline',
      'luxury',
      'couture',
      'glass',
    ] as const;

    variants.forEach((variant) => {
      it(`renders the ${variant} variant without error`, () => {
        const { container } = render(<Button variant={variant}>V</Button>);
        const btn = container.querySelector('button');
        expect(btn).not.toBeNull();
        expect(btn?.className).toBeTruthy();
      });
    });

    it('defaults to primary variant', () => {
      const { container } = render(<Button>Default</Button>);
      const btn = container.querySelector('button');
      // primary includes bg-accent
      expect(btn?.className).toContain('bg-accent');
    });
  });

  describe('sizes', () => {
    it('applies sm size classes', () => {
      const { container } = render(<Button size="sm">S</Button>);
      expect(container.querySelector('button')?.className).toContain('h-8');
    });

    it('applies md (default) size classes', () => {
      const { container } = render(<Button>M</Button>);
      expect(container.querySelector('button')?.className).toContain('h-11');
    });

    it('applies lg size classes', () => {
      const { container } = render(<Button size="lg">L</Button>);
      expect(container.querySelector('button')?.className).toContain('h-14');
    });

    it('applies icon size classes (square, no padding)', () => {
      const { container } = render(<Button size="icon">X</Button>);
      const cls = container.querySelector('button')?.className ?? '';
      expect(cls).toContain('h-9');
      expect(cls).toContain('w-9');
      expect(cls).toContain('p-0');
    });
  });

  describe('isLoading', () => {
    it('disables the button when loading', () => {
      render(<Button isLoading>Load</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders the loading spinner when loading (aria-hidden)', () => {
      const { container } = render(<Button isLoading>Load</Button>);
      // Spinner is aria-hidden; verify it exists as a decorative span
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).not.toBeNull();
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('disabled state', () => {
    it('reflects the disabled attribute', () => {
      render(<Button disabled>Off</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disables when isLoading overrides enabled prop', () => {
      render(
        <Button isLoading disabled={false}>
          Both
        </Button>
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('shimmer', () => {
    it('renders shimmer for primary variant', () => {
      const { container } = render(<Button variant="primary">P</Button>);
      expect(container.querySelector('.overflow-hidden')).not.toBeNull();
    });

    it('renders shimmer for luxury variant', () => {
      const { container } = render(<Button variant="luxury">L</Button>);
      expect(container.querySelector('.overflow-hidden')).not.toBeNull();
    });

    it('renders shimmer for glass variant', () => {
      const { container } = render(<Button variant="glass">G</Button>);
      expect(container.querySelector('.overflow-hidden')).not.toBeNull();
    });

    it('omits shimmer for ghost variant', () => {
      const { container } = render(<Button variant="ghost">Gh</Button>);
      expect(container.querySelector('.overflow-hidden')).toBeNull();
    });
  });

  describe('interaction', () => {
    it('fires onClick handler', () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Tap</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClick when disabled', () => {
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          No
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('marks decorative shimmer as aria-hidden', () => {
      const { container } = render(<Button variant="primary">A11y</Button>);
      const shimmerWrapper = container.querySelector('.overflow-hidden');
      expect(shimmerWrapper).toHaveAttribute('aria-hidden', 'true');
    });

    it('marks loading spinner as aria-hidden', () => {
      const { container } = render(<Button isLoading>L</Button>);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('supports aria-label override', () => {
      render(<Button aria-label="Save document">💾</Button>);
      expect(screen.getByRole('button', { name: 'Save document' })).toBeInTheDocument();
    });

    it('has visible focus styles (focus-visible ring)', () => {
      const { container } = render(<Button>Focus</Button>);
      const cls = container.querySelector('button')?.className ?? '';
      expect(cls).toContain('focus-visible:ring');
      expect(cls).toContain('focus-visible:ring-accent');
    });
  });

  describe('asChild', () => {
    it('renders the child element instead of a button when asChild is set', () => {
      render(
        <Button asChild>
          <a href="/somewhere">Link Button</a>
        </Button>
      );
      // Should render an anchor, not a button
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.getByRole('link', { name: 'Link Button' })).toHaveAttribute('href', '/somewhere');
    });

    it('forwards className to the slotted child', () => {
      render(
        <Button asChild data-testid="slotted">
          <a href="/x">X</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link.className).toContain('inline-flex');
    });
  });
});
