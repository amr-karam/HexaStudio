'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useFinePointer } from '@/hooks/useFinePointer';

/**
 * DEVELOPMENT ONLY — Ungated animation diagnostic.
 *
 * Renders a visible test animation (bypasses all motion policy gates)
 * and logs the current animation policy state to the browser console.
 * This component is automatically stripped from production builds.
 */
export function AnimationDebug() {
  const policy = useMotionPolicy();
  const rawReducedMotion = useReducedMotion();
  const rawFinePointer = useFinePointer();
  const [gsapOk, setGsapOk] = useState<boolean | null>(null);
  const [lenisOk, setLenisOk] = useState<boolean | null>(null);

  useEffect(() => {
    // Log animation policy state to console
    console.group('🎬 HEXA Animation Debug');
    console.log('reducedMotion (raw):', rawReducedMotion);
    console.log('finePointer (raw):  ', rawFinePointer);
    console.log('animationsEnabled:  ', policy.animationsEnabled);
    console.log('staticMode:         ', policy.staticMode);
    console.log('paused (user):      ', policy.paused);
    console.log('reducedMotion (policy):', policy.reducedMotion);
    try {
      console.log('localStorage pause: ', localStorage.getItem('hexa:animations-paused'));
    } catch {
      console.log('localStorage:       unavailable');
    }
    console.log('matchMedia reduced: ', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    console.log('matchMedia pointer: ', window.matchMedia('(pointer: fine)').matches);
    console.groupEnd();

    // Test GSAP load
    void import('gsap').then(
      () => setGsapOk(true),
      () => setGsapOk(false),
    );

    // Test if Lenis is available
    void import('lenis').then(
      () => setLenisOk(true),
      () => setLenisOk(false),
    );
  }, [rawReducedMotion, rawFinePointer, policy]);

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-[9999] rounded-lg border border-white/10 bg-black/80 p-3 text-[11px] font-mono text-white/70 backdrop-blur-xl shadow-2xl"
      aria-hidden="true"
    >
      <div className="mb-2 flex items-center gap-2">
        {/* Diagnostic pulsing dot — bypasses all gates */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-2.5 w-2.5 rounded-full bg-green-400"
        />
        <span className="text-white/80 font-semibold">Anim Debug</span>
      </div>

      <div className="space-y-0.5">
        <DiagnosticRow label="framer-motion" ok />
        <DiagnosticRow label="GSAP" ok={gsapOk} unknown={gsapOk === null} />
        <DiagnosticRow label="Lenis" ok={lenisOk} unknown={lenisOk === null} />
        <DiagnosticRow label="reduced motion" ok={!rawReducedMotion} warn />
        <DiagnosticRow label="fine pointer" ok={rawFinePointer} warn />
        <DiagnosticRow label="anim. enabled" ok={policy.animationsEnabled} warn />
        <DiagnosticRow label="paused" ok={!policy.paused} warn />
      </div>
    </div>
  );
}

function DiagnosticRow({
  label,
  ok,
  unknown,
  warn,
}: {
  label: string;
  ok: boolean | null;
  unknown?: boolean;
  warn?: boolean;
}) {
  const color =
    unknown ? 'text-yellow-400' :
    ok ? 'text-green-400' :
    warn ? 'text-amber-400' :
    'text-red-400';

  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className={color}>
        {unknown ? '⏳' : ok ? '✅' : warn ? '⚠️' : '❌'}
      </span>
    </div>
  );
}
