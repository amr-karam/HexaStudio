import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('AgentSelector', () => {
  it('renders "Auto-detect agent" as the default option', () => {
    const mockSelect = vi.fn();
    render(
      <AgentSelector agents={mockAgents} selected={null} onSelect={mockSelect} />,
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    const defaultOption = screen.getByText('Auto-detect agent');
    expect(defaultOption).toBeInTheDocument();
  });

  it('renders all agents as options', () => {
    const mockSelect = vi.fn();
    render(
      <AgentSelector agents={mockAgents} selected={null} onSelect={mockSelect} />,
    );

    expect(screen.getByText('📊 erp analyst')).toBeInTheDocument();
    expect(screen.getByText('📋 project assistant')).toBeInTheDocument();
    expect(screen.getByText('📚 knowledge agent')).toBeInTheDocument();
  });

  it('calls onSelect with null when auto-detect is selected', () => {
    const mockSelect = vi.fn();
    render(
      <AgentSelector agents={mockAgents} selected={null} onSelect={mockSelect} />,
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });

    expect(mockSelect).toHaveBeenCalledWith(null);
  });

  it('calls onSelect with the agent name when an agent is selected', () => {
    const mockSelect = vi.fn();
    render(
      <AgentSelector agents={mockAgents} selected={null} onSelect={mockSelect} />,
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'erp-analyst' } });

    expect(mockSelect).toHaveBeenCalledWith('erp-analyst');
  });

  it('reflects the selected value in the select element', () => {
    const mockSelect = vi.fn();
    render(
      <AgentSelector
        agents={mockAgents}
        selected="project-assistant"
        onSelect={mockSelect}
      />,
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('project-assistant');
  });

  it('renders an empty state when no agents are provided', () => {
    const mockSelect = vi.fn();
    render(<AgentSelector agents={[]} selected={null} onSelect={mockSelect} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Auto-detect agent')).toBeInTheDocument();
  });
});
