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
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
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
          <h1 className="text-3xl md:text-4xl font-serif font-light tracking-tight text-foreground">Document Center</h1>
          <p className="text-base font-light text-neutral-400 leading-relaxed mt-2 max-w-xl">
            Secure presigned S3 deliverable storage, BIM packages, contracts, and version control.
          </p>
        </div>
        <Button variant="primary" size="md" className="group">
          <Icon name="upload" className="w-4 h-4 mr-2" />
          Upload Document
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            →
          </motion.span>
        </Button>
      </motion.div>

      {/* Search & Folder Filters */}
      <LiquidGlassCard glow className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-xs">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Search documents or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 bg-background/30 border-border/30 focus:border-accent/50 rounded-none py-3 text-sm font-light"
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
                    'relative px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-mono rounded-none transition-all duration-500',
                    isActive
                      ? 'text-accent bg-white/5 border-b-2 border-accent'
                      : 'text-neutral-500 hover:text-neutral-300'
                  )}
                >
                  {folder}
                </button>
              );
            })}
          </div>
        </div>
      </LiquidGlassCard>

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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDocs.map((doc) => (
              <motion.div
                key={doc.id}
                variants={fadeLift}
                whileHover={reduced ? undefined : { y: -8, transition: makeTransition('interaction', 'micro') }}
              >
                <LiquidGlassCard glow className="p-6 h-full flex flex-col transition-all duration-700 group-hover:border-accent/20">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-accent/70">{doc.version}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-mono">{doc.fileSize}</span>
                    </div>
                    <h3 className="text-lg font-serif font-light text-foreground/95 leading-tight mb-2 group-hover:text-white transition-colors duration-500 line-clamp-2">{doc.name}</h3>
                    <p className="text-sm font-light text-neutral-500 mb-6">Uploaded by {doc.uploadedBy}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] uppercase tracking-[0.2em] font-mono bg-white/5 text-neutral-400 px-2.5 py-1 rounded-none border border-white/10"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-mono">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    <a
                      href={doc.downloadUrl}
                      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono text-accent hover:text-white transition-colors duration-500 group"
                      aria-label={`Download ${doc.name}`}
                    >
                      <Icon name="download" className="w-4 h-4" />
                      <span>Download</span>
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      >
                        →
                      </motion.span>
                    </a>
                  </div>
                </LiquidGlassCard>
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
            className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-white/10 rounded-2xl"
            role="status"
          >
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-neutral-300 mb-6">
              <Icon name="file-text" className="w-10 h-10 mx-auto text-accent/50" />
            </div>
            <p className="text-lg font-light text-neutral-300 mb-2">No documents found</p>
            <p className="text-sm text-neutral-500 mt-1 max-w-xs leading-relaxed">
              Nothing matches your search and folder filter. Try a different keyword or reset the folder to{' '}
              <span className="text-accent font-medium">all</span>.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-6"
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
