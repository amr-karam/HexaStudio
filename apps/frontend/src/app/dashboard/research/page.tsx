'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  researchToolsApi,
  type WebSearchResult,
  type ScrapePageResult,
  type SynthesizeReportResult,
  type ExportLuxuryPdfResult,
  type ApplyLiveMaterialResult,
} from '@/features/research-tools/api';

type ToolId = 'web_search' | 'scrape_page' | 'synthesize_report' | 'export_luxury_pdf' | 'apply_live_material';

const TOOLS: { id: ToolId; label: string; icon: string; desc: string }[] = [
  {
    id: 'web_search',
    label: 'Web Search',
    icon: '🔍',
    desc: 'Search the web for architectural trends, material properties, or competitor data.',
  },
  {
    id: 'scrape_page',
    label: 'Scrape Page',
    icon: '📄',
    desc: 'Extract deep content from a specific URL — articles, project pages, or technical specs.',
  },
  {
    id: 'synthesize_report',
    label: 'Synthesize Report',
    icon: '📊',
    desc: 'Transform raw findings into a structured, cited architectural report.',
  },
  {
    id: 'export_luxury_pdf',
    label: 'Export Luxury PDF',
    icon: '📁',
    desc: 'Generate a high-fidelity, branded PDF from a synthesized report.',
  },
  {
    id: 'apply_live_material',
    label: 'Apply Live Material',
    icon: '🎨',
    desc: 'Paint the 3D scene in real-time with PBR material mutations.',
  },
];

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
    </div>
  );
}

function WebSearchForm({ onRun }: { onRun: (params: { query: string; limit?: number }) => Promise<void> }) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(5);
  const [running, setRunning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || running) return;
    setRunning(true);
    try {
      await onRun({ query, limit: limit || undefined });
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm text-sl-alabaster/60">Search Query</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. biophilic urbanism 2026"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sl-alabaster outline-none transition-colors focus:border-sl-gold-subtle/50"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-sl-alabaster/60">Results</label>
        <input
          type="number"
          min={1}
          max={20}
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value, 10))}
          className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-sl-alabaster outline-none focus:border-sl-gold-subtle/50"
        />
        <button
          type="submit"
          disabled={running || !query.trim()}
          className="rounded-lg bg-sl-gold-subtle px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-sl-gold-subtle-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}

function ScrapePageForm({ onRun }: { onRun: (params: { url: string }) => Promise<void> }) {
  const [url, setUrl] = useState('');
  const [running, setRunning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || running) return;
    setRunning(true);
    try {
      await onRun({ url });
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm text-sl-alabaster/60">URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://archdaily.com/project-xyz"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sl-alabaster outline-none transition-colors focus:border-sl-gold-subtle/50"
        />
      </div>
      <button
        type="submit"
        disabled={running || !url.trim()}
        className="rounded-lg bg-sl-gold-subtle px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-sl-gold-subtle-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {running ? 'Scraping...' : 'Scrape'}
      </button>
    </form>
  );
}

function SynthesizeReportForm({ onRun }: { onRun: (params: { findings: string; focus: string }) => Promise<void> }) {
  const [findings, setFindings] = useState('');
  const [focus, setFocus] = useState('Sustainability');
  const [running, setRunning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findings.trim() || running) return;
    setRunning(true);
    try {
      await onRun({ findings, focus });
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm text-sl-alabaster/60">Focus Angle</label>
        <select
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sl-alabaster outline-none transition-colors focus:border-sl-gold-subtle/50"
        >
          <option>Sustainability</option>
          <option>Aesthetics</option>
          <option>Materials</option>
          <option>Technology</option>
          <option>Cost</option>
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-sl-alabaster/60">Raw Findings</label>
        <textarea
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          placeholder="Paste the raw data collected from web search / scrape tools..."
          rows={5}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sl-alabaster outline-none transition-colors focus:border-sl-gold-subtle/50"
        />
      </div>
      <button
        type="submit"
        disabled={running || !findings.trim()}
        className="rounded-lg bg-sl-gold-subtle px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-sl-gold-subtle-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {running ? 'Synthesizing...' : 'Synthesize'}
      </button>
    </form>
  );
}

