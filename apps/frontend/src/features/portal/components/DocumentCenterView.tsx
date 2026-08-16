'use client';

/**
 * HEXA Portal v3.0 — Document Center View · "The Vault"
 *
 * Folder management, presigned MinIO downloads, version history, tags, search,
 * and secured uploads — crafted as a luxury private archive: obsidian
 * artisan-glass panels, gold specular edges, editorial section markers, and
 * file rows styled as fine index cards.
 *
 * Silent Luxury choreography:
 *  - `§ 01` atelier header marker with serif gold-italic accent
 *  - artisan-glass search/filter toolbar with gold shared-layout pill indicator
 *  - artisan-glass-gold dashed dropzone ("Secured Transfer" deposit vault)
 *  - Staggered entrance for document cards + hover-lift micro-interaction
 *  - Gold aura + specular top hairline on every card; reduced-motion aware
 */

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icon } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeLift, staggerContainer, makeTransition, STAGGER } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth';
import { portalOdooApi, odooApi } from '@/features/odoo/api';
import { loadProjectDocuments, lazyLoadDocumentPayload } from '../lib/documentation-loader';
import type { DocumentItem } from '../types';
import type { PortalDocumentRecord } from '@/features/odoo/api';
import type { OdooKnowledgeCategory, OdooKnowledgeArticle } from '@hexastudio/types';
import { Input } from '@/components/ui/inputs/Input';
import { Button } from '@/components/ui/Button';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/** Short mono plate label derived from the file extension (e.g. PDF, ZIP, BLEND). */
function getFileTypeLabel(name: string): string {
  const parts = name.split('.');
  if (parts.length < 2) return 'FILE';
  const ext = (parts.pop() ?? '').toUpperCase();
  if (!ext) return 'FILE';
  return ext.length > 5 ? ext.slice(0, 5) : ext;
}

function inferFolder(doc: PortalDocumentRecord): DocumentItem['folder'] {
  const mime = doc.mimeType.toLowerCase();
  const name = doc.name.toLowerCase();

  // Design — images, 3D source files, renders
  if (
    mime.startsWith('image/') ||
    mime.includes('3d') ||
    name.endsWith('.blend') ||
    name.endsWith('.max') ||
    name.endsWith('.c4d') ||
    name.endsWith('.ma') ||
    name.endsWith('.mb') ||
    name.endsWith('.skp') ||
    name.includes('render')
  ) {
    return 'design';
  }

  // Contracts — PDFs with legal or agreement keywords
  if (
    mime === 'application/pdf' &&
    (name.includes('agreement') ||
      name.includes('contract') ||
      name.includes('terms') ||
      name.includes('legal') ||
      name.includes('sow') ||
      name.includes('statement'))
  ) {
    return 'contracts';
  }

  // Blueprints — CAD, DWG, DXF, BIM, architectural plans
  if (
    mime.includes('cad') ||
    name.endsWith('.dwg') ||
    name.endsWith('.dxf') ||
    name.endsWith('.rvt') ||
    name.endsWith('.ifc') ||
    name.includes('bim') ||
    name.includes('blueprint') ||
    name.includes('architectural')
  ) {
    return 'blueprints';
  }

  // Deliverables — compressed archives / packages
  if (
    mime.includes('zip') ||
    mime.includes('rar') ||
    mime.includes('tar') ||
    mime.includes('7z') ||
    name.endsWith('.zip') ||
    name.endsWith('.rar')
  ) {
    return 'deliverables';
  }

  // Catch-all for plain PDFs
  if (mime === 'application/pdf') {
    return 'contracts';
  }

  // Everything else — reports
  return 'reports';
}

function inferTags(doc: PortalDocumentRecord): string[] {
  const tags: string[] = [];
  const mime = doc.mimeType.toLowerCase();
  const name = doc.name.toLowerCase();

  if (mime.startsWith('image/')) tags.push('Image');
  if (mime === 'application/pdf') tags.push('PDF');
  if (mime.includes('zip') || name.endsWith('.zip')) tags.push('Archive');
  if (name.includes('3d') || name.includes('render')) tags.push('3D');
  if (name.includes('bim') || name.includes('cad')) tags.push('BIM');
  if (name.includes('contract') || name.includes('agreement')) tags.push('Contract');

  if (tags.length === 0) {
    const ext = name.split('.').pop();
    if (ext) tags.push(ext.toUpperCase());
    else tags.push('Document');
  }

  return tags.slice(0, 4);
}

