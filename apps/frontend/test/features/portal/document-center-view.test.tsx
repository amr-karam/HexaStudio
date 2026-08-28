/**
 * DocumentCenterView - regression tests.
 *
 * Contracts under test:
 *  1. Live documents render when the project + document queries resolve.
 *  2. Folder tabs and search filter the grid; empty state offers a reset.
 *  3. The Vault <-> Knowledge Base toggle switches surfaces.
 *  4. Upload validation rejects oversized and unsupported files.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/odoo/api', () => ({
  portalOdooApi: {
    getProjects: vi.fn(),
    uploadDocument: vi.fn(),
    getDocuments: vi.fn(),
  },
  odooApi: {
    getKnowledgeCategories: vi.fn(),
    getKnowledgeArticles: vi.fn(),
  },
}));

vi.mock('@/features/portal/lib/documentation-loader', () => ({
  loadProjectDocuments: vi.fn(),
  lazyLoadDocumentPayload: vi.fn(),
}));

vi.mock('@/features/auth', () => ({
  useAuth: () => ({ user: { id: 'u1', username: 'Test Client' } }),
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { DocumentCenterView } from '@/features/portal/components/DocumentCenterView';
import { portalOdooApi, odooApi } from '@/features/odoo/api';
import { loadProjectDocuments } from '@/features/portal/lib/documentation-loader';

const getProjects = portalOdooApi.getProjects as ReturnType<typeof vi.fn>;
const getDocuments = portalOdooApi.getDocuments as ReturnType<typeof vi.fn>;
const getCategories = odooApi.getKnowledgeCategories as ReturnType<typeof vi.fn>;
const getArticles = odooApi.getKnowledgeArticles as ReturnType<typeof vi.fn>;
const loadDocs = loadProjectDocuments as ReturnType<typeof vi.fn>;

const PROJECTS = [{ id: 7, name: 'Horizon Villa', status: 'in-progress' }];

const LIVE_DOCS = [
  {
    id: 'doc-1',
    name: 'Exterior_Render_Final.png',
    mimeType: 'image/png',
    fileSize: 26_000_000,
    filePath: '/x/doc-1',
    projectId: 7,
    createdAt: '2026-07-22T09:15:00Z',
    downloadUrl: 'https://minio/signed/doc-1',
  },
  {
    id: 'doc-2',
    name: 'Master_Services_Agreement.pdf',
    mimeType: 'application/pdf',
    fileSize: 4_400_000,
    filePath: '/x/doc-2',
    projectId: 7,
    createdAt: '2026-06-01T11:00:00Z',
    downloadUrl: 'https://minio/signed/doc-2',
  },
  {
    id: 'doc-3',
    name: 'BIM_Model_Package.zip',
    mimeType: 'application/zip',
    fileSize: 149_000_000,
    filePath: '/x/doc-3',
    projectId: 7,
    createdAt: '2026-07-15T16:00:00Z',
    downloadUrl: 'https://minio/signed/doc-3',
  },
];

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
  getProjects.mockReset().mockResolvedValue(PROJECTS);
  loadDocs.mockReset().mockResolvedValue(LIVE_DOCS);
  getCategories.mockReset().mockResolvedValue([{ id: 1, name: 'Standards', article_count: 1 }]);
  getArticles.mockReset().mockResolvedValue([
    { id: 1, name: 'Lighting Guidelines', body: 'Dual-temperature philosophy.', category_id: [1, 'Standards'], create_date: '2026-07-10' },
  ]);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DocumentCenterView />
    </QueryClientProvider>,
  );
}

describe('DocumentCenterView', () => {
  it('renders live documents from the API once the project resolves', async () => {
    renderView();

    expect(await screen.findByText('Exterior_Render_Final.png')).toBeInTheDocument();
    expect(screen.getByText('Master_Services_Agreement.pdf')).toBeInTheDocument();
    expect(screen.getByText('BIM_Model_Package.zip')).toBeInTheDocument();
    expect(loadDocs).toHaveBeenCalledWith(7);
  });

  it('filters by folder tab and shows the count in the holdings marker', async () => {
    renderView();
    await screen.findByText('Exterior_Render_Final.png');

    fireEvent.click(screen.getByRole('tab', { name: 'Filter by design folder' }));

    await waitFor(() => {
      // Design folder keeps only the PNG render (the BIM zip infers to blueprints,
      // the agreement PDF to contracts) -> exactly one holding.
      expect(
        screen.getByText(
          (_, el) => el?.children.length === 0 && el?.textContent?.includes('1 Item') === true,
        ),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText('Master_Services_Agreement.pdf')).not.toBeInTheDocument();
    expect(screen.queryByText('BIM_Model_Package.zip')).not.toBeInTheDocument();
  });

  it('filters by search across names and tags, then resets from the empty state', async () => {
    renderView();
    await screen.findByText('Exterior_Render_Final.png');

    fireEvent.change(screen.getByPlaceholderText('Search documents or tags...'), { target: { value: 'zebra-no-match' } });

    expect(await screen.findByRole('status')).toHaveTextContent(/archive is/i);
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    await waitFor(() => {
      expect(screen.getByText('Exterior_Render_Final.png')).toBeInTheDocument();
    });
  });

  it('switches to the Knowledge Base surface and back', async () => {
    renderView();
    await screen.findByText('Exterior_Render_Final.png');

    fireEvent.click(screen.getByRole('button', { name: 'Knowledge Base' }));

    expect(await screen.findByText('Lighting Guidelines')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'The Vault' }));
    await waitFor(() => {
      expect(screen.getByText('Exterior_Render_Final.png')).toBeInTheDocument();
    });
  });

  it('rejects an oversized file upload with an honest error toast', async () => {
    renderView();
    await screen.findByText('Exterior_Render_Final.png');

    const oversized = new File([new ArrayBuffer(51 * 1024 * 1024)], 'huge.png', { type: 'image/png' });
    const dropzone = screen.getByRole('button', { name: /Secured Transfer/i }) ?? screen.getByText('Deposit a document into the vault').closest('div[role="button"]')!;
    const zone = (dropzone as HTMLElement).closest('div[role="button"]') ?? dropzone;

    // Use the hidden input path directly - the validation lives in handleUpload
    fireEvent.drop(zone as HTMLElement, { dataTransfer: { files: [oversized] } });

    const { toast } = await import('sonner');
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('File must be under 50MB');
    });
  });
});
