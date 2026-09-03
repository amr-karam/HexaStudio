'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';
import { RadialGlow } from '@/components/animation';
import { isValidEmail } from '@hexastudio/utils';
import { cn } from '@/lib/utils';
import { EASE, DURATION, STAGGER, fadeLift, staggerContainer } from '@/lib/motion';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useServices } from '@/features/services/hooks/useServices';
import { API_BASE_URL } from '@/config/constants';

const SilkShaderBackground = dynamic(
  () => import('@/components/effects/SilkShaderBackground'),
  { ssr: false },
);

interface FormErrors {
  name?: string | undefined;
  email?: string | undefined;
  message?: string | undefined;
}

interface ContactFormSectionProps {
  /** Optional heading + subtext. When omitted, the form renders minimal. */
  title?: string;
  subtitle?: string;
  /** Eyebrow label above the heading (matches site convention "§ 01 — …"). */
  eyebrow?: string;
  /** Fields to render. Defaults to ['name','email','message']. */
  fields?: ('name' | 'email' | 'message')[];
  /** Submit endpoint — defaults to the shared contact API. */
  action?: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

const FIELD_LABELS = {
  name: 'Full Name',
  email: 'Email Address',
  message: 'Your Vision',
} as const;

const FIELD_PLACEHOLDERS = {
  name: 'John Doe',
  email: 'email@example.com',
  message: 'Tell us about your project…',
} as const;

const FIELD_SIZES = {
  name: { rows: 1, multiline: false } as const,
  email: { rows: 1, multiline: false } as const,
  message: { rows: 6, multiline: true } as const,
} as const;

/** Transition shared by all AnimatePresence state swaps. */
const STATE_TRANSITION = {
  type: 'spring' as const,
  stiffness: 160,
  damping: 22,
  mass: 0.8,
};

export function ContactFormSection({
  title = 'Start a Conversation',
  subtitle,
  eyebrow,
  fields = ['name', 'email', 'message'],
  action,
  className,
}: ContactFormSectionProps) {
  const endpoint = action ?? `${API_BASE_URL}/api/contact`;
  const { staticMode } = useMotionPolicy();
  const { data: servicesData } = useServices();
  const serviceOptions = servicesData?.services ?? [];

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
    company: '',
    phone: '',
    service: '',
    budget: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (fields.includes('name') && !formState.name.trim()) {
      errs.name = 'Name is required';
    }
    if (fields.includes('email')) {
      if (!formState.email.trim()) errs.email = 'Email is required';
      else if (!isValidEmail(formState.email)) errs.email = 'Invalid email address';
    }
    if (fields.includes('message') && !formState.message.trim()) {
      errs.message = 'Message is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      const res = await fetch(endpoint, {
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

  const handleChange = (field: 'name' | 'email' | 'message', value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormState({ name: '', email: '', message: '', company: '', phone: '', service: '', budget: '' });
    setErrors({});
    setStatus('idle');
  };

  const fieldClass = (field: 'name' | 'email' | 'message') =>
    cn(
      'w-full bg-transparent border-b border-sl-silver/20 focus:border-sl-gold-subtle transition-all duration-500 rounded-none px-0 py-4 text-base font-light placeholder:text-sl-mist/60 focus:outline-none',
      field === 'message' && 'resize-none leading-relaxed',
      errors[field] && 'border-red-500/60 focus:border-red-500',
    );

  const inputClass = cn(
    'w-full bg-transparent border-b border-sl-silver/20 focus:border-sl-gold-subtle transition-all duration-700 rounded-none px-0 py-3 sm:py-4 text-base font-light text-sl-alabaster placeholder:text-sl-mist/40 focus:outline-none',
  );

  const selectClass = cn(
    'w-full bg-transparent border-b border-sl-silver/20 focus:border-sl-gold-subtle transition-all duration-700 rounded-none px-0 py-3 sm:py-4 text-base font-light text-sl-alabaster placeholder:text-sl-mist/40 focus:outline-none appearance-none cursor-pointer',
  );

  const labelClass =
    'font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-sl-mist/60 group-focus-within:text-sl-gold-hover transition-colors duration-700';

  return (
    <section
      className={cn(
        'w-full bg-sl-void text-sl-alabaster py-20 md:py-32 relative overflow-hidden',
        className,
      )}
    >
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <SilkShaderBackground speed={0.3} opacity={0.12} />
        <div className="absolute inset-0 gradient-radial-gold" />
        <RadialGlow color="var(--color-gold)" size={500} top="-100px" right="-100px" blur={50} opacity={0.06} />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sl-gold-subtle/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sl-gold-subtle/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-24 items-start">
          {/* Hero / Hero header */}
          <div className="lg:col-span-2 text-center lg:text-left">
            {eyebrow && (
              <ScrollFadeIn delay={0} className="mb-6">
                <span className="text-xs uppercase tracking-[0.35em] text-sl-mist/60 block font-mono">
                  {eyebrow}
                </span>
              </ScrollFadeIn>
            )}
            {title && (
              <ScrollFadeIn delay={staticMode ? 0 : STAGGER.micro * 0.4}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif font-light tracking-tighter text-sl-alabaster leading-tight">
                  {title}
                </h1>
              </ScrollFadeIn>
            )}
            {subtitle && (
              <ScrollFadeIn delay={staticMode ? 0 : STAGGER.micro * 0.6}>
                <p className="mt-8 text-base text-sl-mist/60 font-light leading-relaxed max-w-md">
                  {subtitle}
                </p>
              </ScrollFadeIn>
            )}

            {/* Back to Home link */}
            <motion.div
              className="mt-16 lg:mt-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, ease: EASE.entrance }}
            >
              <Link href="/" className="flex flex-col items-center lg:items-start gap-4 group">
                <span className="text-xs uppercase tracking-[0.35em] text-sl-mist/60 font-mono group-hover:text-sl-gold-hover transition-colors duration-700">
                  Back to Home
                </span>
                <div
                  className="h-12 w-px bg-gradient-to-b from-neutral-600 to-transparent group-hover:from-sl-gold-subtle transition-all duration-700"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </div>

          {/* Form / States */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div
                  key="success"
                  variants={fadeLift}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={staticMode}
                  transition={staticMode ? { duration: 0.01 } : STATE_TRANSITION}
                  className="text-center py-16 bg-sl-void/40 backdrop-blur-md border border-sl-silver/10 rounded-2xl"
                >
                  <motion.div
                    initial={staticMode ? undefined : { scale: 0, rotate: -180 }}
                    animate={staticMode ? undefined : { scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 12,
                      delay: staticMode ? 0 : 0.15,
                    }}
                    className="w-16 h-16 mx-auto rounded-full bg-sl-gold-subtle/10 border border-sl-gold-subtle/30 flex items-center justify-center mb-8"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-sl-gold-hover"
                    >
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 0.6,
                          delay: staticMode ? 0 : 0.3,
                          ease: EASE.entrance,
                        }}
                        d="M22 11.08V12a10 10 0 1 1-20 0v-0.92"
                      />
                      <motion.polyline
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: staticMode ? 0 : 0.5,
                          ease: EASE.entrance,
                        }}
                        points="22 4 12 14.01 9 11.01"
                      />
                    </svg>
                  </motion.div>
                  <motion.h3
                    initial={staticMode ? undefined : { opacity: 0, y: 16 }}
                    animate={staticMode ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: staticMode ? 0 : 0.2, ease: EASE.entrance }}
                    className="text-3xl font-serif font-light text-sl-alabaster mb-4"
                  >
                    Message Received
                  </motion.h3>
                  <motion.p
                    initial={staticMode ? undefined : { opacity: 0, y: 12 }}
                    animate={staticMode ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: staticMode ? 0 : 0.25, ease: EASE.entrance }}
                    className="text-sl-mist/60 font-light leading-relaxed mb-8 max-w-md mx-auto"
                  >
                    Thank you for reaching out. Our architects will review your vision
                    and respond within 24 hours.
                  </motion.p>
                  <motion.div
                    initial={staticMode ? undefined : { opacity: 0, scale: 0.92 }}
                    animate={staticMode ? undefined : { opacity: 1, scale: 1 }}
                    transition={{ delay: staticMode ? 0 : 0.3, ease: EASE.entrance }}
                  >
                    <Button variant="outline" size="lg" onClick={resetForm}>
                      Send Another
                    </Button>
                  </motion.div>
                </motion.div>
              ) : status === 'error' ? (
                <motion.div
                  key="error"
                  variants={fadeLift}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={staticMode}
                  className="text-center py-12 bg-sl-void/40 backdrop-blur-md border border-sl-silver/10 rounded-2xl"
                >
                  <motion.div
                    initial={staticMode ? undefined : { scale: 0, rotate: -180 }}
                    animate={staticMode ? undefined : { scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 12,
                      delay: staticMode ? 0 : 0.15,
                    }}
                    className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-8"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-red-500"
                    >
                      <motion.circle
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: staticMode ? 0 : 0.3,
                          ease: EASE.entrance,
                        }}
                        cx="12"
                        cy="12"
                        r="10"
                      />
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: staticMode ? 0 : 0.5,
                          ease: EASE.entrance,
                        }}
                        d="M15 9l-6 6M9 9l6 6"
                      />
                    </svg>
                  </motion.div>
                  <motion.h3
                    initial={staticMode ? undefined : { opacity: 0, y: 16 }}
                    animate={staticMode ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: staticMode ? 0 : 0.2, ease: EASE.entrance }}
                    className="text-3xl font-serif font-light text-sl-alabster mb-4"
                  >
                    Transmission Failed
                  </motion.h3>
                  <motion.p
                    initial={staticMode ? undefined : { opacity: 0, y: 12 }}
                    animate={staticMode ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: staticMode ? 0 : 0.25, ease: EASE.entrance }}
                    className="text-sl-mist/60 font-light leading-relaxed mb-8 max-w-md mx-auto"
                  >
                    Our systems are experiencing a momentary glitch. Please try again
                    in a few moments.
                  </motion.p>
                  <motion.div
                    initial={staticMode ? undefined : { opacity: 0, scale: 0.92 }}
                    animate={staticMode ? undefined : { opacity: 1, scale: 1 }}
                    transition={{ delay: staticMode ? 0 : 0.3, ease: EASE.entrance }}
                  >
                    <Button variant="outline" size="lg" onClick={resetForm}>
                      Try Again
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  noValidate
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    ...STATE_TRANSITION,
                    delay: staticMode ? 0 : 0.2,
                  }}
                  className="space-y-8"
                >
                  {/* Staggered field entrance — uses the HEXA motion system */}\
                  <motion.div
                    variants={staggerContainer(
                      staticMode ? 0 : STAGGER.micro,
                      staticMode ? 0 : 0,
                    )}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-8"
                  >
                    {fields.map((field) => {
                      const config = FIELD_SIZES[field];
                      return (
                        <motion.div
                          key={field}
                          variants={fadeLift}
                          className="flex flex-col gap-2 group"
                        >
                          <label htmlFor={`contact-${field}`} className={labelClass}>
                            {FIELD_LABELS[field]}
                          </label>
                          {config.multiline ? (
                            <textarea
                              id={`contact-${field}`}
                              rows={config.rows}
                              placeholder={FIELD_PLACEHOLDERS[field]}
                              value={formState[field]}
                              onChange={(e) => handleChange(field, e.target.value)}
                              aria-invalid={errors[field] ? true : undefined}
                              aria-describedby={errors[field] ? `contact-${field}-error` : undefined}
                              className={fieldClass(field)}
                            />
                          ) : (
                            <input
                              id={`contact-${field}`}
                              type={field === 'email' ? 'email' : 'text'}
                              placeholder={FIELD_PLACEHOLDERS[field]}
                              value={formState[field]}
                              onChange={(e) => handleChange(field, e.target.value)}
                              aria-invalid={errors[field] ? true : undefined}
                              aria-describedby={errors[field] ? `contact-${field}-error` : undefined}
                              className={fieldClass(field)}
                            />
                          )}
                          {errors[field] && (
                            <motion.span
                              key={`error-${field}`}
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: staticMode ? 0.01 : DURATION.micro,
                                ease: EASE.sharp,
                              }}
                              id={`contact-${field}-error`}
                              role="alert"
                              className="text-xs uppercase tracking-widest text-red-500 font-mono"
                            >
                              {errors[field]}
                            </motion.span>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {/* Optional fields: Company, Phone, Service, Budget */}\
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {/* Company */}\
                    <div className="flex flex-col gap-2 group">
                      <label htmlFor="contact-company" className={labelClass}>
                        Company (Optional)
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        placeholder="Studio or Firm Name"
                        value={formState.company}
                        onChange={(e) => setFormState((prev) => ({ ...prev, company: e.target.value }))}
                        className={inputClass}
                      />
                    </div>

                    {/* Phone */}\
                    <div className="flex flex-col gap-2 group">
                      <label htmlFor="contact-phone" className={labelClass}>
                        Phone (Optional)
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formState.phone}
                        onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {/* Service Type */}\
                    <div className="flex flex-col gap-2 group">
                      <label htmlFor="contact-service" className={labelClass}>
                        Service Type (Optional)
                      </label>
                      <select
                        id="contact-service"
                        value={formState.service}
                        onChange={(e) => setFormState((prev) => ({ ...prev, service: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="" className="bg-sl-void">Select a service...</option>
                        {serviceOptions.map((s) => (
                          <option key={s.id} value={s.slug} className="bg-sl-void">{s.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Budget Range */}\
                    <div className="flex flex-col gap-2 group">
                      <label htmlFor="contact-budget" className={labelClass}>
                        Budget Range (Optional)
                      </label>
                      <select
                        id="contact-budget"
                        value={formState.budget}
                        onChange={(e) => setFormState((prev) => ({ ...prev, budget: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="" className="bg-sl-void">Select a budget range...</option>
                        <option value="under_50k" className="bg-sl-void">Under $50K</option>
                        <option value="50k_100k" className="bg-sl-void">$50K – $100K</option>
                        <option value="100k_500k" className="bg-sl-void">$100K – $500K</option>
                        <option value="500k_plus" className="bg-sl-void">$500K+</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit */}\
                  <motion.div
                    initial={staticMode ? undefined : { opacity: 0, y: 12 }}
                    animate={staticMode ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: staticMode ? 0 : 0.3, ease: EASE.entrance }}
                  >
                    <motion.div
                      whileHover={staticMode ? undefined : { scale: 1.02 }}
                      whileTap={staticMode ? undefined : { scale: 0.98 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <Button
                        variant="primary"
                        size="lg"
                        disabled={status === 'sending'}
                        className="min-w-[200px] w-full sm:w-auto"
                      >
                        <span className="relative z-10">
                          {status === 'sending' ? 'Transmitting…' : 'Send Message'}
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
