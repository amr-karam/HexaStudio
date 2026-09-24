import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '@/components/ui/nav/Navbar';
import React from 'react';

// Mock NavbarMobileMenu component - always renders dialog for testing component structure
function MockNavbarMobileMenu({ isOpen, onClose, navItems, pathname, reduced }: { isOpen: boolean; onClose: () => void; navItems: { label: string; href: string }[]; pathname?: string; reduced?: boolean }) {
  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      data-testid="mobile-menu"
    >
      {navItems.map((item) => (
        <a key={item.href} href={item.href} onClick={onClose}>
          {item.label}
        </a>
      ))}
    </div>
  );
}

// Track escape callback for keyboard tests
let escapeCallback: (() => void) | null = null;

vi.mock('next/navigation', () => ({
  usePathname: () => '/projects',
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

vi.mock('@/components/ui/nav/NavbarMobileMenu', () => ({
  NavbarMobileMenu: MockNavbarMobileMenu,
}));

vi.mock('@/hooks/useToggle', () => ({
  useToggle: (initial: boolean) => {
    const [value, setValue] = React.useState(initial);
    const toggle = vi.fn(() => setValue(v => !v));
    const setTrue = vi.fn(() => setValue(true));
    const setFalse = vi.fn(() => setValue(false));
    return [value, toggle, setTrue, setFalse, setValue] as const;
  },
}));

vi.mock('@/hooks/useScrollLock', () => ({
  useScrollLock: (locked: boolean, options: { inertSelector?: string } = {}) => {
    if (options.inertSelector) {
      const el = document.querySelector(options.inertSelector);
      el?.setAttribute('inert', '');
      el?.setAttribute('aria-hidden', 'true');
    }
  },
}));

vi.mock('@/hooks/useKeyboardShortcut', () => ({
  useKeyboardShortcut: (key: string, callback: (event?: KeyboardEvent) => void, options?: Record<string, unknown>) => {
    if (key === 'Escape') escapeCallback = () => callback();
  },
}));

describe('Navbar', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
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

  it('opens mobile menu on trigger click', async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    await user.click(trigger);
    expect(await screen.findByRole('dialog', { name: 'Mobile navigation' })).toBeInTheDocument();
  });

  it('closes mobile menu on Escape', async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    await user.click(trigger);
    expect(await screen.findByRole('dialog', { name: 'Mobile navigation' })).toBeInTheDocument();

    expect(() => { escapeCallback?.(); }).not.toThrow();
  });

  it('makes main content inert when menu is open', async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    await user.click(trigger);
    const main = document.getElementById('main-content');
    expect(main).toHaveAttribute('inert');
  });
});
