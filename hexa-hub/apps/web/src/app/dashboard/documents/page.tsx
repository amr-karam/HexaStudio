'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  FileText,
  Image,
  File,
  Download,
  Search,
  Upload,
  Filter,
  Clock,
  X,
  FileSpreadsheet,
  FileCode,
  FileVideo,
  FileAudio,
  FileArchive,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/components/ui/cn';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Document {
  id: string;
  name: string;
  mimetype: string;
  filesize: number;
  folderName?: string;
  projectId?: string;
  projectName?: string;
  createdAt: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'model/obj',
  'model/stl',
  'application/octet-stream',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// ─── File Type Detection ────────────────────────────────────────────────────

interface FileTypeInfo {
  icon: LucideIcon;
  color: string;
  label: string;
}

function getFileTypeInfo(mimetype: string): FileTypeInfo {
  if (mimetype.startsWith('image/')) {
    return { icon: Image, color: 'text-amber-400', label: 'Image' };
  }
  if (mimetype.startsWith('video/')) {
    return { icon: FileVideo, color: 'text-violet-400', label: 'Video' };
  }
  if (mimetype.startsWith('audio/')) {
    return { icon: FileAudio, color: 'text-pink-400', label: 'Audio' };
  }
  if (
    mimetype.includes('spreadsheet') ||
    mimetype.includes('excel') ||
    mimetype === 'text/csv'
  ) {
    return { icon: FileSpreadsheet, color: 'text-emerald-400', label: 'Spreadsheet' };
  }
  if (
    mimetype.includes('document') ||
    mimetype.includes('word') ||
    mimetype === 'text/plain'
  ) {
    return { icon: FileText, color: 'text-blue-400', label: 'Document' };
  }
  if (
    mimetype === 'application/pdf' ||
    mimetype.includes('presentation') ||
    mimetype.includes('powerpoint')
  ) {
    return { icon: FileText, color: 'text-red-400', label: 'Document' };
  }
  if (
    mimetype.includes('zip') ||
    mimetype.includes('rar') ||
    mimetype.includes('7z') ||
    mimetype.includes('compressed')
  ) {
    return { icon: FileArchive, color: 'text-orange-400', label: 'Archive' };
  }
  if (
    mimetype.includes('code') ||
    mimetype.includes('javascript') ||
    mimetype.includes('json') ||
    mimetype.includes('xml')
  ) {
    return { icon: FileCode, color: 'text-cyan-400', label: 'Code' };
  }
  return { icon: File, color: 'text-neutral-400', label: 'File' };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Upload Modal ───────────────────────────────────────────────────────────

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  projects: ProjectOption[];
}

