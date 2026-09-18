/**
 * ResearchDashboardPage - regression tests for the Research Tools Dashboard.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/research-tools/api', () => ({
  researchToolsApi: {
    webSearch: vi.fn(),
    scrapePage: vi.fn(),
    synthesizeReport: vi.fn(),
    exportLuxuryPdf: vi.fn(),
    applyLiveMaterial: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

import ResearchDashboardPage from '@/app/dashboard/research/page';
import { researchToolsApi } from '@/features/research-tools/api';

const makeClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: 0 } },
});

function renderView() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <ResearchDashboardPage />
    </QueryClientProvider>,
  );
}

const webSearch = researchToolsApi.webSearch as ReturnType<typeof vi.fn>;

describe('ResearchDashboardPage - Research Tools Dashboard', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    webSearch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the page title', () => {
    renderView();
    expect(screen.getByText('Research Tools')).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderView();
    expect(screen.getByText(/AI-powered research tools/)).toBeInTheDocument();
  });

  it('renders tab buttons with correct count', () => {
    renderView();
    const tabs = screen.getAllByRole('button', { name: /web search|scrape page|synthesize report|export luxury pdf|apply live material/i });
    expect(tabs).toHaveLength(5);
  });

  it('has Web Search tab visible initially', () => {
    renderView();
    expect(screen.getByRole('button', { name: /Web Search/i })).toBeInTheDocument();
  });

  it('has Scrape Page tab visible', () => {
    renderView();
    expect(screen.getByRole('button', { name: /Scrape Page/i })).toBeInTheDocument();
  });

  it('has Synthesize Report tab visible', () => {
    renderView();
    expect(screen.getByRole('button', { name: /Synthesize Report/i })).toBeInTheDocument();
  });

  it('has Export Luxury PDF tab visible', () => {
    renderView();
    expect(screen.getByRole('button', { name: /Export Luxury PDF/i })).toBeInTheDocument();
  });

  it('has Apply Live Material tab visible', () => {
    renderView();
    expect(screen.getByRole('button', { name: /Apply Live Material/i })).toBeInTheDocument();
  });

  it('switches to Scrape Page tab on click', async () => {
    renderView();
    const scrapeTab = screen.getByRole('button', { name: /Scrape Page/i });
    await fireEvent.click(scrapeTab);
    expect(screen.getByRole('button', { name: /Scrape Page/i }).classList.contains('bg-sl-gold-subtle')).toBe(true);
  });

  it('routes form submission to webSearch API', async () => {
    renderView();
    const webSearchTab = screen.getByRole('button', { name: /Web Search/i });
    await fireEvent.click(webSearchTab);
    const queryInput = screen.getByPlaceholderText('e.g. biophilic urbanism 2026');
    await fireEvent.change(queryInput, { target: { value: 'test query' } });
    const searchButton = screen.getByRole('button', { name: 'Search' });
    await fireEvent.click(searchButton);
    expect(webSearch).toHaveBeenCalledTimes(1);
    expect(webSearch).toHaveBeenCalledWith({ query: 'test query', limit: 5 });
  });
});