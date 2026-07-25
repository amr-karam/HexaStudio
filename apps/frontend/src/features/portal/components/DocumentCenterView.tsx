'use client';

/**
 * HEXA Portal v3.0 — Document Center View
 *
 * Folder management, presigned MinIO downloads, version history, tags, and search.
 */

import React, { useState } from 'react';
import { Icon } from './PortalIcons';
import type { DocumentItem } from '../types';

const DOCUMENTS: DocumentItem[] = [
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

export function DocumentCenterView() {
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string>('all');

  const filteredDocs = DOCUMENTS.filter((doc) => {
    const matchesFolder = activeFolder === 'all' || doc.folder === activeFolder;
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || doc.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">Document Center</h1>
          <p className="text-sm text-neutral-400">
            Secure presigned S3 deliverable storage, BIM packages, contracts, and version control.
          </p>
        </div>
        <button className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20">
          <Icon name="upload" className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search & Folder Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900 p-4 rounded-xl border border-neutral-800">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'design', 'contracts', 'blueprints', 'reports'].map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                activeFolder === folder
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {folder}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or tags..."
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
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
                  <span key={idx} className="text-[10px] bg-neutral-800/60 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700/40">
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
              >
                <Icon name="download" className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
