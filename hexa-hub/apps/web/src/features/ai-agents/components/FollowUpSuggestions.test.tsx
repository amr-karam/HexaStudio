import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FollowUpSuggestions } from './FollowUpSuggestions';

describe('FollowUpSuggestions', () => {
  it('renders suggestion chips when suggestions are provided', () => {
    const onSelect = vi.fn();
    render(
      <FollowUpSuggestions
        suggestions={['What is the budget?', 'Show Q3 revenue', 'List all projects']}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText('What is the budget?')).toBeInTheDocument();
    expect(screen.getByText('Show Q3 revenue')).toBeInTheDocument();
    expect(screen.getByText('List all projects')).toBeInTheDocument();
  });

  it('returns null when suggestions array is empty', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FollowUpSuggestions suggestions={[]} onSelect={onSelect} />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('returns null when suggestions are undefined', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FollowUpSuggestions suggestions={undefined} onSelect={onSelect} />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('calls onSelect with the suggestion text when a chip is clicked', () => {
    const onSelect = vi.fn();
    render(
      <FollowUpSuggestions
        suggestions={['Show Q3 revenue']}
        onSelect={onSelect}
      />,
    );

    const button = screen.getByText('Show Q3 revenue');
    fireEvent.click(button);

    expect(onSelect).toHaveBeenCalledWith('Show Q3 revenue');
  });

  it('calls onSelect with the correct suggestion for each chip', () => {
    const onSelect = vi.fn();
    render(
      <FollowUpSuggestions
        suggestions={['Question A', 'Question B', 'Question C']}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByText('Question B'));
    expect(onSelect).toHaveBeenCalledWith('Question B');

    fireEvent.click(screen.getByText('Question C'));
    expect(onSelect).toHaveBeenCalledWith('Question C');
  });

  it('renders the correct number of suggestion buttons', () => {
    const onSelect = vi.fn();
    render(
      <FollowUpSuggestions
        suggestions={['A', 'B', 'C', 'D', 'E']}
        onSelect={onSelect}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });
});