function ExportPdfForm({ onRun }: { onRun: (params: { reportId: string; projectName: string; findings: string }) => Promise<void> }) {
  const [reportId, setReportId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [findings, setFindings] = useState('');
  const [running, setRunning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId.trim() || !projectName.trim() || !findings.trim() || running) return;
    setRunning(true);
    try {
      await onRun({ reportId, projectName, findings });
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-sl-alabaster/60">Report ID</label>
          <input
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            placeholder="rep_12345"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sl-alabaster outline-none transition-colors focus:border-sl-gold-subtle/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-sl-alabaster/60">Project Name</label>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Biophilic Tower"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sl-alabaster outline-none transition-colors focus:border-sl-gold-subtle/50"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-sl-alabaster/60">Findings</label>
        <textarea
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          placeholder="Final synthesized content..."
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sl-alabaster outline-none transition-colors focus:border-sl-gold-subtle/50"
        />
      </div>
      <button
        type="submit"
        disabled={running || !reportId.trim() || !projectName.trim() || !findings.trim()}
        className="rounded-lg bg-sl-gold-subtle px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-sl-gold-subtle-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {running ? 'Exporting...' : 'Export PDF'}
      </button>
    </form>
  );
}

function ApplyMaterialForm({ onRun }: { onRun: (params: { projectId: string; element: string; materialSpec: { color: string; roughness: number; metalness: number; name: string } }) => Promise<void> }) {
  const [projectId, setProjectId] = useState('');
  const [element, setElement] = useState('');
  const [color, setColor] = useState('#D4AF37');
  const [roughness, setRoughness] = useState(0.2);
  const [metalness, setMetalness] = useState(0.8);
  const [materialName, setMaterialName] = useState('');
  const [running, setRunning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId.trim() || !element.trim() || !materialName.trim() || running) return;
    setRunning(true);
    try {
      await onRun({
        projectId,
        element,
        materialSpec: { color, roughness, metalness, name: materialName },
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-sl-alabaster/60">Project ID / Slug</label>
          <input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="e.g. biophilic-tower"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sl-alabaster outline-none transition-colors focus:border-sl-gold-subtle/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-sl-alabaster/60">Scene Element</label>
          <input
            value={element}
            onChange={(e) => setElement(e.target.value)}
            placeholder="e.g. facade, lobby-floor"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sl-alabaster outline-none transition-colors focus:border-sl-gold-subtle/50"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-sl-alabaster/60">Material Name</label>
        <input
          value={materialName}
          onChange={(e) => setMaterialName(e.target.value)}
          placeholder="e.g. Gold Anodized Metal"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sl-alabaster outline-none transition-colors focus:border-sl-gold-subtle/50"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
        <div>
          <label className="mb-1.5 block text-sm text-sl-alabaster/60">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0"
            />
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-sl-alabaster outline-none focus:border-sl-gold-subtle/50"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-sl-alabaster/60">Roughness: {roughness.toFixed(2)}</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={roughness}
            onChange={(e) => setRoughness(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-sl-alabaster/60">Metalness: {metalness.toFixed(2)}</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={metalness}
            onChange={(e) => setMetalness(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={running || !projectId.trim() || !element.trim() || !materialName.trim()}
        className="rounded-lg bg-sl-gold-subtle px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-sl-gold-subtle-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {running ? 'Applying...' : 'Apply Material'}
      </button>
    </form>
  );
}

function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="mb-3 text-lg font-medium text-sl-alabaster">{title}</h3>
      <div className="prose prose-invert max-w-none text-sl-alabaster/70">{children}</div>
    </div>
  );
}

function WebSearchResults({ data }: { data: WebSearchResult[] }) {
  if (!data || data.length === 0) return <p className="text-sm text-sl-alabaster/40">No results returned.</p>;
  return (
    <div className="space-y-3">
      {data.map((r, i) => (
        <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-sl-gold hover:underline">
            {r.title}
          </a>
          <p className="mt-1 text-sm text-sl-alabaster/60">{r.snippet}</p>
          <p className="mt-1 text-xs text-sl-alabaster/30">{r.url}</p>
        </div>
      ))}
    </div>
  );
}

function ScrapedResults({ data }: { data: ScrapePageResult }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-sl-alabaster/80">{data.metadata.title}</h4>
      {data.metadata.author && <p className="text-xs text-sl-alabaster/40">By {data.metadata.author}</p>}
      <p className="text-sm text-sl-alabaster/60 whitespace-pre-wrap">{data.content}</p>
    </div>
  );
}

function ReportResults({ data }: { data: SynthesizeReportResult }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-sl-alabaster/40">ID: {data.report_id}</p>
      <p className="text-sm text-sl-alabaster/70 whitespace-pre-wrap">{data.summary}</p>
      {data.citations.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.citations.map((c, i) => (
            <span key={i} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-sl-alabaster/50">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResearchDashboardPage() {
  const [active, setActive] = useState<ToolId>('web_search');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<unknown>(null);

  const clearResults = () => setResults(null);

  const handleWebSearch = async (params: { query: string; limit?: number }) => {
    setLoading(true);
    clearResults();
    try {
      const data = await researchToolsApi.webSearch(params);
      setResults({ type: 'web_search', data } as const);
      toast.success('Web search complete');
    } catch (e) {
      toast.error(`Research tool error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async (params: { url: string }) => {
    setLoading(true);
    clearResults();
    try {
      const data = await researchToolsApi.scrapePage(params);
      setResults({ type: 'scrape_page', data } as const);
      toast.success('Page scraped');
    } catch (e) {
      toast.error(`Research tool error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSynthesize = async (params: { findings: string; focus: string }) => {
    setLoading(true);
    clearResults();
    try {
      const data = await researchToolsApi.synthesizeReport(params);
      setResults({ type: 'synthesize_report', data } as const);
      toast.success('Report synthesized');
    } catch (e) {
      toast.error(`Research tool error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async (params: { reportId: string; projectName: string; findings: string }) => {
    setLoading(true);
    clearResults();
    try {
      const data = await researchToolsApi.exportLuxuryPdf(params);
      setResults({ type: 'export_luxury_pdf', data } as const);
      toast.success('Luxury PDF exported');
    } catch (e) {
      toast.error(`Research tool error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMaterial = async (params: {
    projectId: string;
    element: string;
    materialSpec: { color: string; roughness: number; metalness: number; name: string };
  }) => {
    setLoading(true);
    clearResults();
    try {
      const data = await researchToolsApi.applyLiveMaterial(params);
      setResults({ type: 'apply_live_material', data } as const);
      toast.success('Live material update dispatched');
    } catch (e) {
      toast.error(`Research tool error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (active) {
      case 'web_search':
        return <WebSearchForm onRun={handleWebSearch} />;
      case 'scrape_page':
        return <ScrapePageForm onRun={handleScrape} />;
      case 'synthesize_report':
        return <SynthesizeReportForm onRun={handleSynthesize} />;
      case 'export_luxury_pdf':
        return <ExportPdfForm onRun={handleExportPdf} />;
      case 'apply_live_material':
        return <ApplyMaterialForm onRun={handleApplyMaterial} />;
    }
  };

  const renderResults = () => {
    if (!results || loading) return null;
    const r = results as { type: string; data: unknown };
    switch (r.type) {
      case 'web_search':
        return (
          <ResultCard title="Search Results">
            <WebSearchResults data={r.data as WebSearchResult[]} />
          </ResultCard>
        );
      case 'scrape_page':
        return (
          <ResultCard title="Scraped Content">
            <ScrapedResults data={r.data as ScrapePageResult} />
          </ResultCard>
        );
      case 'synthesize_report':
        return (
          <ResultCard title="Synthesized Report">
            <ReportResults data={r.data as SynthesizeReportResult} />
          </ResultCard>
        );
      case 'export_luxury_pdf': {
        const d = r.data as ExportLuxuryPdfResult;
        return (
          <ResultCard title="PDF Export">
            {d.success && (
              <a
                href={d.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sl-gold hover:underline"
              >
                {d.message}
              </a>
            )}
            {!d.success && <p>{d.message}</p>}
          </ResultCard>
        );
      }
      case 'apply_live_material': {
        const d = r.data as ApplyLiveMaterialResult;
        return (
          <ResultCard title="Material Update">
            <p className="text-sm text-sl-alabaster/70">{d.message}</p>
          </ResultCard>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-sl-alabaster">Research Tools</h1>
        <p className="mt-1 text-sm text-sl-alabaster/40">
          Run AI-powered research tools across web search, page scraping, report synthesis,
          PDF export, and live material mutation.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActive(t.id);
              clearResults();
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active === t.id
                ? 'bg-sl-gold-subtle text-black'
                : 'text-sl-alabaster/40 hover:text-sl-alabaster/70'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {TOOLS.find((t) => t.id === active) && (
        <p className="mb-5 text-xs text-sl-alabaster/30">
          {TOOLS.find((t) => t.id === active)?.desc}
        </p>
      )}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">{renderForm()}</div>

      {loading && <Spinner />}

      {!loading && renderResults()}
    </div>
  );
}
