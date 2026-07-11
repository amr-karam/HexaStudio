'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/inputs/Input';
import { TextReveal } from '@/components/ui/TextReveal';
import { isValidEmail } from '@hexastudio/utils';

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api';
      const res = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      if (!res.ok) throw new Error('Failed to send');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <section className="relative flex min-h-screen flex-col items-center justify-center px-8 overflow-hidden">
        <div className="text-center relative z-10 mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            Connect
          </motion.span>
          <TextReveal delay={0.1}>
            <h1 className="text-5xl md:text-8xl font-serif font-light tracking-tighter text-foreground leading-tight">
              Start the <span className="italic text-accent">Conversation.</span>
            </h1>
          </TextReveal>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl bg-surface/50 backdrop-blur-xl border border-border/50 p-8 md:p-12 rounded-sm shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Full Name"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <span className="text-[10px] text-red-500 uppercase tracking-widest">{errors.name}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <Input
                placeholder="Email Address"
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <span className="text-[10px] text-red-500 uppercase tracking-widest">{errors.email}</span>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Input
                placeholder="Company (Optional)"
                value={formState.company}
                onChange={(e) => setFormState({ ...formState, company: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <textarea
                placeholder="Tell us about your vision..."
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                className="w-full h-40 bg-background border border-border text-foreground p-4 rounded-sm focus:outline-none focus:border-accent transition-colors duration-300 resize-none font-light"
              />
              {errors.message && <span className="text-[10px] text-red-500 uppercase tracking-widest">{errors.message}</span>}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button 
                variant="primary" 
                size="lg" 
                disabled={status === 'sending'}
                className="min-w-[160px]"
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>

          <AnimatePresence>
            {status === 'sent' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface text-center p-8"
              >
                <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-20 0v-0.92" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 className="text-2xl font-serif font-light mb-4">Message Received</h2>
                <p className="text-neutral-400 font-light mb-8">
                  Thank you for reaching out. Our architects will review your vision and respond shortly.
                </p>
                <Button variant="outline" onClick={() => setStatus('idle')}>
                  Send Another
                </Button>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface text-center p-8"
              >
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-serif font-light mb-4">Transmission Failed</h2>
                <p className="text-neutral-400 font-light mb-8">
                  Our systems are experiencing a momentary glitch. Please try again in a few moments.
                </p>
                <Button variant="outline" onClick={() => setStatus('idle')}>
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none">
          <span className="text-xs uppercase tracking-widest text-neutral-600 font-mono">Back to top</span>
          <div className="h-12 w-[1px] bg-gradient-to-b from-neutral-600 to-transparent" />
        </div>
      </section>
    </div>
  );
}
