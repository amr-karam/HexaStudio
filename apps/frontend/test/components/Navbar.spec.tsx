import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Navbar } from '@/components/ui/nav/Navbar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/portfolio',
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img alt={props.alt as string} src={props.src as string} />,
}));

vi.mock('@/hooks/useHEXAMotion', () => ({
  useHEXAMotion: () => ({
    reduced: false,
    ease: { entrance: [0.16, 1, 0.3, 1], interaction: [0.34, 1.56, 0.64, 1] },
    duration: { component: 0.4, page: 0.75 },
    transition: vi.fn(() => ({ duration: 0.4 })),
    withReduced: vi.fn((v: unknown) => v),
  }),
}));

vi.mock('@/i18n/LocaleProvider', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'en',
    dir: 'ltr',
  }),
}));

vi.mock('@/features/currency', () => ({
  CurrencySelector: () => <div data-testid="currency-selector" />,
}));

describe('Navbar', () => {
  beforeEach(() => {
    // Create main-content for inert testing
    const main = document.createElement('div');
    main.id = 'main-content';
    document.body.appendChild(main);
  });

  it('renders the navigation landmark', () => {
    render(<Navbar />);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('has aria-expanded on the menu trigger', () => {
    render(<Navbar />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('has aria-controls on the menu trigger', () => {
    render(<Navbar />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    expect(trigger).toHaveAttribute('aria-controls', 'mobile-menu');
  });

  it('opens mobile menu on trigger click', () => {
    render(<Navbar />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Mobile navigation' })).toBeInTheDocument();
  });

  it('closes mobile menu on Escape', async () => {
    render(<Navbar />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Mobile navigation' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    // AnimatePresence keeps the element during exit animation.
    // Wait for the exit animation to complete and the element to be removed.
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Mobile navigation' })).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('makes main content inert when menu is open', () => {
    render(<Navbar />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(trigger);
    const main = document.getElementById('main-content');
    expect(main).toHaveAttribute('inert');
  });
});
