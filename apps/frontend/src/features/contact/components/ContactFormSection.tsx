'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';
import { RadialGlow } from '@/components/animation';
import { isValidEmail } from '@hexastudio/utils';
import { cn } from '@/lib/utils';
import { EASE, DURATION, STAGGER, fadeLift, staggerContainer } from '@/lib/motion';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { API_BASE_URL } from '@/config/constants';

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

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
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
    setFormState({ name: '', email: '', message: '' });
    setErrors({});
    setStatus('idle');
  };

  const fieldClass = (field: 'name' | 'email' | 'message') =>
    cn(
      'w-full bg-transparent border-b border-sl-silver/20 focus:border-sl-gold-subtle transition-all duration-500 rounded-none px-0 py-4 text-base font-light placeholder:text-sl-mist/60 focus:outline-none',
      field === 'message' && 'resize-none leading-relaxed',
      errors[field] && 'border-red-500/60 focus:border-red-500',
    );

  return (
    <section
      className={cn(
        'w-full bg-sl-void text-sl-alabster py-20 md:py-32 relative overflow-hidden',
        className,
      )}
    >
      {/* Atmospheric gold radial glow — matches site convention */}
      <RadialGlow color="#D4AF37" size={500} top="-100px" right="-100px" blur={50} opacity={0.06} />
      <div
        aria-hidden="true"
        className="absolute inset-0 gradient-radial-gold pointer-events-none"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 md:px-8">
        {eyebrow && (
          <ScrollFadeIn delay={0} className="mb-6">
            <span className="text-xs uppercase tracking-[0.35em] text-sl-mist/60 block font-mono">
              {eyebrow}
            </span>
          </ScrollFadeIn>
        )}

        {title && (
          <ScrollFadeIn delay={staticMode ? 0 : STAGGER.micro * 0.4}>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-sl-alabaster leading-tight mb-6">
              {title}
            </h2>
          </ScrollFadeIn>
        )}

        {subtitle && (
          <ScrollFadeIn delay={staticMode ? 0 : STAGGER.micro * 0.6}>
            <p className="text-sl-mist/60 font-light text-base md:text-lg leading-relaxed mb-12 max-w-xl">
              {subtitle}
            </p>
          </ScrollFadeIn>
        )}

        <AnimatePresence mode="wait">
          {status === 'sent' ? (
            <motion.div
              key="success"
              variants={fadeLift}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={staticMode}
              transition={staticMode ? { duration: 0.01 } : { type: 'spring', stiffness: 160, damping: 22, mass: 0.8 }}
              className="text-center py-16"
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
              className="text-center py-12"
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
                className="text-3xl font-serif font-light text-sl-alabaster mb-4"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                ...STATE_TRANSITION,
                delay: staticMode ? 0 : 0.2,
              }}
              className="space-y-8"
            >
              {/* Staggered field entrance — uses the HEXA motion system */}
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
                      <label
                        htmlFor={`contact-${field}`}
                        className={cn(
                          'font-mono text-xs uppercase tracking-[0.35em] text-sl-mist/60',
                          'group-focus-within:text-sl-gold-hover',
                          'transition-colors',
                          staticMode ? 'duration-0' : 'duration-500',
                        )}
                      >
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

              <div className="flex justify-end pt-4">
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
                    className={cn(
                      'min-w-[180px]',
                      'transition-transform',
                      staticMode ? 'duration-0' : 'duration-150',
                    )}
                  >
                    <span className="relative z-10">
                      {status === 'sending' ? 'Transmitting…' : 'Send Message'}
                    </span>
                  </Button>
                </motion.div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
