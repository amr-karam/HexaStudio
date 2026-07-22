'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { EASING, DUR } from '@/lib/motion/tokens';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';

type CurtainPhase = 'idle' | 'cover' | 'reveal';

/**
 * Curtain leg durations: cover 0.4s + reveal 0.4s = 0.8s total envelope,
 * inside the 600–800ms cinematic window (see src/lib/motion/tokens.ts).
 */
const COVER_DURATION = DUR.ui;
const REVEAL_DURATION = DUR.ui;

/**
 * Hard limits so a failed or interrupted navigation can never trap the user
 * behind the curtain. Transitions are an enhancement — never a blocker.
 */
const NAV_PUSH_TIMEOUT_MS = 900;
const REVEAL_TIMEOUT_MS = 1500;

/**
 * PageTransition — gold-on-obsidian route-change curtain.
 *
 * Choreography:
 * 1. Internal link clicks are intercepted (capture phase): the obsidian
 *    curtain rises from the bottom with a gold leading edge (`cover`).
 * 2. Once covered, `router.push` fires; on the pathname commit the curtain
 *    lifts upward, revealing the new page (`reveal`).
 * 3. Browser back/forward (popstate) never intercepts — the curtain renders
 *    over the fresh page in the same commit (no flash) and lifts immediately.
 *
 * Contract:
 * - Never blocks navigation: safety timeouts force push/reveal if any
 *   animation callback is dropped; `router.push` failure falls back to a
 *   native location change.
 * - Never freezes the React tree: children are not remounted or keyed on
 *   pathname; only the fixed-position curtain animates.
 * - Reduced motion: no interception, no curtain — instant content swap.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { reduced } = useHEXAMotion();
  const [phase, setPhase] = useState<CurtainPhase>('idle');
  const [lastPathname, setLastPathname] = useState(pathname);
  const pendingHref = useRef<string | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSafety = useCallback(() => {
    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }, []);

  const finishReveal = useCallback(() => {
    clearSafety();
    pendingHref.current = null;
    setPhase('idle');
  }, [clearSafety]);

  const pushPending = useCallback(() => {
    const href = pendingHref.current;
    pendingHref.current = null;
    if (!href) return;
    try {
      router.push(href);
    } catch {
      window.location.assign(href);
    }
  }, [router]);

  // Derived-state-during-render: when the pathname commits, the curtain must
  // cover/reveal in the SAME paint as the new page — a post-paint effect
  // would flash unstyled content for one frame.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (!reduced) {
      clearSafety();
      setPhase('reveal');
    }
  }

  // Intercept internal link clicks to choreograph the cover before push.
  useEffect(() => {
    if (reduced) return;

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const rawHref = anchor.getAttribute('href');
      // Same-page anchors stay with Lenis / native hash scrolling.
      if (!rawHref || rawHref.startsWith('#')) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const targetPath = url.pathname + url.search;
      const currentPath = window.location.pathname + window.location.search;
      if (targetPath === currentPath) return; // same page (incl. hash-only)

      event.preventDefault();
      pendingHref.current = url.pathname + url.search + url.hash;
      setPhase('cover');

      // If the cover animation is ever interrupted, navigate anyway.
      clearSafety();
      safetyTimer.current = setTimeout(pushPending, NAV_PUSH_TIMEOUT_MS);
    };

    // Capture phase: runs before Next.js Link handlers, which respect
    // `defaultPrevented` and therefore stay out of the way.
    document.addEventListener('click', onDocumentClick, true);
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, [reduced, clearSafety, pushPending]);

  const handleCoverComplete = useCallback(() => {
    clearSafety();
    pushPending();
    // If the route never commits (failed navigation), lift the curtain anyway.
    safetyTimer.current = setTimeout(() => setPhase('reveal'), REVEAL_TIMEOUT_MS);
  }, [clearSafety, pushPending]);

  // Scroll to top on route change — Lenis-aware, instant (the swap is hidden
  // behind the curtain; native `scroll-behavior: smooth` would fight Lenis).
  const isInitialPath = useRef(true);
  useEffect(() => {
    if (isInitialPath.current) {
      isInitialPath.current = false;
      return;
    }
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname]);

  // Route focus management: move focus to main content after the transition.
  useEffect(() => {
    const delay = reduced ? 50 : (COVER_DURATION + REVEAL_DURATION) * 1000 + 100;
    const timeout = setTimeout(() => {
      const mainEl = document.getElementById('main-content');
      if (mainEl) {
        mainEl.focus({ preventScroll: true });
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [pathname, reduced]);

  // Cleanup any dangling safety timer on unmount.
  useEffect(() => clearSafety, [clearSafety]);

  const isCovering = phase === 'cover';

  return (
    <>
      {/* Gold-on-obsidian curtain — fixed overlay, zero layout impact */}
      <AnimatePresence>
        {!reduced && phase !== 'idle' && (
          <motion.div
            key={phase}
            initial={{ y: isCovering ? '100%' : '0%' }}
            animate={{ y: isCovering ? '0%' : '-100%' }}
            transition={{
              duration: isCovering ? COVER_DURATION : REVEAL_DURATION,
              ease: EASING.easeInOutQuint,
            }}
            onAnimationComplete={isCovering ? handleCoverComplete : finishReveal}
            className="fixed inset-0 z-[9998] bg-background"
            style={{
              pointerEvents: isCovering ? 'auto' : 'none',
              willChange: 'transform',
            }}
            aria-hidden="true"
          >
            {/* Gold leading edge — top while covering, bottom while lifting */}
            <span
              className={`absolute inset-x-0 h-[2px] bg-accent ${isCovering ? 'top-0' : 'bottom-0'}`}
            />
            {/* Brand mark — only while covering */}
            {isCovering && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: DUR.micro, delay: 0.15 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.5em] text-accent"
              >
                HexaStudio
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content — never remounted, never frozen */}
      <div>{children}</div>
    </>
  );
}
