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
    <>
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 md:px-12 pt-24">
        <div className="max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 mb-6 block"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground mb-8"
          >
            Let's Create
            <br />
            <span className="italic text-accent">Something Extraordinary</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="mx-auto max-w-2xl text-base text-neutral-400 font-light leading-relaxed"
          >
            Have a project in mind? We'd love to hear about it. Fill out the form below
            and we'll get back to you within 24 hours.
          </motion.p>
        </div>
      </section>

      <section className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-2xl mx-auto">
          {status === 'sent' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
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
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-10"
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
                  className="w-full bg-transparent border-b border-border py-2.5 px-0 text-sm transition-all duration-300 outline-none focus:border-accent text-foreground placeholder:text-neutral-600 resize-none"
                />
                {errors.message && (
                  <span className="text-[10px] text-red-500">{errors.message}</span>
                )}
              </div>
              {status === 'error' && (
                <p className="text-[10px] text-red-500 text-center">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-24 pt-16 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-3">
                Email
              </p>
              <a
                href="mailto:hello@hexastudio.net"
                className="text-sm text-foreground hover:text-accent transition-colors"
              >
                hello@hexastudio.net
              </a>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-3">
                Location
              </p>
              <p className="text-sm text-foreground">
                London / Dubai
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-3">
                Social
              </p>
              <div className="flex gap-6">
                <a
                  href="#"
                  className="text-sm text-neutral-500 hover:text-accent transition-colors"
                >
                  IG
                </a>
                <a
                  href="#"
                  className="text-sm text-neutral-500 hover:text-accent transition-colors"
                >
                  LI
                </a>
                <a
                  href="#"
                  className="text-sm text-neutral-500 hover:text-accent transition-colors"
                >
                  BE
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
