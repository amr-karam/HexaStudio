'use client';

/**
 * HEXA Portal v3.0 — Framer Publish Surface
 *
 * Server-safe publish button that hits /api/framer (Next.js route) which proxies
 * to the backend FramerController. The Framer API key never leaves the server.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeLift } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { Icon } from './PortalIcons';

interface FramerPublishPanelProps {
  defaultSiteId?: string;
  className?: string;
}

interface PublishResponse {
  ok?: boolean;
  publishedAt?: string;
  url?: string;
  error?: string;
  details?: unknown;
}

interface StatusResponse {
  keyPresent: boolean;
  source: string;
}

export function FramerPublishPanel({ defaultSiteId = '', className }: FramerPublishPanelProps) {
  const reduced = useReducedMotion();
  const [siteId, setSiteId] = useState<string>(defaultSiteId);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [lastResult, setLastResult] = useState<PublishResponse | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const checkStatus = async (): Promise<void> => {
    setBusy(true);
    setLastResult(null);
    try {
      const res = await fetch('/api/framer', { method: 'GET' });
      const data = (await res.json()) as StatusResponse;
      setStatus(data);
    } catch (err) {
      setLastResult({ error: 'Status check failed', details: String(err) });
    } finally {
      setBusy(false);
    }
  };

  const publish = async (): Promise<void> => {
    if (!siteId.trim()) {
      setLastResult({ error: 'siteId is required' });
      return;
    }
    setBusy(true);
    setLastResult(null);
    try {
      const res = await fetch('/api/framer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId }),
      });
      const data = (await res.json()) as PublishResponse;
      setLastResult(data);
    } catch (err) {
      setLastResult({ error: 'Publish failed', details: String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      variants={fadeLift}
      custom={reduced}
      initial="hidden"
      animate="visible"
      className={cn(
        'artisan-glass artisan-specular-top relative overflow-hidden rounded-2xl p-6',
        'border border-sl-silver/20',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.4em] text-sl-gold-hover/70">
            Framer · Publish
          </p>
          <h2 className="mt-2 font-serif text-xl font-light text-sl-alabaster">
            Publish to <em className="text-gradient-gold font-normal italic">Framer</em>
          </h2>
          <p className="mt-2 text-xs text-sl-mist/60">
            Triggers a server-side publish via the framer.com API. Key never leaves the backend.
          </p>
        </div>
        <button
          type="button"
          onClick={checkStatus}
          disabled={busy}
          className={cn(
            'rounded-lg border border-sl-silver/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]',
            'text-sl-mist/60 hover:text-sl-gold-hover',
            'transition-colors duration-300',
            'disabled:opacity-50',
          )}
        >
          {busy ? 'Checking…' : 'Check status'}
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          placeholder="framer site id (e.g. abc123)"
          aria-label="Framer site id"
          className={cn(
            'flex-1 rounded-xl border border-sl-silver/20 bg-sl-void px-4 py-2.5',
            'text-sm text-sl-alabaster placeholder:text-sl-mist/40',
            'focus:border-sl-gold-subtle/40 focus:outline-none',
            'transition-colors',
          )}
        />
        <button
          type="button"
          onClick={publish}
          disabled={busy || !siteId.trim()}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5',
            'bg-gradient-to-r from-sl-gold-subtle to-sl-gold-subtle-bright text-sl-void',
            'font-mono text-[10px] uppercase tracking-[0.2em] font-semibold',
            'shadow-lg shadow-sl-gold-subtle/20',
            'hover:from-sl-gold-subtle-bright hover:to-sl-gold-subtle',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-300',
          )}
        >
          <Icon name="send" className="h-4 w-4" />
          {busy ? 'Publishing…' : 'Publish'}
        </button>
      </div>

      {status && (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-sl-mist/60">
          Source: <span className="text-sl-gold-hover">{status.source}</span> · Key present:{' '}
          <span className={status.keyPresent ? 'text-emerald-500' : 'text-red-500'}>
            {status.keyPresent ? 'yes' : 'no'}
          </span>
        </p>
      )}

      {lastResult && (
        <pre
          role="status"
          className="mt-4 max-h-48 overflow-auto rounded-lg border border-sl-silver/20 bg-sl-void/80 p-3 font-mono text-[10px] text-sl-mist/80"
        >
          {JSON.stringify(lastResult, null, 2)}
        </pre>
      )}
    </motion.div>
  );
}
