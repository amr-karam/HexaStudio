import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResearchHub } from '@/components/ai/ResearchHub';

const RESEARCH_RESPONSE = 'Carrara marble spec extracted: 20mm slabs, honed finish.';
const AUDIT_RESPONSE = 'Compliance verdict: PASS — all Absolute Zero standards met.';

const jsonResponse = (body: Record<string, unknown>, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe('ResearchHub', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.querySelectorAll('iframe').forEach((el) => el.remove());
  });

  const typeQuery = (value: string) => {
    fireEvent.change(screen.getByLabelText('Research query'), { target: { value } });
  };

  it('renders the control panel, cognitive stream, and analysis canvas', () => {
    render(<ResearchHub />);

    expect(screen.getByLabelText('Research query')).toBeInTheDocument();
    expect(screen.getByText('Cognitive Stream')).toBeInTheDocument();
    expect(screen.getByText('Analysis Canvas')).toBeInTheDocument();
    expect(screen.getByText(/Ready for Intelligence Synthesis/)).toBeInTheDocument();
  });

  it('does not call the agents API when the brief is empty', () => {
    render(<ResearchHub />);

    fireEvent.click(screen.getByRole('button', { name: 'Start research' }));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('routes the brief to the researcher and director personas and renders the synthesis', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/researcher')) return jsonResponse({ response: RESEARCH_RESPONSE, toolCalls: 2 });
      if (url.endsWith('/director')) return jsonResponse({ response: AUDIT_RESPONSE, toolCalls: 1 });
      throw new TypeError(`unexpected fetch: ${url}`);
    });
    render(<ResearchHub />);

    typeQuery('Marble foyer brief');
    fireEvent.click(screen.getByRole('button', { name: 'Start research' }));

    expect(await screen.findByText('Marble foyer brief', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('3 autonomous calls')).toBeInTheDocument();
    expect(screen.getByText('HEXA-Director Verified')).toBeInTheDocument();
    expect(screen.getAllByText(AUDIT_RESPONSE).length).toBeGreaterThan(0);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [researchCall, auditCall] = fetchMock.mock.calls;
    expect(researchCall[0]).toBe('/api/v1/agents/researcher');
    const researchBody = JSON.parse(researchCall[1].body);
    expect(researchBody.message).toContain('Research brief: "Marble foyer brief"');
    expect(researchBody.sessionId).toMatch(/^research-/);
    expect(auditCall[0]).toBe('/api/v1/agents/director');
    const auditBody = JSON.parse(auditCall[1].body);
    expect(auditBody.message).toContain('SYNTHESIS:');
    expect(auditBody.message).toContain(RESEARCH_RESPONSE);
    expect(auditBody.sessionId).toBe(researchBody.sessionId);
  });

  it('marks the research step as failed without a result canvas when the researcher persona returns 503', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/researcher')) return jsonResponse({ error: 'Model backend unavailable' }, 503);
      throw new TypeError(`unexpected fetch: ${url}`);
    });
    render(<ResearchHub />);

    typeQuery('Failing brief');
    fireEvent.click(screen.getByRole('button', { name: 'Start research' }));

    expect(
      await screen.findByText(/Research agent failed \(503\): Model backend unavailable/, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Ready for Intelligence Synthesis/)).toBeInTheDocument();
  });

  it('marks the design audit as unavailable when the director persona returns 503', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/researcher')) return jsonResponse({ response: RESEARCH_RESPONSE, toolCalls: 2 });
      if (url.endsWith('/director')) return jsonResponse({ error: 'Model backend unavailable' }, 503);
      throw new TypeError(`unexpected fetch: ${url}`);
    });
    render(<ResearchHub />);

    typeQuery('Audit fail brief');
    fireEvent.click(screen.getByRole('button', { name: 'Start research' }));

    expect(await screen.findByText('Audit Unavailable', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(
      await screen.findByText(/Design audit failed \(503\): Model backend unavailable/),
    ).toBeInTheDocument();
    expect(screen.getByText('2 autonomous calls')).toBeInTheDocument();
  });

  it('escapes HTML-sensitive characters in the branded report markup', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/researcher')) return jsonResponse({ response: RESEARCH_RESPONSE, toolCalls: 1 });
      if (url.endsWith('/director')) return jsonResponse({ response: AUDIT_RESPONSE, toolCalls: 1 });
      throw new TypeError(`unexpected fetch: ${url}`);
    });
    render(<ResearchHub />);

    typeQuery('Marble & gold <brief>');
    fireEvent.click(screen.getByRole('button', { name: 'Start research' }));
    await screen.findByText('Marble & gold <brief>', {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole('button', { name: 'Download Luxury PDF' }));

    const iframe = document.querySelector('iframe[aria-hidden="true"]');
    expect(iframe).not.toBeNull();
    const srcdoc = iframe.getAttribute('srcdoc') ?? '';
    expect(srcdoc).toContain('Marble &amp; gold &lt;brief&gt;');
    expect(srcdoc).not.toContain('<brief>');
  });
});
