import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactRibbon } from '@/components/ui/ContactRibbon';

const hoisted = vi.hoisted(() => ({
  staticMode: false,
  paused: false,
}));

vi.mock('@/hooks/useMotionPolicy', () => ({
  useMotionPolicy: () => ({
    staticMode: hoisted.staticMode,
    paused: hoisted.paused,
  }),
}));

vi.mock('@/i18n/LocaleProvider', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'en',
    dir: 'ltr',
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    span: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
}));

describe('ContactRibbon', () => {
  beforeEach(() => {
    hoisted.staticMode = false;
    hoisted.paused = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a link to /contact', () => {
    render(<ContactRibbon />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/contact');
  });

  it('link has an accessible name from the translation key', () => {
    render(<ContactRibbon />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'footer.startProject',
    );
  });

  it('renders the static branch when staticMode is true', () => {
    hoisted.staticMode = true;
    render(<ContactRibbon />);
    // Static branch renders a visible centered label
    expect(screen.getByText('footer.startProject')).toBeInTheDocument();
  });

  it('pauses marquee on mouse enter and resumes on mouse leave', () => {
    render(<ContactRibbon />);
    const link = screen.getByRole('link');
    fireEvent.mouseEnter(link);
    // After hover the static branch label should appear
    expect(screen.getByText('footer.startProject')).toBeInTheDocument();
    fireEvent.mouseLeave(link);
  });

  it('pauses on focus and resumes on blur', () => {
    render(<ContactRibbon />);
    const link = screen.getByRole('link');
    fireEvent.focus(link);
    expect(screen.getByText('footer.startProject')).toBeInTheDocument();
    fireEvent.blur(link);
  });

  it('has data-cursor="explore" for the custom cursor', () => {
    render(<ContactRibbon />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'data-cursor',
      'explore',
    );
  });
});
