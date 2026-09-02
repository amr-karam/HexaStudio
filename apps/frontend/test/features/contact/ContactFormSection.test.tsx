import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ContactFormSection } from '@/features/contact/components/ContactFormSection';

// Mock useMotionPolicy — avoids jsdom window.matchMedia/localStorage issues in CI
vi.mock('@/hooks/useMotionPolicy', () => ({
  useMotionPolicy: () => ({
    reducedMotion: false,
    paused: false,
    finePointer: true,
    animationsEnabled: true,
    staticMode: false,
    togglePause: vi.fn(),
    setPaused: vi.fn(),
  }),
}));

// Mock framer-motion — in jsdom, AnimatePresence/motion components don't animate
// and their initial states prevent timely DOM updates. Mock to render children
// immediately, stripping animation-only props. Pattern from ChapterMarker.test.tsx.
vi.mock('framer-motion', () => {
  const motionOnlyProps = new Set<string>([
    'variants', 'initial', 'animate', 'exit', 'whileInView', 'whileHover',
    'whileTap', 'viewport', 'custom', 'transition', 'onViewportEnter', 'onViewportLeave',
  ]);

  const makeMotion = (tag: React.ElementType) => {
    const MotionComponent = ({ children, ...props }: Record<string, unknown>) => {
      const domProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !motionOnlyProps.has(key)),
      );
      return React.createElement(tag, domProps, children as React.ReactNode);
    };
    return MotionComponent;
  };

  return {
    motion: {
      div: makeMotion('div'),
      form: makeMotion('form'),
      span: makeMotion('span'),
      h2: makeMotion('h2'),
      p: makeMotion('p'),
      h3: makeMotion('h3'),
      button: makeMotion('button'),
      textarea: makeMotion('textarea'),
      input: makeMotion('input'),
      label: makeMotion('label'),
      circle: makeMotion('circle'),
      path: makeMotion('path'),
      polyline: makeMotion('polyline'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Polyfill fetch for the test environment
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof global.fetch;

// Helper: submit the form (more reliable than clicking the mocked Button in jsdom)
const submitForm = () => {
  const form = document.querySelector('form');
  if (!form) throw new Error('Form not found');
  fireEvent.submit(form);
};

describe('ContactFormSection', () => {
  afterEach(() => {
    mockFetch.mockReset();
  });

  it('renders name, email, and message fields by default', () => {
    render(<ContactFormSection />);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Vision/i)).toBeInTheDocument();
  });

  it('renders a submit button with the correct label', () => {
    render(<ContactFormSection />);
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
  });

  it('renders error messages when required fields are empty', async () => {
    render(<ContactFormSection />);
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Message is required/i)).toBeInTheDocument();
    });
  });

  it('renders an email validation error for an invalid email', async () => {
    render(<ContactFormSection />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText(/Your Vision/i), { target: { value: 'Hello' } });

    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true } as Response);
    render(<ContactFormSection />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Your Vision/i), { target: { value: 'Hello' } });

    submitForm();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Transmitting…/i })).toBeDisabled();
    });
  });

  it('shows success message when submission succeeds', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true } as Response);
    render(<ContactFormSection />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Your Vision/i), { target: { value: 'Hello' } });

    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/Message Received/i)).toBeInTheDocument();
    });
  });

  it('shows error message when submission fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);
    render(<ContactFormSection />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Your Vision/i), { target: { value: 'Hello' } });

    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/Transmission Failed/i)).toBeInTheDocument();
    });
  });

  it('renders a custom title and subtitle when provided', () => {
    render(
      <ContactFormSection
        title="Get in Touch"
        subtitle="We reply within 24 hours."
      />,
    );
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByText('We reply within 24 hours.')).toBeInTheDocument();
  });

  it('respects the eyebrow prop', () => {
    render(<ContactFormSection eyebrow="§ 04 — Connect" />);
    expect(screen.getByText('§ 04 — Connect')).toBeInTheDocument();
  });

  it('renders a "Send Another" button after success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true } as Response);
    render(<ContactFormSection />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Your Vision/i), { target: { value: 'Hello' } });

    submitForm();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send Another/i })).toBeInTheDocument();
    });
  });

  it('allows resubmitting after success via "Send Another"', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true } as Response);
    render(<ContactFormSection />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Your Vision/i), { target: { value: 'Hello' } });

    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/Message Received/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Send Another/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
    });
  });

  it('calls fetch with the correct endpoint and body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true } as Response);
    render(<ContactFormSection />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/Your Vision/i), { target: { value: 'I want to discuss a villa project.' } });

    submitForm();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.hexastudio.net/api/contact',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: 'Jane Smith',
            email: 'jane@example.com',
            message: 'I want to discuss a villa project.',
          }),
        }),
      );
    });
  });

  it('clears field errors when user starts typing after a validation failure', async () => {
    render(<ContactFormSection />);
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Typed' } });

    await waitFor(() => {
      expect(screen.queryByText(/Name is required/i)).not.toBeInTheDocument();
    });
  });
});
