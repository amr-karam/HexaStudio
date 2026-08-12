import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/inputs/Input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders an underline variant input by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders a glass variant input', () => {
      const { container } = render(<Input variant="glass" />);
      // The glass variant wraps the input in an .artisan-glass div
      expect(container.querySelector('.artisan-glass')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders a label when the label prop is provided', () => {
      render(<Input label="Email address" />);
      expect(screen.getByText('Email address')).toBeInTheDocument();
    });

    it('does not render a label element when the label prop is omitted', () => {
      const { container } = render(<Input />);
      expect(container.querySelector('label')).not.toBeInTheDocument();
    });

    it('renders the error message when the error prop is provided', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('does not render an error element when no error is provided', () => {
      const { container } = render(<Input />);
      expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
    });

    it('forwards the type attribute', () => {
      render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('forwards the placeholder attribute', () => {
      render(<Input placeholder="you@example.com" />);
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    });

    it('forwards arbitrary input attributes', () => {
      render(<Input data-testid="custom-input" maxLength={50} />);
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('maxlength', '50');
    });

    it('applies a custom className alongside the base classes', () => {
      render(<Input className="my-custom-class" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('my-custom-class');
    });
  });

  describe('forwardRef', () => {
    it('forwards the ref to the input element', () => {
      const ref = vi.fn<(node: HTMLInputElement | null) => void>();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('accessibility — label association (WCAG 2.2 AA)', () => {
    it('associates the label with the input via htmlFor/id (underline variant)', () => {
      render(<Input label="Full name" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Full name');
      const inputId = input.getAttribute('id');
      expect(inputId).toBeTruthy();
      expect(label).toHaveAttribute('for', inputId);
    });

    it('associates the label with the input via htmlFor/id (glass variant)', () => {
      render(<Input label="Company" variant="glass" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Company');
      const inputId = input.getAttribute('id');
      expect(inputId).toBeTruthy();
      expect(label).toHaveAttribute('for', inputId);
    });

    it('generates a stable, unique id via useId', () => {
      render(
        <>
          <Input label="Field A" />
          <Input label="Field B" />
        </>,
      );
      const inputs = screen.getAllByRole('textbox');
      const idA = inputs[0].getAttribute('id');
      const idB = inputs[1].getAttribute('id');
      expect(idA).toBeTruthy();
      expect(idB).toBeTruthy();
      expect(idA).not.toBe(idB);
    });

    it('respects a caller-supplied id over the generated one', () => {
      render(<Input id="custom-id" label="Username" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
      expect(screen.getByText('Username')).toHaveAttribute('for', 'custom-id');
    });
  });

  describe('accessibility — error semantics', () => {
    it('sets aria-invalid when an error is present', () => {
      render(<Input error="Invalid value" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid when there is no error', () => {
      const { rerender } = render(<Input />);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');

      // Verify it appears when an error is added
      rerender(<Input error="Now broken" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('wires aria-describedby to the error element id', () => {
      render(<Input error="Too short" />);
      const input = screen.getByRole('textbox');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      const errorEl = document.getElementById(errorId!);
      expect(errorEl).not.toBeNull();
      expect(errorEl).toHaveTextContent('Too short');
    });

    it('marks the error message with role="alert" for SR announcement', () => {
      const { container } = render(<Input error="Required" />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Required');
    });

    it('gives the error element an id derived from the input id', () => {
      render(<Input id="email" error="Bad email" />);
      const errorEl = screen.getByText('Bad email');
      expect(errorEl).toHaveAttribute('id', 'email-error');
    });
  });

  describe('interaction', () => {
    it('accepts user typing', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'hello@world.com');
      expect(input).toHaveValue('hello@world.com');
    });

    it('respects the disabled attribute', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('fires onChange when the value changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Input onChange={onChange} />);
      await user.type(screen.getByRole('textbox'), 'a');
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