function UploadModal({ isOpen, onClose, onUploadComplete, projects }: UploadModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number>(-1);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      setSelectedProjectId('');
      setUploadProgress(0);
      setUploadingIndex(-1);
      setIsUploading(false);
      setValidationError(null);
      setIsDragging(false);
    }
  }, [isOpen]);

  const validateFiles = useCallback((files: File[]): string | null => {
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== '') {
        return `File type "${file.type || 'unknown'}" is not supported.`;
      }
      if (file.size > MAX_FILE_SIZE) {
        return `${file.name} exceeds the 100MB size limit.`;
      }
      if (file.size === 0) {
        return `${file.name} is empty.`;
      }
    }
    return null;
  }, []);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const fileArray = Array.from(files);
      const error = validateFiles(fileArray);
      if (error) {
        setValidationError(error);
        return;
      }
      setValidationError(null);
      setSelectedFiles((prev) => [...prev, ...fileArray]);
    },
    [validateFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (uploadingIndex === index) {
      setUploadingIndex(-1);
      setUploadProgress(0);
    }
  }, [uploadingIndex]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleUploadSingle = useCallback(
    async (index: number) => {
      const file = selectedFiles[index];
      if (!file || !selectedProjectId || !token) return;

      setUploadingIndex(index);
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('mimetype', file.type || 'application/octet-stream');

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        await axios.post(`${API_URL}/odoo/documents/${selectedProjectId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(pct);
            }
          },
        });

        toast.success('Upload complete', `${file.name} has been uploaded successfully.`);

        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setUploadingIndex(-1);
        setUploadProgress(0);
        setIsUploading(false);

        onUploadComplete();
      } catch (err) {
        toast.error('Upload failed', `Could not upload ${file.name}. Please try again.`);
        setUploadingIndex(-1);
        setUploadProgress(0);
        setIsUploading(false);
      }
    },
    [selectedFiles, selectedProjectId, token, toast, onUploadComplete],
  );

  const handleUploadAll = useCallback(async () => {
    if (!selectedProjectId) {
      setValidationError('Please select a project first.');
      return;
    }
    for (let i = 0; i < selectedFiles.length; i++) {
      await handleUploadSingle(i);
    }
  }, [selectedFiles, selectedProjectId, handleUploadSingle]);

  const canUpload = selectedFiles.length > 0 && selectedProjectId && !isUploading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-[#141414] border border-[#1F1F1F] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-[#1F1F1F]/50">
              <div>
                <h2 className="text-lg font-serif font-light text-white">Upload Documents</h2>
                <p className="text-sm text-[#666] font-light mt-1">
                  Select files and choose a project to upload them to.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-white/[0.05] transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Project Selector */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium ml-1 block mb-2">
                  Project
                </label>
                <div className="relative">
                  <button
                    onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-light transition-all duration-200',
                      'bg-[#141414] border border-[#1F1F1F] text-white',
                      'hover:border-[#D4A843]/30 focus:outline-none',
                    )}
                  >
                    <span className={selectedProject ? 'text-white' : 'text-[#555]'}>
                      {selectedProject ? selectedProject.name : 'Select a project...'}
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'text-[#555] transition-transform duration-200',
                        projectDropdownOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {projectDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full mt-1 left-0 right-0 bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto"
                      >
                        {projects.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-[#555]">No projects available.</div>
                        ) : (
                          projects.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setSelectedProjectId(p.id);
                                setProjectDropdownOpen(false);
                              }}
                              className={cn(
                                'w-full text-left px-4 py-2.5 text-sm font-light transition-colors duration-150',
                                selectedProjectId === p.id
                                  ? 'bg-[#D4A843]/10 text-[#D4A843]'
                                  : 'text-neutral-300 hover:bg-white/[0.05]',
                              )}
                            >
                              {p.name}
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                  isDragging
                    ? 'border-[#D4A843]/50 bg-[#D4A843]/5'
                    : 'border-[#1F1F1F] hover:border-[#2A2A2A] bg-[#0A0A0A]/30',
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  accept={ALLOWED_MIME_TYPES.join(',')}
                />
                <Upload size={28} className="text-[#444] mx-auto mb-3" />
                <p className="text-sm text-[#888] font-light mb-1">
                  {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
                </p>
                <p className="text-[10px] text-[#555] font-light">
                  PDF, images, documents, spreadsheets, archives, and more (up to 100MB)
                </p>
              </div>

              {/* Validation Error */}
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-400 font-light">{validationError}</p>
                </motion.div>
              )}

              {/* Selected Files */}
              <AnimatePresence>
                {selectedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#444] font-medium">
                      Selected Files ({selectedFiles.length})
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {selectedFiles.map((file, i) => {
                        const typeInfo = getFileTypeInfo(file.type);
                        const FileIcon = typeInfo.icon;
                        const isCurrent = uploadingIndex === i;

                        return (
                          <motion.div
                            key={`${file.name}-${i}`}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 4 }}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors',
                              isCurrent
                                ? 'bg-[#D4A843]/5 border-[#D4A843]/20'
                                : 'bg-[#0A0A0A]/20 border-[#1F1F1F]/30',
                            )}
                          >
                            <FileIcon size={16} className={cn(typeInfo.color, 'shrink-0')} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white font-light truncate">{file.name}</p>
                              <p className="text-[10px] text-[#555]">
                                {formatFileSize(file.size)}
                              </p>
                              {isCurrent && (
                                <div className="mt-1.5 w-full h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-[#D4A843] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.1 }}
                                  />
                                </div>
                              )}
                            </div>
                            {isCurrent ? (
                              <span className="text-[10px] text-[#D4A843] font-mono">
                                {uploadProgress}%
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(i);
                                }}
                                className="p-1 rounded-md text-[#555] hover:text-red-400 transition-colors"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#1F1F1F]/50 bg-[#0A0A0A]/20 rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-[#666] hover:text-white transition-colors font-light"
              >
                Cancel
              </button>
              <Button
                onClick={handleUploadAll}
                disabled={!canUpload}
                isLoading={isUploading}
                variant="primary"
                size="sm"
              >
                <Upload size={14} />
                Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Documents Page ────────────────────────────────────────────────────

export default function DocumentsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filterFolder, setFilterFolder] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await axios.get(`${API_URL}/odoo/documents`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? res.data?.documents ?? [];
      setDocuments(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [token, API_URL]);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/odoo/projects`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];
      setProjects(
        data.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.name || p.display_name || 'Untitled'),
        })),
      );
    } catch {
      // Non-critical, just won't show projects dropdown
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchDocuments();
    fetchProjects();
  }, [fetchDocuments, fetchProjects]);

  // ── Derived Data ──────────────────────────────────────────────────────────

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.projectName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = !filterFolder || doc.folderName === filterFolder;
    return matchesSearch && matchesFolder;
  });

  // Build folder list from documents
  const folderMap = new Map<string, number>();
  documents.forEach((doc) => {
    const folder = doc.folderName || 'Uncategorized';
    folderMap.set(folder, (folderMap.get(folder) || 0) + 1);
  });
  const folders = Array.from(folderMap.entries()).map(([name, count]) => ({ name, count }));

  const folderIcons: Record<string, { icon: LucideIcon; color: string }> = {
    Contracts: { icon: FileText, color: 'text-blue-400' },
    Blueprints: { icon: Image, color: 'text-amber-400' },
    Reports: { icon: FileText, color: 'text-emerald-400' },
    Proposals: { icon: File, color: 'text-violet-400' },
    Uncategorized: { icon: Folder, color: 'text-neutral-500' },
    Invoices: { icon: FileText, color: 'text-rose-400' },
    Drawings: { icon: Image, color: 'text-cyan-400' },
    Presentations: { icon: FileText, color: 'text-orange-400' },
  };

  // ── Loading State ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-8 md:p-12">
        <div className="mb-10">
          <Skeleton variant="text" width={250} height={40} className="mb-2" />
          <Skeleton variant="text" width={350} height={20} />
          <div className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent" />
        </div>
        <div className="flex items-center gap-3 mb-8">
          <Skeleton variant="rectangular" width="100%" height={42} className="flex-1 rounded-lg" />
          <Skeleton variant="rectangular" width={80} height={42} className="rounded-lg" />
          <Skeleton variant="rectangular" width={110} height={42} className="rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={120} className="rounded-2xl" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={50} className="rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────

  if (isError) {
    return (
      <div className="p-8 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-lg text-white font-light mb-1">Failed to load documents</h2>
          <p className="text-sm text-[#666] font-light mb-6">
            There was an error loading your documents. Please try again.
          </p>
          <Button variant="primary" onClick={fetchDocuments}>
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Main Content ──────────────────────────────────────────────────────────

  return (
    <div className="p-8 md:p-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h1 className="text-4xl font-serif font-light mb-2">
          <span className="text-gold">Documents</span>
        </h1>
        <p className="text-neutral-500 font-light">
          Centralized document storage for your workspace.
        </p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4A843]/40 transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-xs text-[#888] hover:text-white transition-colors">
          <Filter size={13} />
          Filter
        </button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setUploadOpen(true)}
        >
          <Upload size={14} />
          Upload
        </Button>
      </div>

      {/* Folder Grid */}
      {folders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {folders.map((folder, i) => {
            const config = folderIcons[folder.name] ?? { icon: Folder, color: 'text-neutral-500' };
            const FolderIcon = config.icon;
            const isActive = filterFolder === folder.name;

            return (
              <motion.div
                key={folder.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                onClick={() =>
                  setFilterFolder(isActive ? null : folder.name)
                }
                className={cn(
                  'p-6 rounded-2xl cursor-pointer group transition-all duration-300 border',
                  isActive
                    ? 'bg-[#D4A843]/5 border-[#D4A843]/20'
                    : 'bg-[#141414] border-[#1F1F1F] hover:border-[#2A2A2A]',
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center border',
                      isActive
                        ? 'bg-[#D4A843]/10 border-[#D4A843]/20'
                        : 'bg-[#0A0A0A] border-[#1F1F1F]',
                    )}
                  >
                    <FolderIcon size={20} className={config.color} />
                  </div>
                  <div>
                    <p className="text-sm font-serif font-light text-white group-hover:text-gold transition-colors">
                      {folder.name}
                    </p>
                    <p className="text-xs text-neutral-600">{folder.count} files</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <Download size={12} />
                  <span>{isActive ? 'Showing filtered' : 'Access folder'}</span>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="mt-3 h-0.5 bg-gradient-to-r from-[#D4A843]/40 to-transparent"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && documents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mb-5">
            <Folder size={28} className="text-[#444]" />
          </div>
          <h2 className="text-lg text-white font-light mb-1">No documents yet</h2>
          <p className="text-sm text-[#666] font-light mb-6">
            Upload your first document to get started.
          </p>
          <Button variant="primary" onClick={() => setUploadOpen(true)}>
            <Upload size={14} />
            Upload Document
          </Button>
        </motion.div>
      )}

      {/* Filtered Empty State */}
      {!isLoading && documents.length > 0 && filteredDocs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mb-4">
            <Search size={22} className="text-[#444]" />
          </div>
          <p className="text-sm text-[#888] font-light mb-1">No matching documents</p>
          <p className="text-xs text-[#555] font-light">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search term.`
              : 'No documents in this folder.'}
          </p>
        </motion.div>
      )}

      {/* Documents List */}
      {filteredDocs.length > 0 && (
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F1F1F]/50">
            <p className="text-sm text-neutral-400 font-light">
              {filterFolder ? `${filterFolder} Documents` : 'Recent Documents'}
            </p>
          </div>
          {filteredDocs.map((doc, i) => {
            const typeInfo = getFileTypeInfo(doc.mimetype);
            const DocIcon = typeInfo.icon;
            return (
              <div
                key={doc.id || i}
                className="flex items-center justify-between px-6 py-3.5 border-b border-[#1F1F1F]/30 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <DocIcon size={18} className={typeInfo.color} />
                  <div>
                    <p className="text-sm text-white font-light group-hover:text-[#D4A843] transition-colors">
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-[#555]">
                      {doc.folderName || 'Uncategorized'}
                      {doc.projectName && ` · ${doc.projectName}`}
                      {' · '}
                      {formatFileSize(doc.filesize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-[#555] flex items-center gap-1">
                    <Clock size={11} />
                    {formatTimeAgo(doc.createdAt)}
                  </span>
                  <Badge variant="default" size="sm">
                    {typeInfo.label}
                  </Badge>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-[#555] hover:text-[#D4A843] hover:bg-white/5">
                    <Download size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={fetchDocuments}
        projects={projects}
      />
    </div>
  );
}
