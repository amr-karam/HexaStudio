'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/i18n/LocaleProvider';
import { portalOdooApi, type PortalDocumentRecord } from '@/features/odoo/api';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

interface DocumentUploadProps {
  projectId: number;
  documents: PortalDocumentRecord[];
  onDocumentsChange: (documents: PortalDocumentRecord[]) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
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

function fileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('image')) return 'IMG';
  if (mimeType.includes('word') || mimeType.includes('officedocument.wordprocessingml')) return 'DOC';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheetml')) return 'XLS';
  if (mimeType.includes('zip')) return 'ZIP';
  return 'FILE';
}

export function DocumentUpload({ projectId, documents, onDocumentsChange }: DocumentUploadProps) {
  const { t, locale } = useLocale();
  const { staticMode } = useMotionPolicy();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isRTL = locale === 'ar';

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return t('portal.documents.errorTooLarge') || 'File must be under 50MB';
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t('portal.documents.errorType') || 'Unsupported file type';
    }
    return null;
  };

  const handleUpload = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      setIsUploading(true);
      try {
        const uploaded = await portalOdooApi.uploadDocument(projectId, file);
        onDocumentsChange([uploaded, ...documents]);
        toast.success(t('portal.documents.uploadSuccess') || 'Document uploaded');
      } catch (err) {
        toast.error(
          t('portal.documents.uploadFailed') || 'Upload failed. Please try again.',
        );
        console.error('Document upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, documents, onDocumentsChange, t],
  );

  const handleDelete = useCallback(
    async (documentId: string) => {
      setDeletingId(documentId);
      try {
        await portalOdooApi.deleteDocument(projectId, documentId);
        onDocumentsChange(documents.filter((d) => d.id !== documentId));
        toast.success(t('portal.documents.deleteSuccess') || 'Document deleted');
      } catch (err) {
        toast.error(
          t('portal.documents.deleteFailed') || 'Delete failed. Please try again.',
        );
        console.error('Document delete failed:', err);
      } finally {
        setDeletingId(null);
      }
    },
    [projectId, documents, onDocumentsChange, t],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      e.target.value = ''; // reset so same file can be selected again
    },
    [handleUpload],
  );

  return (
    <section
      className="bg-surface border border-border/50 rounded-sm overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-busy={isUploading || deletingId !== null}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent/60" />
          <h2 className="text-base font-medium text-foreground tracking-wide">
            {t('portal.documents.title') || 'Project Documents'}
          </h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Drop Zone */}
        <motion.div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          animate={
            staticMode
              ? {}
              : {
                  borderColor: isDragging ? 'rgba(212, 175, 55, 0.6)' : 'rgba(255, 255, 255, 0.08)',
                  backgroundColor: isDragging ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                }
          }
          className={cn(
            'relative group cursor-pointer rounded-sm border border-dashed border-border/40 p-8 text-center transition-colors',
            'hover:border-accent/40 hover:bg-accent/[0.03]',
            isDragging && 'border-accent/60 bg-accent/5',
            isUploading && 'pointer-events-none opacity-60',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={onInputChange}
            accept={ALLOWED_TYPES.join(',')}
            aria-label={t('portal.documents.uploadAria') || 'Upload document'}
          />

          <motion.div
            className="mx-auto mb-4 w-12 h-12 rounded-full border border-border/40 flex items-center justify-center text-neutral-500 group-hover:text-accent group-hover:border-accent/40 transition-colors"
            animate={staticMode ? {} : { y: isDragging ? -4 : 0 }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h18v-3.75M21 12.75V7.5a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 7.5v5.25" />
            </svg>
          </motion.div>

          <p className="text-sm text-foreground font-medium mb-1">
            {t('portal.documents.dropHere') || 'Drop a file here, or click to browse'}
          </p>
          <p className="text-xs text-neutral-500 font-light">
            {t('portal.documents.supportedTypes') || 'PDF, images, Word, Excel, ZIP up to 50MB'}
          </p>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-3" role="status" aria-live="polite">
                {staticMode ? (
                  <div className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent" />
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent"
                  />
                )}
                <span className="text-xs text-neutral-500 font-mono">
                  {t('portal.documents.uploading') || 'Uploading...'}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Document List */}
        <AnimatePresence mode="popLayout">
          {documents.length === 0 ? (
            <motion.div
              initial={staticMode ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={staticMode ? {} : { opacity: 0 }}
              className="text-center py-8 text-neutral-500 text-sm"
            >
              {t('portal.documents.empty') || 'No documents uploaded yet.'}
            </motion.div>
          ) : (
            <ul className="space-y-3">
              {documents.map((doc) => (
                <motion.li
                  key={doc.id}
                  layout={!staticMode}
                  initial={staticMode ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={staticMode ? {} : { opacity: 0, scale: 0.98 }}
                  className="flex items-center gap-4 p-4 bg-background border border-border/30 rounded-sm group hover:border-accent/20 transition-colors"
                >
                  {/* File icon */}
                  <div className="w-10 h-10 rounded-sm bg-surface border border-border/30 flex items-center justify-center text-[10px] font-mono text-accent/80 shrink-0">
                    {fileIcon(doc.mimeType)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      {formatFileSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {doc.downloadUrl && (
                      <a
                        href={doc.downloadUrl}
                        download={doc.name}
                        className="p-2 text-neutral-500 hover:text-accent transition-colors"
                        aria-label={t('portal.documents.download') || 'Download'}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3" />
                        </svg>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="p-2 text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-50"
                      aria-label={
                        deletingId === doc.id
                          ? 'Deleting document...'
                          : (t('portal.documents.delete') || 'Delete')
                      }
                    >
                      {deletingId === doc.id ? (
                        staticMode ? (
                          <div className="w-4 h-4 rounded-full border-2 border-red-400/30 border-t-red-400" />
                        ) : (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-4 h-4 rounded-full border-2 border-red-400/30 border-t-red-400"
                          />
                        )
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </AnimatePresence>

        {/* Live region for delete completion announcements */}
        <div role="status" aria-live="polite" className="sr-only">
          {deletingId === null && documents.length > 0 && ''}
        </div>
      </div>
    </section>
  );
}
