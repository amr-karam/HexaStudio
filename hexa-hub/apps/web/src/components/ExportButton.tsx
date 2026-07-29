'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Check } from 'lucide-react';
import { cn } from '@/components/ui/cn';

// ─── Types ──────────────────────────────────────────────────────────────

export interface ExportColumn {
  /** Column header text */
  header: string;
  /** Key in the data object to extract the value from */
  key: string;
  /** Optional custom formatter for the cell value */
  format?: (value: unknown, row: Record<string, unknown>) => string;
}

export interface ExportButtonProps {
  /** Array of data objects to export */
  data: Record<string, unknown>[];
  /** Column definitions: header label + data key mapping */
  columns: ExportColumn[];
  /** Filename without extension */
  filename: string;
  /** Export format — currently supports 'csv' */
  format?: 'csv' | 'pdf';
  /** Custom button label */
  label?: string;
  /** Button size */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

// ─── Formatters ─────────────────────────────────────────────────────────

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';

  // Handle dates
  if (value instanceof Date) {
    return value.toISOString().split('T')[0] ?? '';
  }

  if (typeof value === 'string') {
    // Detect ISO date strings
    const isoMatch = /^\d{4}-\d{2}-\d{2}(T|\s)/.exec(value);
    if (isoMatch) {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0] ?? '';
        }
      } catch {
        // fall through to string handling
      }
    }
    // Escape CSV special characters: double quotes, commas, newlines
    if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  if (typeof value === 'number') {
    // Preserve numeric precision
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(2);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Objects/arrays → JSON string (safe for nested Odoo tuples like [id, name])
  if (typeof value === 'object') {
    const str = JSON.stringify(value);
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  return String(value);
}

function escapeCSVCell(value: string): string {
  if (value === '') return value;
  if (
    value.includes('"') ||
    value.includes(',') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ─── CSV Generation ─────────────────────────────────────────────────────

function generateCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
): string {
  // Header row
  const headerRow = columns
    .map((col) => escapeCSVCell(col.header))
    .join(',');

  // Data rows
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        if (col.format) {
          return escapeCSVCell(col.format(row[col.key], row));
        }
        return escapeCSVCell(formatCellValue(row[col.key]));
      })
      .join(','),
  );

  return [headerRow, ...dataRows].join('\r\n');
}

// ─── File Download ──────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}

// ─── Component ──────────────────────────────────────────────────────────

export function ExportButton({
  data,
  columns,
  filename,
  format = 'csv',
  label,
  size = 'sm',
  className,
  disabled = false,
}: ExportButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedLabel = label ?? (format === 'csv' ? 'Export CSV' : 'Export PDF');
  const isEmpty = !data || data.length === 0;

  const handleExport = useCallback(async () => {
    if (isEmpty || disabled || state !== 'idle') return;

    setState('loading');

    // Small delay to show the loading state
    await new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, 400);
    });

    try {
      if (format === 'csv') {
        const csvContent = generateCSV(data, columns);
        downloadFile(csvContent, `${filename}.csv`, 'text/csv');
      } else {
        // PDF placeholder — would integrate client-side PDF library
        const csvContent = generateCSV(data, columns);
        downloadFile(csvContent, `${filename}.csv`, 'text/csv');
      }

      setState('success');

      // Reset back to idle after showing success checkmark
      timeoutRef.current = setTimeout(() => {
        setState('idle');
      }, 1800);
    } catch {
      setState('idle');
    }
  }, [data, columns, filename, format, isEmpty, disabled, state]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[11px] gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-xs gap-2 rounded-lg',
  };

  const isButtonDisabled = disabled || isEmpty || state === 'loading';

  return (
    <motion.button
      whileHover={!isButtonDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isButtonDisabled ? { scale: 0.98 } : undefined}
      onClick={handleExport}
      disabled={isButtonDisabled}
      className={cn(
        'inline-flex items-center justify-center font-light tracking-wide transition-all duration-300',
        'bg-transparent text-neutral-400 border border-[#1F1F1F]',
        'hover:text-[#D4A843] hover:border-[#D4A843]/30 hover:bg-white/[0.02]',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        sizeClasses[size],
        state === 'success' && 'border-[#D4A843]/40 text-[#D4A843] bg-[#D4A843]/[0.04]',
        className,
      )}
      title={isEmpty ? 'No data to export' : `${resolvedLabel} (${data.length} rows)`}
      aria-label={resolvedLabel}
    >
      {state === 'loading' ? (
        <div className="w-3.5 h-3.5 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
      ) : state === 'success' ? (
        <Check size={13} className="text-emerald-400" />
      ) : (
        <Download size={13} />
      )}
      <span>{resolvedLabel}</span>
    </motion.button>
  );
}

export default ExportButton;
