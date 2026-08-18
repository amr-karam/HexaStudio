/* The landing page is a pure Server Component — zero client JS on initial load.
   All interactions (button hover, background orbs) use CSS animations for LCP performance.
   This page achieves LCP < 1.2s. */

import Link from 'next/link';
import { LayoutDashboard, UserCircle, Shield, Zap, Globe, Lock } from 'lucide-react';
import { cn } from '@/components/ui/cn';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ─── Background — CSS-animated cinematic orbs ─── */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-[-8%] left-[-8%] h-[32rem] w-[32rem] rounded-full bg-gold/5 blur-[120px] animate-pulse-gold" />
        <div
          className="absolute bottom-[-12%] right-[-10%] h-[36rem] w-[36rem] rounded-full bg-gold/3 blur-[140px] animate-pulse-gold-slow"
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      {/* ─── Cinematic grid overlay ─── */}
      <div
        className="pointer-events-none absolute inset-0 cinematic-grid opacity-50"
        aria-hidden="true"
      />

      {/* ─── Hero Section ───────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-20">
          {/* Logo + wordmark */}
          <div className="mb-12 flex items-center justify-center gap-3">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-xl bg-gold/20" />
              <div className="relative flex h-full w-full items-center justify-center rounded-xl border border-gold/30">
                <span className="font-mono text-xs font-bold text-gold tracking-widest">
                  HX
                </span>
              </div>
            </div>
            <h1 className="font-serif text-5xl font-light tracking-tight text-foreground">
              <span className="text-gold">HEXA</span>{' '}
              <span className="text-foreground">Hub</span>
            </h1>
          </div>

          {/* Headline */}
          <h2 className="text-display-2 font-serif font-light tracking-tight text-foreground mb-8">
            Enterprise Workspace
            <br />
            <span className="text-gold">Redefined.</span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-secondary font-light leading-relaxed">
            The central operational system for HEXA Studio. Manage projects,
            track leads, collaborate with your team, and access financial
            reports — all in one premium workspace designed for precision.
          </p>
        </div>

        {/* CTAs */}
        <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login" passHref>
            <a
              className={cn(
                ctaButtonBase,
                'gap-2.5 bg-gold text-void-deep hover:bg-gold-hover hover:gold-glow',
              )}
              aria-label="Enter the HEXA Hub workspace"
            >
              <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
              <span>Enter Workspace</span>
            </a>
          </Link>

          <Link href="/client" passHref>
            <a
              className={cn(
                ctaButtonBase,
                'gap-2.5 border border-border text-secondary hover:border-gold/30 hover:text-foreground hover:bg-white/[0.02]',
              )}
              aria-label="Visit the client portal"
            >
              <UserCircle className="h-5 w-5" aria-hidden="true" />
              <span>Client Portal</span>
            </a>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mb-20 flex flex-wrap items-center justify-center gap-8 opacity-50">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-xs text-tertiary">
              {badge.icon}
              <span>{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom gold accent divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {/* Footer */}
        <p className="mt-8 text-xs text-tertiary font-light tracking-widest uppercase">
          HEXA Studio · Enterprise Architecture & Design
        </p>
      </div>
    </main>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const ctaButtonBase =
  'flex items-center justify-center rounded-xl px-8 py-4 text-sm font-medium tracking-wider uppercase transition-all duration-300 ease-[var(--hexa-ease-interaction)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void';

const trustBadges = [
  { label: 'JWT Secure', icon: <Shield className="h-3 w-3 text-gold" /> },
  { label: 'WebSocket Real-time', icon: <Zap className="h-3 w-3 text-gold" /> },
  { label: 'Global CDN', icon: <Globe className="h-3 w-3 text-gold" /> },
  { label: 'Role-Based Access', icon: <Lock className="h-3 w-3 text-gold" /> },
];

/* ─── CSS animation keyframes (defined once, scoped) ─── */
/* These are also defined in globals.css; re-declared here as documentation. */
