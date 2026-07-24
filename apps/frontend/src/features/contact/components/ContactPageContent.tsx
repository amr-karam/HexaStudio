'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/inputs/Input';
import TextCharReveal from '@/components/effects/TextCharReveal';
import { isValidEmail } from '@hexastudio/utils';
import { cn } from '@/lib/utils';
import { FAQSection } from '@/features/faq/components/FAQSection';
import { API_BASE_URL } from '@/config/constants';
import type { FAQ } from '@hexastudio/types';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface ContactPageContentProps {
  faqs: FAQ[];
}

export function ContactPageContent({ faqs }: ContactPageContentProps) {
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 gradient-radial-gold" aria-hidden="true" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
        </div>

        <div className="text-center relative z-10 mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            Connect
          </motion.span>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-5xl bg-surface/30 backdrop-blur-2xl border border-border/50 p-8 md:p-16 rounded-sm shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="flex flex-col gap-2 group">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 group-focus-within:text-accent transition-colors duration-500">Full Name</label>
                  <Input
                    placeholder="John Doe"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className={cn("bg-transparent border-b border-border focus:border-accent transition-all duration-500 rounded-none px-0", errors.name && "border-red-500")}
                  />
                  {errors.name && <span className="text-[9px] text-red-500 uppercase tracking-widest">{errors.name}</span>}
                </div>

                <div className="flex flex-col gap-2 group">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 group-focus-within:text-accent transition-colors duration-500">Email Address</label>
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className={cn("bg-transparent border-b border-border focus:border-accent transition-all duration-500 rounded-none px-0", errors.email && "border-red-500")}
                  />
                  {errors.email && <span className="text-[9px] text-red-500 uppercase tracking-widest">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-2 md:col-span-2 group">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 group-focus-within:text-accent transition-colors duration-500">Company (Optional)</label>
                  <Input
                    placeholder="Studio or Firm Name"
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    className="bg-transparent border-b border-border focus:border-accent transition-all duration-500 rounded-none px-0"
                  />
                </div>

                <div className="flex flex-col gap-2 group">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 group-focus-within:text-accent transition-colors duration-500">Phone (Optional)</label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="bg-transparent border-b border-border focus:border-accent transition-all duration-500 rounded-none px-0"
                  />
                </div>

                <div className="flex flex-col gap-2 group">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 group-focus-within:text-accent transition-colors duration-500">Service Type (Optional)</label>
                  <select
                    value={formState.service}
                    onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                    className="w-full bg-transparent border-b border-border text-foreground p-0 focus:outline-none focus:border-accent transition-colors duration-300 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-neutral-900">Select a service...</option>
                    <option value="residential" className="bg-neutral-900">Residential</option>
                    <option value="commercial" className="bg-neutral-900">Commercial</option>
                    <option value="interior" className="bg-neutral-900">Interior Design</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2 group">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 group-focus-within:text-accent transition-colors duration-500">Budget Range (Optional)</label>
                  <select
                    value={formState.budget}
                    onChange={(e) => setFormState({ ...formState, budget: e.target.value })}
                    className="w-full bg-transparent border-b border-border text-foreground p-0 focus:outline-none focus:border-accent transition-colors duration-300 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-neutral-900">Select a budget range...</option>
                    <option value="under_50k" className="bg-neutral-900">Under $50K</option>
                    <option value="50k_100k" className="bg-neutral-900">$50K - $100K</option>
                    <option value="100k_500k" className="bg-neutral-900">$100K - $500K</option>
                    <option value="500k_plus" className="bg-neutral-900">$500K+</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2 group">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 group-focus-within:text-accent transition-colors duration-500">Your Vision</label>
                  <textarea
                    placeholder="Tell us about your architectural goals..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full h-48 bg-transparent border-b border-border text-foreground p-0 focus:outline-none focus:border-accent transition-colors duration-300 resize-none font-light leading-relaxed"
                  />
                  {errors.message && <span className="text-[9px] text-red-500 uppercase tracking-widest">{errors.message}</span>}
                </div>

                <div className="md:col-span-2 flex justify-end mt-8">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    disabled={status === 'sending'}
                    className="min-w-[200px] group relative overflow-hidden"
                  >
                    <span className="relative z-10">
                      {status === 'sending' ? 'Transmitting...' : 'Send Message'}
                    </span>
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 w-full max-w-4xl text-center p-12 bg-surface/30 backdrop-blur-3xl border border-border/50 rounded-sm"
            >
              <div className={cn(
                "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-8 transition-colors duration-700",
                status === 'sent' ? "bg-accent/20 text-accent" : "bg-red-500/20 text-red-500"
              )}>
                {status === 'sent' ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-20 0v-0.92" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                )}
              </div>
              <h2 className="text-4xl font-serif font-light mb-4">
                {status === 'sent' ? 'Message Received' : 'Transmission Failed'}
              </h2>
              <p className="text-neutral-400 font-light mb-12 w-full max-w-3xl mx-auto leading-relaxed">
                {status === 'sent' 
                  ? 'Thank you for reaching out. Our architects will review your vision and respond shortly.' 
                  : 'Our systems are experiencing a momentary glitch. Please try again in a few moments.'}
              </p>
              <Button variant="outline" onClick={() => setStatus('idle')}>
                {status === 'sent' ? 'Send Another' : 'Try Again'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <Link href="/" className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 group">
          <span className="text-xs uppercase tracking-widest text-neutral-600 font-mono group-hover:text-accent transition-colors duration-500">Back to Home</span>
          <div className="h-12 w-[1px] bg-gradient-to-b from-neutral-600 to-transparent group-hover:from-accent transition-colors duration-500" />
        </Link>
      </section>

      <FAQSection faqs={faqs} />
    </div>
  );
}
