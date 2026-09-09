import { describe, it, expect } from 'vitest';
import { renderOneOsMemory, summarizeRoute } from '../../src/one-os/memory.js';

describe('ONE-OS memory', () => {
  it('summarizes routes', () => {
    expect(summarizeRoute('hermes')).toContain('Hermes');
    expect(summarizeRoute('opencode')).toContain('OpenCode');
    expect(summarizeRoute('hybrid')).toContain('Hybrid');
  });

  it('renders unified markdown without secrets', () => {
    const md = renderOneOsMemory(
      {
        hermesWorkspaceId: 'hermes',
        hermesPeerId: 'user',
        hermesRepresentation: 'Prefers concise plans, Odoo-first, silent luxury UI.',
        opencodeProjectName: 'HexaStudio',
        opencodeStack: ['Next.js 16', 'NestJS 11'],
        bridgeSessionCount: 3,
        recentSummaries: ['Shipped portal finance sync', 'Fixed MinIO public buckets'],
      },
      Date.parse('2026-09-09T00:00:00.000Z'),
    );
    expect(md).toContain('HEXA ONE OS');
    expect(md).toContain('hermes');
    expect(md).toContain('HexaStudio');
    expect(md).toContain('Bridge sessions');
    expect(md).toContain('Shipped portal finance sync');
  });

  it('handles empty brain gracefully', () => {
    const md = renderOneOsMemory(
      {
        hermesWorkspaceId: 'hermes',
        hermesPeerId: 'user',
        hermesRepresentation: '   ',
        opencodeProjectName: 'HexaStudio',
        opencodeStack: [],
        bridgeSessionCount: 0,
        recentSummaries: [],
      },
      0,
    );
    expect(md).toContain('No Hermes representation yet');
    expect(md).toContain('No recent summaries yet');
  });
});
