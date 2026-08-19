import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentSelector } from './AgentSelector';
import type { AgentPersona } from '../types/agent';

const mockAgents: AgentPersona[] = [
  {
    name: 'erp-analyst',
    description: 'ERP data analysis',
    color: 'var(--color-metric-amber)',
    icon: '📊',
    tools: ['odoo_search_read'],
  },
  {
    name: 'project-assistant',
    description: 'Project management',
    color: 'var(--color-info)',
    icon: '📋',
    tools: ['query_projects', 'query_tasks'],
  },
  {
    name: 'knowledge-agent',
    description: 'Knowledge search',
    color: 'var(--color-metric-violet)',
    icon: '📚',
    tools: ['semantic_search', 'cms_search'],
  },
];

function openDropdown() {
  const trigger = screen.getByRole('button', { name: /auto-detect|erp analyst|project assistant|knowledge agent/i });
  fireEvent.click(trigger);
}

describe('AgentSelector', () => {
  it('renders "Auto-detect agent" as the default option', () => {
    const mockSelect = vi.fn();
    render(<AgentSelector agents={mockAgents} selected={null} onSelect={mockSelect} />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Auto-detect agent');
  });

  it('renders all agents when dropdown is opened', async () => {
    const mockSelect = vi.fn();
    render(<AgentSelector agents={mockAgents} selected={null} onSelect={mockSelect} />);

    openDropdown();

    await waitFor(() => {
      expect(screen.getByText('ERP Analyst')).toBeInTheDocument();
      expect(screen.getByText('Project Assistant')).toBeInTheDocument();
      expect(screen.getByText('Knowledge Agent')).toBeInTheDocument();
    });
  });

  it('calls onSelect with null when auto-detect is selected', async () => {
    const mockSelect = vi.fn();
    render(<AgentSelector agents={mockAgents} selected={null} onSelect={mockSelect} />);

    openDropdown();

    await waitFor(() => {
      const autoDetectBtns = screen.getAllByRole('button', { name: /auto-detect/i });
      // Click the one inside the dropdown (last match), not the trigger
      fireEvent.click(autoDetectBtns[autoDetectBtns.length - 1]);
    });

    expect(mockSelect).toHaveBeenCalledWith(null);
  });

  it('calls onSelect with the agent name when an agent is selected', async () => {
    const mockSelect = vi.fn();
    render(<AgentSelector agents={mockAgents} selected={null} onSelect={mockSelect} />);

    openDropdown();

    await waitFor(() => {
      const erpBtn = screen.getByRole('button', { name: /erp analyst/i });
      fireEvent.click(erpBtn);
    });

    expect(mockSelect).toHaveBeenCalledWith('erp-analyst');
  });

  it('reflects the selected value in the trigger', () => {
    const mockSelect = vi.fn();
    render(
      <AgentSelector agents={mockAgents} selected="project-assistant" onSelect={mockSelect} />,
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('Project Assistant');
  });

  it('renders an empty state when no agents are provided', () => {
    const mockSelect = vi.fn();
    render(<AgentSelector agents={[]} selected={null} onSelect={mockSelect} />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Auto-detect agent');
  });

  it('closes dropdown after selecting an agent', async () => {
    const mockSelect = vi.fn();
    render(<AgentSelector agents={mockAgents} selected={null} onSelect={mockSelect} />);

    openDropdown();

    await waitFor(() => {
      expect(screen.getByText('ERP Analyst')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /erp analyst/i }));

    await waitFor(() => {
      expect(screen.queryByText('ERP Analyst')).not.toBeInTheDocument();
    });
  });

  it('filters agents based on search query', async () => {
    const mockSelect = vi.fn();
    render(<AgentSelector agents={mockAgents} selected={null} onSelect={mockSelect} />);

    openDropdown();

    const searchInput = await screen.findByPlaceholderText('Search agents...');
    fireEvent.change(searchInput, { target: { value: 'project' } });

    await waitFor(() => {
      expect(screen.getByText('Project Assistant')).toBeInTheDocument();
      expect(screen.queryByText('ERP Analyst')).not.toBeInTheDocument();
    });
  });

  it('shows checkmark for selected agent', async () => {
    const mockSelect = vi.fn();
    render(
      <AgentSelector agents={mockAgents} selected="erp-analyst" onSelect={mockSelect} />,
    );

    expect(screen.getByRole('button').textContent).toContain('ERP Analyst');
  });
});
