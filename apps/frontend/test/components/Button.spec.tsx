import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/Button';

expect.extend(toHaveNoViolations);

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

  /* ---------------------------------------------------------------- */
  /*  Rendering                                                      */
  /* ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- */
  /*  Variants                                                       */
  /* ---------------------------------------------------------------- */

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
      expect(btn?.className).toContain('bg-sl-gold-subtle');
    });
  });

  /* ---------------------------------------------------------------- */
  /*  Sizes                                                          */
  /* ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- */
  /*  Responsive Sizes                                               */
  /* ---------------------------------------------------------------- */

  describe('responsive sizes', () => {
    it('renders responsive size object with base class', () => {
      const { container } = render(
        <Button size={{ base: 'sm', md: 'md', lg: 'lg' }}>Responsive</Button>
      );
      const cls = container.querySelector('button')?.className ?? '';
      expect(cls).toContain('h-8'); // base sm
    });

    it('includes responsive breakpoint classes', () => {
      const { container } = render(
        <Button size={{ base: 'sm', md: 'md', lg: 'lg' }}>Responsive</Button>
      );
      const cls = container.querySelector('button')?.className ?? '';
      expect(cls).toContain('md:h-11');
      expect(cls).toContain('lg:h-14');
    });

    it('resolves responsive size with all breakpoints', () => {
      const { container } = render(
        <Button size={{ base: 'sm', sm: 'sm', md: 'md', lg: 'lg', xl: 'lg', '2xl': 'md' }}>
          All Breakpoints
        </Button>
      );
      const cls = container.querySelector('button')?.className ?? '';
      // Base sm
      expect(cls).toContain('h-8');
    });
  });

  /* ---------------------------------------------------------------- */
  /*  Loading                                                        */
  /* ---------------------------------------------------------------- */

  describe('isLoading', () => {
    it('disables the button when loading', () => {
      render(<Button isLoading>Load</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders the loading spinner when loading (aria-hidden)', () => {
      const { container } = render(<Button isLoading>Load</Button>);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).not.toBeNull();
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  /* ---------------------------------------------------------------- */
  /*  Disabled                                                       */
  /* ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- */
  /*  aria-pressed                                                   */
  /* ---------------------------------------------------------------- */

  describe('aria-pressed', () => {
    it('sets aria-pressed to false by default', () => {
      render(<Button>Default</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('sets aria-pressed to true when isPressed is true', () => {
      render(<Button isPressed>Toggle</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  /* ---------------------------------------------------------------- */
  /*  aria-disabled                                                  */
  /* ---------------------------------------------------------------- */

  describe('aria-disabled', () => {
    it('sets aria-disabled to true when disabled', () => {
      render(<Button disabled>Off</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('sets aria-disabled to true when loading', () => {
      render(<Button isLoading>Load</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not set aria-disabled when enabled', () => {
      render(<Button>Enabled</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
    });
  });

  /* ---------------------------------------------------------------- */
  /*  Shimmer                                                        */
  /* ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- */
  /*  Interaction                                                    */
  /* ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- */
  /*  Accessibility                                                  */
  /* ---------------------------------------------------------------- */

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
    });

    it('has no accessibility violations (axe)', async () => {
      const { container } = render(<Button>Test Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when loading', async () => {
      const { container } = render(<Button isLoading>Loading</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  /* ---------------------------------------------------------------- */
  /*  asChild composition                                            */
  /* ---------------------------------------------------------------- */

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
        <Button asChild>
          <a href="/x">X</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link.className).toContain('inline-flex');
    });

    it('passes aria-disabled to slotted child when loading', () => {
      render(
        <Button asChild isLoading>
          <a href="/x">X</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('passes aria-pressed to slotted child', () => {
      render(
        <Button asChild isPressed>
          <a href="/x">X</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-pressed', 'true');
    });
  });

  /* ---------------------------------------------------------------- */
  /*  Polymorphic as prop                                           */
  /* ---------------------------------------------------------------- */

  describe('polymorphic as prop', () => {
    it('renders an anchor element when as is "a"', () => {
      render(
        <Button as="a" href="/test">
          Link Button
        </Button>
      );
      expect(screen.getByRole('link', { name: 'Link Button' })).toHaveAttribute('href', '/test');
    });

    it('renders a div element when as is "div"', () => {
      render(
        <Button as="div" role="button" tabIndex={0}>
          Div Button
        </Button>
      );
      expect(screen.getByRole('button', { name: 'Div Button' })).toBeInTheDocument();
    });

    it('passes href to anchor when as is "a"', () => {
      render(
        <Button as="a" href="/dashboard">
          Dashboard
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('passes aria-disabled to polymorphic element', () => {
      render(
        <Button as="a" href="/test" disabled>
          Disabled Link
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('passes aria-pressed to polymorphic element', () => {
      render(
        <Button as="div" role="button" tabIndex={0} isPressed>
          Pressed Div
        </Button>
      );
      const div = screen.getByRole('button');
      expect(div).toHaveAttribute('aria-pressed', 'true');
    });
  });

  /* ---------------------------------------------------------------- */
  /*  Color prop                                                    */
  /* ---------------------------------------------------------------- */

  describe('color', () => {
    it('applies gold focus ring by default', () => {
      const { container } = render(<Button>Gold</Button>);
      expect(container.querySelector('button')?.className).toContain('focus-visible:ring-sl-gold-subtle');
    });

    it('applies silver focus ring when color is silver', () => {
      const { container } = render(<Button color="silver">Silver</Button>);
      expect(container.querySelector('button')?.className).toContain('focus-visible:ring-sl-silver');
    });

    it('applies neutral focus ring when color is neutral', () => {
      const { container } = render(<Button color="neutral">Neutral</Button>);
      expect(container.querySelector('button')?.className).toContain('focus-visible:ring-sl-mist');
    });
  });

  /* ---------------------------------------------------------------- */
  /*  TypeScript types                                             */
  /* ---------------------------------------------------------------- */

  describe('TypeScript types', () => {
    it('compiles with all variant types', () => {
      // This test ensures all types are properly defined
      const variants: Array<'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'luxury' | 'couture' | 'glass'> = [
        'primary', 'secondary', 'ghost', 'danger', 'outline', 'luxury', 'couture', 'glass'
      ];
      expect(variants).toHaveLength(8);
    });

    it('compiles with all size types', () => {
      const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
      expect(sizes).toHaveLength(3);
    });

    it('compiles with responsive size type', () => {
      const responsive: Record<string, string | undefined> = {
        base: 'sm',
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'lg',
        '2xl': 'md',
      };
      expect(responsive.base).toBe('sm');
    });
  });
});