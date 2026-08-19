import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolCallIndicator } from './ToolCallIndicator';

describe('ToolCallIndicator', () => {
  it('renders the tool name and agent name', () => {
    render(
      <ToolCallIndicator
        toolName="odoo_search_read"
        agentName="erp-analyst"
        isActive={true}
      />,
    );

    expect(screen.getByText('erp analyst')).toBeInTheDocument();
    expect(screen.getByText('→ calling')).toBeInTheDocument();
    expect(screen.getByText('odoo_search_read')).toBeInTheDocument();
  });

  it('replaces hyphens with spaces in agent name', () => {
    render(
      <ToolCallIndicator
        toolName="query_projects"
        agentName="project-assistant"
        isActive={true}
      />,
    );

    expect(screen.getByText('project assistant')).toBeInTheDocument();
  });

  it('renders without crashing when isActive is false', () => {
    const { container } = render(
      <ToolCallIndicator
        toolName="semantic_search"
        agentName="knowledge-agent"
        isActive={false}
      />,
    );

    expect(container.querySelector('.flex')).toBeInTheDocument();
  });

  it('renders the Wrench icon when active', () => {
    const { container } = render(
      <ToolCallIndicator
        toolName="test_tool"
        agentName="test-agent"
        isActive={true}
      />,
    );

    // lucide-react Wrench renders as an SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders CheckCircle icon when status is complete', () => {
    const { container } = render(
      <ToolCallIndicator
        toolName="postgres_query"
        agentName="project-assistant"
        isActive={false}
        status="complete"
      />,
    );

    // When complete, should render a check icon SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(screen.getByText('postgres_query')).toBeInTheDocument();
  });

  it('shows result preview when tool completes with result', () => {
    render(
      <ToolCallIndicator
        toolName="odoo_search_read"
        agentName="erp-analyst"
        isActive={false}
        status="complete"
        result="Found 3 invoice records totaling €1.2M"
      />,
    );

    expect(screen.getByText(/Found 3 invoice records/)).toBeInTheDocument();
  });
});
