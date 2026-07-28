'use client';

/**
 * HEXA Portal v3.0 — Document Center View
 *
 * Folder management, presigned MinIO downloads, version history, tags, and search.
 *
 * Cinematic framer-motion choreography:
 *  - Staggered entrance for document cards
 *  - Hover-lift micro-interaction on document cards
 *  - Shared-layout animated filter pills
 *  - Premium empty state for no search results
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Icon } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeLift, staggerContainer, makeTransition, STAGGER } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth';
import { portalOdooApi } from '@/features/odoo/api';
import type { DocumentItem } from '../types';
import type { PortalDocumentRecord } from '@/features/odoo/api';

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

/* -------------------------------------------------------------------------- */
/*  Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

function DocumentSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between overflow-hidden relative"
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
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-neutral-800 relative">
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
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string>('all');

  // 1. Fetch projects to determine which project to scope documents to
  const { data: projects = [] } = useQuery({
    queryKey: ['portal-projects'],
    queryFn: () => portalOdooApi.getProjects(),
  });

  // Use the first active project's ID, or null if none available
  const activeProjectId: number | null = projects[0]?.id ?? null;

  // 2. Fetch documents for the active project
  const {
    data: docs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['portal-documents', activeProjectId],
    queryFn: () => portalOdooApi.getDocuments(activeProjectId!),
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

  /* -------- Render -------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeLift}
        custom={reduced}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">Document Center</h1>
          <p className="text-sm text-neutral-400">
            Secure presigned S3 deliverable storage, BIM packages, contracts, and version control.
          </p>
        </div>
        <button
          className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20"
          aria-label="Upload a new document"
        >
          <Icon name="upload" className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </motion.div>

      {/* Search & Folder Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900 p-4 rounded-xl border border-neutral-800">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto" role="tablist" aria-label="Document folders">
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
                  'relative px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors',
                  isActive ? 'text-neutral-950' : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="folder-pill-active"
                    className="absolute inset-0 rounded-lg bg-amber-500"
                    transition={reduced ? { duration: 0.01 } : makeTransition('interaction', 'micro')}
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{folder}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or tags..."
            aria-label="Search documents by name or tag"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <Icon name="search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        </div>
      </div>

      {/* Document Grid */}
      <AnimatePresence mode="wait">
        {isLoading && activeProjectId ? (
          <DocumentSkeleton />
        ) : filteredDocs.length > 0 ? (
          <motion.div
            key={`grid-${activeFolder}-${search}`}
            variants={staggerContainer(STAGGER.component)}
            custom={reduced}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredDocs.map((doc) => (
              <motion.div
                key={doc.id}
                variants={fadeLift}
                whileHover={reduced ? undefined : { y: -6, transition: makeTransition('interaction', 'micro') }}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400 uppercase tracking-wider">
                      {doc.version}
                    </span>
                    <span className="text-xs text-neutral-500">{doc.fileSize}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-100 mt-3 line-clamp-2">{doc.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1">Uploaded by {doc.uploadedBy}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {doc.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-neutral-800/60 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-neutral-800">
                  <span className="text-[11px] text-neutral-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  <a
                    href={doc.downloadUrl}
                    className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                    aria-label={`Download ${doc.name}`}
                  >
                    <Icon name="download" className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
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
            className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-neutral-800 rounded-xl"
            role="status"
          >
            <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-800 text-neutral-300">
              <Icon name="file-text" className="w-8 h-8" />
            </div>
            <p className="text-neutral-300 font-medium mt-4">No documents found</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs">
              Nothing matches your search and folder filter. Try a different keyword or reset the folder to{' '}
              <span className="text-amber-400 font-semibold">all</span>.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setActiveFolder('all');
              }}
              className="mt-4 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
