'use client';

import { useState, useCallback, useRef } from 'react';

export type CopyStatus = 'idle' | 'copied' | 'error';

export interface UseCopyToClipboardResult {
  /** Current copy status: idle, copied, or error. */
  status: CopyStatus;
  /** Whether a copy operation is in progress. */
  isCopying: boolean;
  /** Attempts to copy `text` to the clipboard. Returns true on success. */
  copy: (text: string) => Promise<boolean>;
  /** Resets the status back to 'idle'. */
  reset: () => void;
}

/**
 * A `navigator.clipboard.writeText` wrapper that tracks copy state and
 * provides a timeout-based reset (the UI can show a "copied!" confirmation
 * then revert to idle).
 *
 * Falls back to the legacy `document.execCommand('copy')` approach when
 * `navigator.clipboard` is unavailable (e.g. non-secure contexts).
 *
 * @param resetDelay  How long (ms) the status stays "copied" before
 *                    reverting to "idle". Pass `0` to disable auto-reset.
 *
 * @example
 * const { status, copy } = useCopyToClipboard(1500);
 * status === 'copied' && showToast('Copied!');
 */
export function useCopyToClipboard(resetDelay: number = 1500): UseCopyToClipboardResult {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const [isCopying, setIsCopying] = useState(false);

  // Keep the latest resetDelay in a ref so the callback doesn't need it as a dep.
  const resetDelayRef = useRef(resetDelay);
  resetDelayRef.current = resetDelay;

  const reset = useCallback(() => {
    setStatus('idle');
  }, []);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (isCopying) return false;

    setIsCopying(true);
    setStatus('idle');

    try {
      if (typeof navigator?.clipboard?.writeText === 'function') {
        await navigator.clipboard.writeText(text);
      } else {
        // Legacy fallback: create a temporary textarea and exec copy.
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!successful) throw new Error('execCommand returned false');
      }

      setStatus('copied');

      if (resetDelayRef.current > 0) {
        setTimeout(() => setStatus('idle'), resetDelayRef.current);
      }

      return true;
    } catch {
      setStatus('error');
      return false;
    } finally {
      setIsCopying(false);
    }
  }, [isCopying]);

  return { status, isCopying, copy, reset };
}
