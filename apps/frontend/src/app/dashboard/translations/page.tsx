'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { translationApi, type TranslationStatus, type TranslationExport } from '@/features/integrations/api-translations';

const LOCALE_LABELS: Record<string, string> = {
  ar: 'العربية', es: 'Español', fr: 'Français', de: 'Deutsch',
  ja: '日本語', ko: '한국어', zh: '中文',
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  articles: 'Articles', portfolios: 'Projects', services: 'Services',
  faqs: 'FAQs', categories: 'Categories',
};

function StatusBar({ locale, total, translated }: { locale: string; total: number; translated: number }) {
  const pct = total > 0 ? Math.round((translated / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-lg font-medium text-white">{LOCALE_LABELS[locale] || locale}</span>
          <span className="ml-2 text-sm text-white/40">{locale}</span>
        </div>
        <span className={`text-sm font-medium ${pct === 100 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
          {translated}/{total} ({pct}%)
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-[#D4AF37]'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-white/40">
        {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
          <span key={key} className="rounded bg-white/5 px-2 py-0.5">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExportImportPanel({ locale }: { locale: string }) {
  const [exportData, setExportData] = useState<TranslationExport | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await translationApi.exportLocale(locale);
      setExportData(data);
      toast.success(`Exported ${locale} translations`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!exportData) return;
    setImporting(true);
    try {
      const result = await translationApi.importLocale(locale, exportData);
      toast.success(`Imported ${result.updated} entries for ${locale}`);
      setExportData(null);
    } catch {
      toast.error('Import failed — CMS_API_TOKEN may be missing');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="mb-3 font-medium text-white">{LOCALE_LABELS[locale] || locale} ({locale})</h3>
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export'}
        </button>
        {exportData && (
          <>
            <button
              onClick={handleImport}
              disabled={importing}
              className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#C49A2F] disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `translations-${locale}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/5"
            >
              Download
            </button>
          </>
        )}
      </div>
      {exportData && (
        <p className="mt-3 text-xs text-white/40">
          {Object.keys(exportData.contentTypes).length} content types,{' '}
          {Object.values(exportData.contentTypes).reduce((sum, arr) => sum + arr.length, 0)} entries exported
        </p>
      )}
    </div>
  );
}

export default function TranslationsPage() {
  const [statuses, setStatuses] = useState<TranslationStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await translationApi.getStatus();
      setStatuses(data);
    } catch {
      toast.error('Failed to load translation status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalTranslated = statuses.reduce((sum, s) => sum + s.translated, 0);
  const totalEntries = statuses.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Translation Workflow</h1>
        <p className="mt-1 text-sm text-white/40">
          {loading ? 'Loading...' : `${totalTranslated}/${totalEntries} translations across ${statuses.length} locales`}
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#D4AF37]" />
        </div>
      )}

      {!loading && (
        <>
          <div className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-white/60 uppercase tracking-wider">Translation Coverage</h2>
            <div className="space-y-3">
              {statuses.map((s) => (
                <StatusBar key={s.locale} locale={s.locale} total={s.total} translated={s.translated} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-medium text-white/60 uppercase tracking-wider">Export / Import</h2>
            <div className="space-y-3">
              {statuses.map((s) => (
                <ExportImportPanel key={s.locale} locale={s.locale} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
