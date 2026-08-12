'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import TextCharReveal from '@/components/effects/TextCharReveal';
import { isValidEmail } from '@hexastudio/utils';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';
import { useServices } from '@/features/services/hooks/useServices';
import { FAQSection } from '@/features/faq/components/FAQSection';
import { API_BASE_URL } from '@/config/constants';

const SilkShaderBackground = dynamic(
  () => import('@/components/effects/SilkShaderBackground'),
  { ssr: false },
);

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    budget: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const { data: servicesData } = useServices();
  const serviceOptions = servicesData?.services ?? [];

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formState.name.trim()) errs.name = 'Name is required';
    if (!formState.email.trim()) errs.email = 'Email is required';
    else if (!isValidEmail(formState.email)) errs.email = 'Invalid email address';
    if (!formState.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formState),
      });
      if (!res.ok) throw new Error('Failed to send');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen overflow-hidden">
      <section className="relative flex min-h-screen flex-col items-center justify-center px-8 overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <SilkShaderBackground speed={0.3} opacity={0.12} />
          <div className="absolute inset-0 gradient-radial-gold" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
        </div>

        {/* Hero */}
        <div className="text-center relative z-10 mb-16">
          {/* Atelier eyebrow */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500">
              § 01 — Contact
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />
          </div>

          <h1 className="text-5xl md:text-8xl font-serif font-light tracking-tighter text-foreground leading-tight">
            <TextCharReveal text="Start the" delay={0.1} stagger={0.04} blur />
            <br />
            <span className="italic text-accent">
              <TextCharReveal text="Conversation." delay={0.5} stagger={0.04} blur />
            </span>
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {status !== 'sent' && status !== 'error' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }}
              className="relative z-10 w-full max-w-5xl"
            >
              <div className="artisan-glass artisan-specular-top rounded-2xl p-8 md:p-16 relative overflow-hidden">
                {/* Gold radial aura behind card */}
                <div
                  className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl pointer-events-none"
                  aria-hidden="true"
                />

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {/* Full Name */}
                  <div className="flex flex-col gap-2 group">
                    <label
                      htmlFor="contact-name"
                      className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500 group-focus-within:text-accent transition-colors duration-700"
                    >
                      Full Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="John Doe"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      className={cn(
                        'w-full bg-transparent border-b border-border/50 focus:border-accent/60 transition-all duration-700 rounded-none px-0 py-4 text-base font-light placeholder:text-neutral-600 focus:outline-none',
                        errors.name && 'border-red-500/60 focus:border-red-500',
                      )}
                    />
                    {errors.name && (
                      <span id="contact-name-error" role="alert" className="text-[0.5625rem] text-red-500 uppercase tracking-[0.2em] font-mono">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-2 group">
                    <label
                      htmlFor="contact-email"
                      className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500 group-focus-within:text-accent transition-colors duration-700"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="email@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      className={cn(
                        'w-full bg-transparent border-b border-border/50 focus:border-accent/60 transition-all duration-700 rounded-none px-0 py-4 text-base font-light placeholder:text-neutral-600 focus:outline-none',
                        errors.email && 'border-red-500/60 focus:border-red-500',
                      )}
                    />
                    {errors.email && (
                      <span id="contact-email-error" role="alert" className="text-[0.5625rem] text-red-500 uppercase tracking-[0.2em] font-mono">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Company (Optional) */}
                  <div className="flex flex-col gap-2 md:col-span-2 group">
                    <label
                      htmlFor="contact-company"
                      className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500 group-focus-within:text-accent transition-colors duration-700"
                    >
                      Company (Optional)
                    </label>
                    <input
                      id="contact-company"
                      type="text"
                      placeholder="Studio or Firm Name"
                      value={formState.company}
                      onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                      className="w-full bg-transparent border-b border-border/50 focus:border-accent/60 transition-all duration-700 rounded-none px-0 py-4 text-base font-light placeholder:text-neutral-600 focus:outline-none"
                    />
                  </div>

                  {/* Phone (Optional) */}
                  <div className="flex flex-col gap-2 group">
                    <label
                      htmlFor="contact-phone"
                      className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500 group-focus-within:text-accent transition-colors duration-700"
                    >
                      Phone (Optional)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full bg-transparent border-b border-border/50 focus:border-accent/60 transition-all duration-700 rounded-none px-0 py-4 text-base font-light placeholder:text-neutral-600 focus:outline-none"
                    />
                  </div>

                  {/* Service Type (Optional) */}
                  <div className="flex flex-col gap-2 group">
                    <label
                      htmlFor="contact-service"
                      className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500 group-focus-within:text-accent transition-colors duration-700"
                    >
                      Service Type (Optional)
                    </label>
                    <select
                      id="contact-service"
                      value={formState.service}
                      onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                      className="w-full bg-transparent border-b border-border/50 focus:border-accent/60 transition-all duration-700 rounded-none px-0 py-4 text-base font-light text-foreground placeholder:text-neutral-600 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-neutral-900">Select a service...</option>
                      {serviceOptions.map((s) => (
                        <option key={s.id} value={s.slug} className="bg-neutral-900">{s.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget Range (Optional) */}
                  <div className="flex flex-col gap-2 md:col-span-2 group">
                    <label
                      htmlFor="contact-budget"
                      className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500 group-focus-within:text-accent transition-colors duration-700"
                    >
                      Budget Range (Optional)
                    </label>
                    <select
                      id="contact-budget"
                      value={formState.budget}
                      onChange={(e) => setFormState({ ...formState, budget: e.target.value })}
                      className="w-full bg-transparent border-b border-border/50 focus:border-accent/60 transition-all duration-700 rounded-none px-0 py-4 text-base font-light text-foreground placeholder:text-neutral-600 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-neutral-900">Select a budget range...</option>
                      <option value="under_50k" className="bg-neutral-900">Under $50K</option>
                      <option value="50k_100k" className="bg-neutral-900">$50K – $100K</option>
                      <option value="100k_500k" className="bg-neutral-900">$100K – $500K</option>
                      <option value="500k_plus" className="bg-neutral-900">$500K+</option>
                    </select>
                  </div>

                  {/* Your Vision */}
                  <div className="flex flex-col gap-2 md:col-span-2 group">
                    <label
                      htmlFor="contact-message"
                      className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500 group-focus-within:text-accent transition-colors duration-700"
                    >
                      Your Vision
                    </label>
                    <textarea
                      id="contact-message"
                      placeholder="Tell us about your architectural goals..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      className={cn(
                        'w-full h-48 bg-transparent border-b border-border/50 focus:border-accent/60 transition-all duration-700 rounded-none px-0 py-4 text-base font-light placeholder:text-neutral-600 focus:outline-none resize-none leading-relaxed',
                        errors.message && 'border-red-500/60 focus:border-red-500',
                      )}
                    />
                    {errors.message && (
                      <span id="contact-message-error" role="alert" className="text-[0.5625rem] text-red-500 uppercase tracking-[0.2em] font-mono">
                        {errors.message}
                      </span>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="md:col-span-2 flex justify-end mt-8">
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={status === 'sending'}
                      className="min-w-[200px] group relative overflow-hidden active:scale-[0.97] transition-transform duration-150"
                    >
                      <span className="relative z-10">
                        {status === 'sending' ? 'Transmitting...' : 'Send Message'}
                      </span>
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15, mass: 0.8 }}
              className="relative z-10 w-full max-w-4xl text-center"
            >
              <div className="artisan-glass artisan-specular-top rounded-2xl p-12 relative overflow-hidden">
                {/* Gold radial aura behind card */}
                <div
                  className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-accent/5 blur-3xl pointer-events-none"
                  aria-hidden="true"
                />

                {/* Gold icon circle */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
                  className={cn(
                    'w-20 h-20 mx-auto rounded-full border flex items-center justify-center mb-8',
                    status === 'sent'
                      ? 'bg-accent/10 border-accent/20 text-accent'
                      : 'bg-red-500/10 border-red-500/20 text-red-500',
                  )}
                >
                  {status === 'sent' ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: EASE.entrance }}
                        d="M22 11.08V12a10 10 0 1 1-20 0v-0.92"
                      />
                      <motion.polyline
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.7, ease: EASE.entrance }}
                        points="22 4 12 14.01 9 11.01"
                      />
                    </svg>
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                  )}
                </motion.div>

                <h2 className="text-4xl font-serif font-light text-foreground mb-4">
                  {status === 'sent' ? 'Message Received' : 'Transmission Failed'}
                </h2>
                <p className="text-neutral-400 font-light mb-12 max-w-xl mx-auto leading-relaxed">
                  {status === 'sent'
                    ? 'Thank you for reaching out. Our architects will review your vision and respond shortly.'
                    : 'Our systems are experiencing a momentary glitch. Please try again in a few moments.'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setStatus('idle')}
                  className="active:scale-[0.97] transition-transform duration-150"
                >
                  {status === 'sent' ? 'Send Another' : 'Try Again'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Home */}
        <Link
          href="/"
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 group"
        >
          <span className="text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-600 font-mono group-hover:text-accent transition-colors duration-700">
            Back to Home
          </span>
          <div
            className="h-12 w-px bg-gradient-to-b from-neutral-600 to-transparent group-hover:from-accent transition-all duration-700"
            aria-hidden="true"
          />
        </Link>
      </section>

      <FAQSection />
    </div>
  );
}
