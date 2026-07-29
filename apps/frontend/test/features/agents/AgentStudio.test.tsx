import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgentStudio } from '@/features/agents';

describe('AgentStudio', () => {
  it('renders the executive studio header and agent persona cards', () => {
    render(<AgentStudio />);

    expect(screen.getByText(/Multi-Agent Executive Studio/i)).toBeInTheDocument();
    expect(screen.getAllByText(/HEXA-CEO/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/HEXA-Sales/i)).toBeInTheDocument();
    expect(screen.getByText(/HEXA-PM/i)).toBeInTheDocument();
    expect(screen.getByText(/HEXA-Reviewer/i)).toBeInTheDocument();
  });
});