function mapToDocumentItem(doc: PortalDocumentRecord, uploaderName?: string): DocumentItem {
  return {
    id: doc.id,
    name: doc.name,
    folder: inferFolder(doc),
    fileSize: formatFileSize(doc.fileSize),
    uploadedAt: doc.createdAt,
    uploadedBy: uploaderName ?? 'Project Team',
    version: 'v1.0',
    downloadUrl: doc.downloadUrl || '#',
    status: 'approved',
    tags: inferTags(doc),
  };
}

/* -------------------------------------------------------------------------- */
/*  Fallback Mock Data                                                         */
/* -------------------------------------------------------------------------- */

const FALLBACK_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Horizon_Villa_3D_Exterior_Renderings_v2.pdf',
    folder: 'design',
    fileSize: '24.8 MB',
    uploadedAt: '2026-07-22T09:15:00Z',
    uploadedBy: 'Elena Rostova',
    version: 'v2.0',
    downloadUrl: '#',
    status: 'approved',
    tags: ['3D Render', 'Exterior', 'Approved'],
  },
  {
    id: 'doc-2',
    name: 'Master_Services_Agreement_HEXA_Studio.pdf',
    folder: 'contracts',
    fileSize: '4.2 MB',
    uploadedAt: '2026-06-01T11:00:00Z',
    uploadedBy: 'Legal Dept',
    version: 'v1.0',
    downloadUrl: '#',
    status: 'approved',
    tags: ['Contract', 'Legal'],
  },
  {
    id: 'doc-3',
    name: 'BIM_Architectural_Model_Package_R2026.zip',
    folder: 'blueprints',
    fileSize: '142.5 MB',
    uploadedAt: '2026-07-15T16:00:00Z',
    uploadedBy: 'Marcus Vance',
    version: 'v1.2',
    downloadUrl: '#',
    status: 'in_review',
    tags: ['CAD', 'BIM', '3D Model'],
  },
];

const FOLDERS = ['all', 'design', 'contracts', 'blueprints', 'reports'] as const;

const STATUS_LABEL: Record<DocumentItem['status'], { label: string; className: string }> = {
  approved: { label: 'Approved', className: 'text-emerald-400/80' },
  in_review: { label: 'In Review', className: 'text-accent/80' },
  draft: { label: 'Draft', className: 'text-neutral-500' },
};

/* -------------------------------------------------------------------------- */
/*  Upload constants — mirror of the project DocumentUpload surface            */
/* -------------------------------------------------------------------------- */

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_UPLOAD_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
];

function validateUploadFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return 'File must be under 50MB';
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) return 'Unsupported file type';
  return null;
}

/**
 * `.artisan-glass-gold` declares its border via the unlayered shorthand, which
 * outranks Tailwind utilities — so the dashed style must come from an inline
 * style to guarantee the "dashed gold border" treatment on the dropzone.
 */
const DASHED_BORDER_STYLE = { borderStyle: 'dashed' } as const;

