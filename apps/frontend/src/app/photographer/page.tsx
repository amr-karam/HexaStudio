'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import TextCharReveal from '@/components/effects/TextCharReveal';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const PHOTOS = [
  '/photographer/01.jpg',
  '/photographer/02.jpg',
  '/photographer/03.jpg',
  '/photographer/04.jpg',
  '/photographer/05.jpg',
  '/photographer/06.jpg',
];

export default function PhotographerPage() {
  const [form, setForm] = useState({ name: '', email: '', date: '', details: '' });
  const [sent, setSent] = useState(false);

  return (
    <main className="bg-white text-neutral-900 antialiased">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium uppercase tracking-[0.25em]">
            Mono
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#work" className="hover:text-neutral-500 transition-colors">Work</a>
            <a href="#about" className="hover:text-neutral-500 transition-colors">About</a>
            <a href="#inquiry" className="hover:text-neutral-500 transition-colors">Inquiry</a>
          </nav>
        </div>
      </header>

      <section id="work" className="pt-24">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-32">
          <h1 className="text-4xl md:text-7xl font-light tracking-tight">
            <TextCharReveal text="Selected" as="span" className="block" delay={0.05} />
            <TextCharReveal text="Frames" as="span" className="block mt-2" delay={0.2} />
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-neutral-600 leading-relaxed">
            A restrained body of work built from observation, texture, and natural light.
          </p>
        </div>
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {PHOTOS.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className={cn('relative aspect-[4/5] bg-neutral-100', i === 0 && 'md:col-span-2 md:aspect-[16/9]')}
            >
              <Image src={src} alt={`Photographer frame ${i + 1}`} fill className="object-cover" />
            </motion.div>
          ))}
        </div>
      </section>

      <section id="about" className="border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight">About</h2>
          </div>
          <div className="space-y-6 text-base md:text-lg text-neutral-600 leading-relaxed">
            <p>
              I work with light, stillness, and everyday subjects. The goal is not perfection, but honesty.
            </p>
            <p>
              Available for editorial, commercial, and personal commissions worldwide.
            </p>
          </div>
        </div>
      </section>

      <section id="inquiry" className="border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight">Inquiry</h2>
            <p className="mt-4 text-base text-neutral-600">
              Tell me about the project and I will reply within 24 hours.
            </p>
          </div>
          {sent ? (
            <div className="rounded-xl border border-neutral-200 p-6">
              <p className="text-lg font-light">Thank you. I will be in touch.</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <input required className="w-full rounded-lg border border-neutral-200 px-4 py-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" className="w-full rounded-lg border border-neutral-200 px-4 py-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="w-full rounded-lg border border-neutral-200 px-4 py-3" placeholder="Preferred date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <textarea className="w-full rounded-lg border border-neutral-200 px-4 py-3" placeholder="Project details" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
              <Button variant="primary" size="lg" className="w-full">Send inquiry</Button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <span>© {new Date().getFullYear()} Mono Photography</span>
          <Link href="/" className="hover:text-neutral-900 transition-colors">Back to HexaStudio</Link>
        </div>
      </footer>
    </main>
  );
}
