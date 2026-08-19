import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentBadge } from './AgentBadge';

describe('AgentBadge', () => {
  it('renders the correct icon for known agents', () => {
    render(<AgentBadge agentName="erp-analyst" />);
    // The badge should render with an emoji icon
    const badge = screen.getByText('📊');
    expect(badge).toBeInTheDocument();
  });

  it('renders a fallback icon for unknown agents', () => {
    render(<AgentBadge agentName="unknown-agent" />);
    const badge = screen.getByText('🤖');
    expect(badge).toBeInTheDocument();
  });

  it('renders label when showLabel is true', () => {
    render(<AgentBadge agentName="erp-analyst" showLabel={true} />);
    const label = screen.getByText('erp analyst');
    expect(label).toBeInTheDocument();
  });

  it('applies correct size class for "md"', () => {
    const { container } = render(<AgentBadge agentName="sales-agent" size="md" />);
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('w-6', 'h-6');
  });

  it('applies correct size class for "sm" (default)', () => {
    const { container } = render(<AgentBadge agentName="knowledge-agent" />);
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('w-5', 'h-5');
  });

  it('uses custom color when provided', () => {
    const { container } = render(
      <AgentBadge agentName="custom-agent" color="var(--color-gold)" />,
    );
    const badge = container.querySelector('div');
    // jsdom can't resolve CSS vars, so check the style attribute directly
    const style = badge?.getAttribute('style') ?? '';
    expect(style).toContain('var(--color-gold)');
  });
});