/* -------------------------------------------------------------------------- */
/*  Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

function DocumentSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative"
          aria-hidden="true"
        >
          {/* Gold shimmer sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(245, 184, 0, 0.06) 50%, transparent 100%)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'linear',
            }}
          />
          <div className="space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="h-4 w-14 rounded bg-neutral-800" />
              <div className="h-4 w-16 rounded bg-neutral-800" />
            </div>
            <div className="h-4 w-full rounded bg-neutral-800" />
            <div className="h-4 w-3/4 rounded bg-neutral-800" />
            <div className="flex gap-1.5">
              <div className="h-5 w-16 rounded bg-neutral-800" />
              <div className="h-5 w-20 rounded bg-neutral-800" />
              <div className="h-5 w-14 rounded bg-neutral-800" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/[0.06] relative">
            <div className="h-4 w-24 rounded bg-neutral-800" />
            <div className="h-4 w-20 rounded bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function DocumentCenterView() {
  const reduced = useReducedMotion();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'vault' | 'knowledge'>('vault');
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [selectedKnowledgeCatId, setSelectedKnowledgeCatId] = useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<OdooKnowledgeArticle | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Knowledge Base queries
  const { data: knowledgeCategories = [] } = useQuery<OdooKnowledgeCategory[]>({
    queryKey: ['odoo-knowledge-categories'],
    queryFn: () =>
      odooApi.getKnowledgeCategories().catch(() => [
        { id: 1, name: 'Architectural Standards', article_count: 3 },
        { id: 2, name: '3D Materials SOP', article_count: 4 },
        { id: 3, name: 'Client Deliverables', article_count: 2 },
        { id: 4, name: 'Contracts & Legal', article_count: 2 },
      ]),
  });

  const { data: knowledgeArticles = [] } = useQuery<OdooKnowledgeArticle[]>({
    queryKey: ['odoo-knowledge-articles'],
    queryFn: () =>
      odooApi.getKnowledgeArticles().catch(() => [
        {
          id: 1,
          name: 'High-End Photorealistic Lighting Guidelines',
          body: 'This standard operating procedure defines our dual-temperature lighting philosophy: 3200K keylights balanced with 5500K cool diffused ambient skydomes for residential and commercial visual assets.',
          category_id: [1, 'Architectural Standards'],
          create_date: '2026-07-10',
        },
        {
          id: 2,
          name: 'Unreal Engine 5.4 Lumen & Nanite Configuration',
          body: 'Hardware ray-tracing performance matrix, virtual shadow maps, and geometric density thresholds for real-time client walkthroughs.',
          category_id: [2, '3D Materials SOP'],
          create_date: '2026-07-18',
        },
        {
          id: 3,
          name: 'BIM Package Delivery & IFC4 Coordination Protocol',
          body: 'Revit and Archicad coordinate system alignment, LOD 350 element classification, and deliverable handoff checklists.',
          category_id: [3, 'Client Deliverables'],
          create_date: '2026-07-25',
        },
      ]),
  });

  // 1. Fetch projects to determine which project to scope documents to
  const { data: projects = [] } = useQuery({
    queryKey: ['portal-projects'],
    queryFn: () => portalOdooApi.getProjects(),
  });

  // Use the first active project's ID, or null if none available
  const activeProjectId: number | null = projects[0]?.id ?? null;

  // 2. Fetch documents for the active project — deduplicated + TTL-cached via
  //    the shared resource loader (loadProjectDocuments).
  const {
    data: docs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['portal-documents', activeProjectId],
    queryFn: () => loadProjectDocuments(activeProjectId!),
    enabled: !!activeProjectId,
  });

  // 3. Map API records to DocumentItem[] or fall back to mock data
  const documentItems: DocumentItem[] =
    activeProjectId && !isError
      ? docs.map((doc) => mapToDocumentItem(doc, user?.username))
      : FALLBACK_DOCUMENTS;

  const filteredDocs = documentItems.filter((doc) => {
    const matchesFolder = activeFolder === 'all' || doc.folder === activeFolder;
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  /* -------- Upload wiring (mirrors DocumentUpload, refetches the grid) -------- */

  const handleUpload = useCallback(
    async (file: File) => {
      if (!activeProjectId) return;
      const error = validateUploadFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      setIsUploading(true);
      try {
        await portalOdooApi.uploadDocument(activeProjectId, file);
        toast.success('Document secured in the vault');
        await queryClient.invalidateQueries({ queryKey: ['portal-documents', activeProjectId] });
      } catch (err) {
        toast.error('Upload failed. Please try again.');
        console.error('Document upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [activeProjectId, queryClient],
  );

  const openUploadPicker = useCallback(() => {
    if (isUploading) return;
    if (!activeProjectId) {
      toast.error('No active project to receive documents');
      return;
    }
    uploadInputRef.current?.click();
  }, [activeProjectId, isUploading]);

  /* -------- Lazy download wiring (deduplicated via the shared loader) -------- */

  const handleDownload = useCallback(
    async (doc: DocumentItem) => {
      if (!activeProjectId || !doc.downloadUrl || doc.downloadUrl === '#') return;
      try {
        // Loader-backed: repeated downloads of the same document reuse the cache.
        const blob = await lazyLoadDocumentPayload(activeProjectId, doc.id, doc.downloadUrl)();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      } catch (err) {
        toast.error('Download failed. Please try again.');
        console.error('Document download failed:', err);
      }
    },
    [activeProjectId],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void handleUpload(file);
    },
    [handleUpload],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleUpload(file);
      e.target.value = ''; // reset so the same file can be selected again
    },
    [handleUpload],
  );

  /* -------- Render -------- */

  return (
    <div className="relative space-y-6">
      {/* Ambient gold aura behind the header */}
      <div
        aria-hidden="true"
        className="gradient-radial-gold pointer-events-none absolute -top-24 right-0 h-80 w-80 opacity-60"
      />

      {/* § 01 — Header */}
      <motion.div
        variants={fadeLift}
        custom={reduced}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.4em] text-accent/70">
            <span aria-hidden="true" className="h-px w-8 bg-accent/50" />
            § 01 — Documents &amp; Knowledge
          </p>
          <h1 className="mt-4 font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
            {viewMode === 'vault' ? (
              <>The Document <em className="text-gradient-gold font-normal italic">Vault</em></>
            ) : (
              <>Knowledge &amp; <em className="text-gradient-gold font-normal italic">Standard Protocols</em></>
            )}
          </h1>
          <p className="mt-3 max-w-xl text-base font-light leading-relaxed text-neutral-400">
            {viewMode === 'vault'
              ? 'Secure presigned S3 deliverable storage, BIM packages, contracts, and version control.'
              : 'Odoo knowledge repository, architectural design SOPs, and technical handoff matrices.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setViewMode('vault')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all',
                viewMode === 'vault' ? 'bg-accent text-background font-medium' : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              The Vault
            </button>
            <button
              onClick={() => setViewMode('knowledge')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all',
                viewMode === 'knowledge' ? 'bg-accent text-background font-medium' : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              Knowledge Base
            </button>
          </div>

          {viewMode === 'vault' && (
            <Button variant="primary" size="md" className="shrink-0" onClick={openUploadPicker}>
              <Icon name="upload" className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          )}
        </div>
      </motion.div>

      {/* Search & Folder Filters — obsidian instrument rail */}
      <div className="artisan-glass artisan-specular-top relative overflow-hidden rounded-2xl p-4 md:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.06),transparent_70%)]"
        />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xs">
            <Icon
              name="search"
              className="absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-neutral-500"
            />
            <Input
              placeholder="Search documents or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 text-sm font-light"
            />
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Document folders">
            {FOLDERS.map((folder) => {
              const isActive = activeFolder === folder;
              return (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Filter by ${folder} folder`}
                  className={cn(
                    'relative px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-mono rounded-none transition-colors duration-500',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    isActive ? 'text-accent' : 'text-neutral-500 hover:text-neutral-300',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="doc-folder-indicator"
                      className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-accent-light via-accent to-accent-dark"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  {folder}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload Dropzone — "Secured Transfer" deposit vault */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openUploadPicker}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
            e.preventDefault();
            openUploadPicker();
          }
        }}
        role="button"
        tabIndex={0}
        aria-disabled={!activeProjectId || isUploading}
        aria-busy={isUploading}
        style={DASHED_BORDER_STYLE}
        className={cn(
          'artisan-glass-gold artisan-specular-top group relative cursor-pointer overflow-hidden rounded-2xl p-8 text-center md:p-10',
          'transition-colors duration-700 ease-[var(--hexa-ease-interaction)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isUploading && 'pointer-events-none opacity-70',
        )}
      >
        <input
          ref={uploadInputRef}
          type="file"
          className="sr-only"
          onChange={onInputChange}
          accept={ALLOWED_UPLOAD_TYPES.join(',')}
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Gold tint wash on drag — layered overlay so the artisan surface stays intact */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 bg-accent/[0.06] transition-opacity duration-500',
            isDragging ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div className="relative flex flex-col items-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/[0.06]">
            <Icon name="upload" className="h-5 w-5 text-accent" />
          </div>

          <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.4em] text-accent/70">
            <span aria-hidden="true" className="h-px w-6 bg-accent/40" />
            Secured Transfer
            <span aria-hidden="true" className="h-px w-6 bg-accent/40" />
          </p>

          <p className="mt-4 font-serif text-xl font-light text-foreground md:text-2xl">
            {isUploading ? 'Securing your document…' : 'Deposit a document into the vault'}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            PDF · Images · Word · Excel · ZIP — up to 50 MB
          </p>

          {isUploading && (
            <div className="mt-5 flex items-center gap-3" role="status" aria-live="polite">
              <motion.div
                animate={reduced ? undefined : { rotate: 360 }}
                transition={
                  reduced ? undefined : { repeat: Infinity, duration: 1, ease: 'linear' }
                }
                className="h-4 w-4 rounded-full border border-accent/30 border-t-accent"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80">
                Uploading…
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Holdings marker for Vault */}
      {viewMode === 'vault' && (
        <motion.div
          variants={fadeLift}
          custom={reduced}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3"
        >
          <span aria-hidden="true" className="h-px w-8 bg-accent/50" />
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.4em] text-accent/70">
            § 02 — Holdings · {filteredDocs.length} {filteredDocs.length === 1 ? 'Item' : 'Items'}
          </span>
        </motion.div>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === 'knowledge' ? (
          /* ================================================================ */
          /*  KNOWLEDGE BASE VIEW                                             */
          /* ================================================================ */
          <motion.div
            key="knowledge-view"
            variants={fadeLift}
            custom={reduced}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedKnowledgeCatId(null)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-mono transition-all',
                  selectedKnowledgeCatId === null
                    ? 'bg-accent text-background font-medium'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                )}
              >
                All Categories ({knowledgeArticles.length})
              </button>
              {knowledgeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedKnowledgeCatId(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5',
                    selectedKnowledgeCatId === cat.id
                      ? 'bg-accent text-background font-medium'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  )}
                >
                  <span>{cat.name}</span>
                  {cat.article_count !== undefined && (
                    <span className="text-[10px] opacity-70">({cat.article_count})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgeArticles
                .filter((art) => {
                  const matchesCat =
                    selectedKnowledgeCatId === null ||
                    (Array.isArray(art.category_id) && art.category_id[0] === selectedKnowledgeCatId);
                  const matchesQuery =
                    !search ||
                    art.name.toLowerCase().includes(search.toLowerCase()) ||
                    (art.body && art.body.toLowerCase().includes(search.toLowerCase()));
                  return matchesCat && matchesQuery;
                })
                .map((article) => (
                  <div
                    key={article.id}
                    className="artisan-glass artisan-specular-top group relative flex flex-col justify-between rounded-2xl p-6 transition-all hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">
                          {Array.isArray(article.category_id) ? article.category_id[1] : 'General Standard'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">{article.create_date ?? 'Active'}</span>
                      </div>
                      <h3 className="font-serif text-lg font-light text-foreground group-hover:text-accent transition-colors">
                        {article.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
                        {article.body ?? 'Standard operating procedure documentation.'}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-neutral-500">Odoo Knowledge</span>
                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="text-xs font-mono text-accent hover:text-accent-light flex items-center gap-1"
                      >
                        <span>Read SOP</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Article Reader Modal */}
            <AnimatePresence>
              {selectedArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="artisan-glass border border-border/40 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[80vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-start border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-accent">
                          {Array.isArray(selectedArticle.category_id) ? selectedArticle.category_id[1] : 'Standard Protocol'}
                        </span>
                        <h2 className="font-serif text-2xl font-light text-foreground mt-1">
                          {selectedArticle.name}
                        </h2>
                      </div>
                      <button
                        onClick={() => setSelectedArticle(null)}
                        className="text-neutral-400 hover:text-foreground text-sm font-mono p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap font-light">
                      {selectedArticle.body}
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)}>
                        Close Protocol
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : isLoading && activeProjectId ? (
          <DocumentSkeleton key="loading-skeleton" />
        ) : filteredDocs.length > 0 ? (
          <motion.div
            key={`grid-${activeFolder}-${search}`}
            role="list"
            aria-label="Documents"
            variants={staggerContainer(STAGGER.component)}
            custom={reduced}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredDocs.map((doc) => (
              <motion.div
                key={doc.id}
                role="listitem"
                variants={fadeLift}
                custom={reduced}
                whileHover={reduced ? undefined : { y: -3, transition: makeTransition('interaction', 'micro') }}
                className="group relative"
              >
                <article className="artisan-glass artisan-specular-top flex h-full flex-col justify-between overflow-hidden rounded-2xl p-6">
                  {/* Subtle hover specular gold aura */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/5 opacity-0 blur-2xl transition-opacity duration-700 ease-[var(--hexa-ease-interaction)] group-hover:opacity-100"
                  />

                  <div>
                    {/* Top row: folder + status pill */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-neutral-500">
                        § {doc.folder}
                      </span>
                      <span
                        className={cn(
                          'rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em]',
                          STATUS_LABEL[doc.status]?.className,
                        )}
                      >
                        {STATUS_LABEL[doc.status]?.label ?? doc.status}
                      </span>
                    </div>

                    {/* File icon + file name */}
                    <div className="mt-4 flex items-start gap-3">
                      <div
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/5 font-mono text-[0.625rem] font-medium tracking-wider text-accent"
                      >
                        {getFileTypeLabel(doc.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-sans text-sm font-medium text-foreground">
                          {doc.name}
                        </h2>
                        <p className="mt-1 font-mono text-xs text-neutral-500">{doc.fileSize}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {doc.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Document tags">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded border border-white/5 bg-white/[0.03] px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-neutral-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer: metadata + download button */}
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[0.625rem] text-neutral-400">
                        {doc.uploadedBy}
                      </p>
                      <p className="font-mono text-[0.5625rem] text-neutral-600">
                        {new Date(doc.uploadedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <a
                      href={doc.downloadUrl}
                      onClick={(e) => {
                        if (activeProjectId) {
                          e.preventDefault();
                          void handleDownload(doc);
                        }
                      }}
                      className="group/download inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono text-accent transition-colors duration-500 hover:text-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label={`Download ${doc.name}`}
                    >
                      <Icon name="download" className="h-4 w-4" />
                      <span>Download</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-500 ease-[var(--hexa-ease-interaction)] group-hover/download:translate-x-1"
                      >
                        →
                      </span>
                    </a>
                  </div>
                </article>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty-results"
            variants={fadeLift}
            custom={reduced}
            initial="hidden"
            animate="visible"
            exit="hidden"
            role="status"
            className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/40 px-6 py-24 text-center"
          >
            {/* Gold aura */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl"
            />

            {/* Diamond ornament rule */}
            <div className="relative flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-accent/40" />
              <span aria-hidden="true" className="h-2 w-2 rotate-45 border border-accent/50 bg-accent/10" />
              <span aria-hidden="true" className="h-px w-10 bg-accent/40" />
            </div>

            <div className="relative mt-6 flex h-14 w-14 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.04]">
              <Icon name="file-text" className="h-6 w-6 text-accent/70" />
            </div>

            <p className="relative mt-6 font-serif text-2xl font-light text-foreground/90">
              The archive is <em className="text-gradient-gold font-normal italic">silent</em>
            </p>
            <p className="relative mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
              Nothing matches your search and folder filter. Try a different keyword or reset the
              folder to <span className="text-accent font-medium">all</span>.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="relative mt-6"
              onClick={() => {
                setSearch('');
                setActiveFolder('all');
              }}
            >
              Clear filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
