'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';


const ConfettiBurst = dynamic(
  () => import('@/components/effects/ConfettiBurst').then((m) => ({ default: m.ConfettiBurst })),
  { ssr: false },
);

export default function FlowdeckClient() {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '').trim();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-sl-void text-sl-alabaster">
      <ConfettiBurst trigger={submitted} />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(212,175,55,0.12) 0%, transparent 45%), radial-gradient(circle at 70% 70%, rgba(10,10,11,0.85) 0%, var(--sl-void) 60%)',
        }}
      />
      <section className="relative z-10 w-full max-w-xl mx-auto px-4 py-20 md:px-6 md:py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight">
          Flow<span className="italic text-sl-gold-hover">deck</span>
        </h1>
        <p className="mt-6 text-base md:text-lg font-light leading-relaxed text-sl-mist/70">
          A calmer way to plan, ship, and review work. Coming soon.
        </p>
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 text-center"
          >
            <p className="text-xl font-light text-sl-alabaster">You are on the waitlist!</p>
            <p className="mt-2 text-sm text-sl-mist/60">We will email you when we launch.</p>
          </motion.div>
        ) : (
          <form
            ref={formRef}
            className="mt-10 flex flex-col sm:flex-row gap-3"
            onSubmit={handleSubmit}
          >
            <label htmlFor="flowdeck-email" className="sr-only">Email address</label>
            <input
              id="flowdeck-email"
              required
              name="email"
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1 rounded-xl border border-sl-silver/20 bg-sl-obsidian/60 px-4 py-3 text-base text-sl-alabaster placeholder:text-sl-mist/50 focus:border-sl-gold-subtle/60 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Join waitlist"
              className="rounded-xl border border-sl-gold-subtle/30 px-5 py-3 text-sm uppercase tracking-[0.2em] text-sl-alabaster hover:bg-sl-gold-subtle/10 transition-colors"
            >
              Join waitlist
            </button>
          </form>
        )}
        <p className="mt-8 text-xs text-sl-mist/50">
          No spam. Unsubscribe anytime.
        </p>
        <Link
          href="/"
          className="inline-block mt-10 text-xs uppercase tracking-[0.25em] text-sl-mist/60 hover:text-sl-alabaster transition-colors"
        >
          Back to HexaStudio
        </Link>
      </section>
    </main>
  );
}
