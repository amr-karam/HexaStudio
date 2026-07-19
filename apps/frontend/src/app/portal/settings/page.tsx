'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { useLocale } from '@/i18n/LocaleProvider';
import { TextReveal } from '@/components/ui/TextReveal';
import { ToggleSwitch } from '@/features/portal/ToggleSwitch';
import { CurrencySelector, useCurrencyStore } from '@/features/currency';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/constants';

const STORAGE_KEY = 'portal_notification_prefs';

export interface NotificationPreferences {
  projectUpdates: boolean;
  phaseApprovals: boolean;
  newAnnotations: boolean;
  documentUploads: boolean;
  milestoneCompletions: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  projectUpdates: true,
  phaseApprovals: true,
  newAnnotations: true,
  documentUploads: true,
  milestoneCompletions: true,
};

const PREF_ITEMS: Array<{
  key: keyof NotificationPreferences;
  labelKey: string;
  descKey: string;
}> = [
  {
    key: 'projectUpdates',
    labelKey: 'portal.settings.projectUpdates',
    descKey: 'portal.settings.projectUpdatesDesc',
  },
  {
    key: 'phaseApprovals',
    labelKey: 'portal.settings.phaseApprovals',
    descKey: 'portal.settings.phaseApprovalsDesc',
  },
  {
    key: 'newAnnotations',
    labelKey: 'portal.settings.newAnnotations',
    descKey: 'portal.settings.newAnnotationsDesc',
  },
  {
    key: 'documentUploads',
    labelKey: 'portal.settings.documentUploads',
    descKey: 'portal.settings.documentUploadsDesc',
  },
  {
    key: 'milestoneCompletions',
    labelKey: 'portal.settings.milestoneCompletions',
    descKey: 'portal.settings.milestoneCompletionsDesc',
  },
];

function loadPrefs(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<NotificationPreferences>;
      return { ...DEFAULT_PREFS, ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_PREFS;
}

async function syncToBackend(prefs: NotificationPreferences, userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/portal/notifications/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, preferences: prefs }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Small inline component showing the active currency info in settings. */
function CurrencyInfo() {
  const selectedCurrency = useCurrencyStore((s) => s.selectedCurrency);
  const availableCurrencies = useCurrencyStore((s) => s.availableCurrencies);
  const isLoading = useCurrencyStore((s) => s.isLoading);
  const { t, locale } = useLocale();

  const current = selectedCurrency
    ? availableCurrencies.find((c) => c.code === selectedCurrency)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-3 h-3 rounded-full border-2 border-accent/30 border-t-accent shrink-0"
        />
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
          {t('portal.settings.loadingCurrency') || 'Loading...'}
        </span>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-neutral-600 shrink-0" />
        <span className="text-[10px] font-mono text-neutral-500">
          {t('portal.settings.autoDetectActive') || 'Auto-detected from locale'}:{' '}
          <span className="text-neutral-400">{locale?.toUpperCase()}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-500">
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
        {t('portal.settings.activeCurrency') || 'Active'}:{' '}
        <span className="text-accent font-medium">
          {current.symbol} {current.code}
        </span>
      </span>
      <span className="w-px h-3 bg-border/30" />
      <span>
        {current.name}
        {current.region ? ` · ${current.region}` : ''}
      </span>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-xs uppercase tracking-[0.5em] text-neutral-500 font-mono"
      >
        Loading...
      </motion.div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLocale();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');

  // Load prefs from localStorage on mount
  useEffect(() => {
    setPrefs(loadPrefs());
    setIsLoaded(true);
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Storage full or unavailable
    }
  }, [prefs, isLoaded]);

  const handleToggle = useCallback(
    (key: keyof NotificationPreferences) => {
      setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [],
  );

  // Sync to backend debounced
  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    setSyncStatus('syncing');

    const timer = setTimeout(async () => {
      const success = await syncToBackend(prefs, user.id);
      if (success) {
        setSyncStatus('saved');
        toast.success(t('portal.settings.saved'), { id: 'prefs-sync' });
      } else {
        setSyncStatus('error');
        toast.error(t('portal.settings.saveFailed'), { id: 'prefs-sync' });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [prefs, isLoaded, user?.id, t]);

  if (authLoading || !isLoaded) {
    return <PageSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-neutral-500 text-xs uppercase tracking-widest font-mono">
          {t('portal.authRequired')}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-8 md:px-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            {t('portal.settings.title')}
          </motion.span>
          <div className="text-4xl md:text-6xl font-serif font-light text-foreground leading-tight">
            <TextReveal delay={0.1}>
              {t('portal.settings.title')}
            </TextReveal>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-sm text-neutral-500 font-light leading-relaxed"
          >
            {t('portal.settings.subtitle')}
          </motion.p>
        </header>

        {/* Notification Toggles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border/50 rounded-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-border/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent/60" />
              <h2 className="text-base font-medium text-foreground tracking-wide">
                {t('portal.settings.emailNotifications')}
              </h2>
            </div>
          </div>
          <div className="divide-y divide-border/10">
            {PREF_ITEMS.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ToggleSwitch
                  label={t(item.labelKey)}
                  description={t(item.descKey)}
                  checked={prefs[item.key]}
                  onChange={() => handleToggle(item.key)}
                  name={item.key}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Currency & Regional Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border/50 rounded-sm overflow-hidden mt-8"
        >
          <div className="px-6 py-5 border-b border-border/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent/60" />
              <h2 className="text-base font-medium text-foreground tracking-wide">
                {t('portal.settings.currency') || 'Currency & Regional'}
              </h2>
            </div>
          </div>
          <div className="px-6 py-6 bg-background border border-border/30 rounded-sm m-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {t('portal.settings.preferredCurrency') || 'Preferred Currency'}
                </span>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
                  {t('portal.settings.currencyDesc') || 'Choose your preferred currency for pricing and invoice display. Auto-detects from your region.'}
                </p>
              </div>
              <CurrencySelector />
            </div>
            <div className="mt-4 pt-4 border-t border-border/10">
              <CurrencyInfo />
            </div>
          </div>
        </motion.section>

        {/* Sync status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex items-center justify-end gap-2"
        >
          {syncStatus === 'syncing' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-3 h-3 rounded-full border-2 border-accent/30 border-t-accent"
              />
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
                Syncing...
              </span>
            </>
          )}
          {syncStatus === 'saved' && (
            <>
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-mono">
                {t('portal.settings.saved')}
              </span>
            </>
          )}
          {syncStatus === 'error' && (
            <>
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="text-[10px] uppercase tracking-widest text-red-400/80 font-mono">
                {t('portal.settings.saveFailed')}
              </span>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
