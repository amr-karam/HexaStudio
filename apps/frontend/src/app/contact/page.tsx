'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/inputs/Input';
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
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-8 overflow-hidden">
        <div className="max-w-5xl text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'var(--ease-out-expo)' }}
            className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-8 block"
          >
            Inquiry
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'var(--ease-out-expo)' }}
            className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-foreground mb-12 leading-[0.9]"
          >
            Let's Create <br />
            <span className="italic text-accent">Something Extraordinary</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'var(--ease-out-expo)' }}
            className="mx-auto max-w-2xl text-lg text-neutral-400 font-light leading-relaxed"
          >
            Have a project in mind? We'd love to hear about it. Fill out the form below
            and we'll get back to you within 24 hours.
          </motion.p>
        </div>
      </section>

      {/* Contact Interface */}
      <section className="px-8 md:px-16 py-32">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          
          {/* Left: Information */}
          <div className="flex flex-col justify-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'var(--ease-out-expo)' }}
              className="flex flex-col gap-8"
            >
              <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500">
                Reach Out
              </span>
              <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight text-foreground leading-tight">
                Open for <br />
                <span className="italic text-accent">New Collaborations</span>
              </h2>
              <p className="text-neutral-400 font-light text-lg leading-relaxed max-w-md">
                We partner with architects and developers who push the boundaries of design. 
                Whether it's a residential masterpiece or a commercial landmark, we bring 
                technical precision to your creative vision.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                  Email
                </span>
                <a
                  href="mailto:hello@hexastudio.net"
                  className="text-sm text-foreground hover:text-accent transition-colors duration-500"
                >
                  hello@hexastudio.net
                </a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                  Location
                </span>
                <p className="text-sm text-foreground font-light">
                  London / Dubai
                </p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-surface p-8 md:p-16 border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] pointer-events-none" />
            
            {status === 'sent' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-24"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-4 block">
                  Message Sent
                </span>
                <h2 className="text-3xl font-serif font-light text-foreground mb-4">
                  Thank You
                </h2>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  We have received your message and will be in touch within 24 hours.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'var(--ease-out-expo)' }}
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-10 relative z-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Input
                    label="Name"
                    placeholder="Your name"
                    value={formState.name}
                    onChange={(e) => {
                      setFormState({ ...formState, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    value={formState.email}
                    onChange={(e) => {
                      setFormState({ ...formState, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    error={errors.email}
                    required
                  />
                </div>
                <Input
                  label="Company"
                  placeholder="Company (optional)"
                  value={formState.company}
                  onChange={(e) =>
                    setFormState({ ...formState, company: e.target.value })
                  }
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                    Message
                  </label>
                  <textarea
                    placeholder="Tell us about your project..."
                    value={formState.message}
                    onChange={(e) => {
                      setFormState({ ...formState, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    required
                    rows={5}
                    className="w-full bg-transparent border-b border-border py-2.5 px-0 text-sm transition-all duration-500 outline-none focus:border-accent text-foreground placeholder:text-neutral-600 resize-none"
                  />
                  {errors.message && (
                    <span className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.message}</span>
                  )}
                </div>
                {status === 'error' && (
                  <p className="text-[10px] text-red-500 text-center uppercase tracking-widest">
                    Failed to send. Please try again.
                  </p>
                )}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={status === 'sending'}
                  >
                    Send Message
                  </Button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </section>

      {/* Social Footer */}
      <section className="px-8 md:px-16 py-24 border-t border-border/50">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="h-3 w-3 bg-accent" />
            <span className="text-xs uppercase tracking-[0.4em] text-foreground font-medium">
              HexaStudio
            </span>
          </div>
          <div className="flex gap-12">
            {['Instagram', 'LinkedIn', 'Behance'].map((platform) => (
              <a
                key={platform}
                href="#"
                className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-accent transition-colors duration-500"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
