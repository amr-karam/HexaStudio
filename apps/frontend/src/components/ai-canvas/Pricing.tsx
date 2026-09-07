'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

interface Plan {
  id: string;
  name: string;
  description: string;
  price?: string;
  originalPrice?: string;
  save?: string;
  credits?: string;
  equivalent?: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'creator',
    name: 'Creator',
    description: 'Explore possibilities on Melius',
    price: '$17',
    originalPrice: '$20',
    save: '15%',
    credits: '20,000 credits/mo',
    equivalent: '≈ 275 images or 20 videos',
    features: [
      'Access to all models',
      'Up to 1 agent skill',
      'Unlimited seats',
      'Unlimited agent usage',
      'Shared workspaces',
    ],
    cta: 'Start with Creator',
    href: 'https://app.melius.com/billing',
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Scale your creative workflows',
    price: '$43',
    originalPrice: '$50',
    save: '15%',
    credits: '50,000 credits/mo',
    equivalent: '≈ 700 images or 50 videos',
    features: [
      'Everything in Creator',
      'Up to 3 agent skills',
    ],
    cta: 'Start with Growth',
    href: 'https://app.melius.com/billing',
    featured: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Build a team of creative agents',
    price: '$93',
    originalPrice: '$110',
    save: '15%',
    credits: '110,000 credits/mo',
    equivalent: '≈ 1,525 images or 110 videos',
    features: [
      'Everything in Growth',
      'Up to 10 agent skills',
      'Slack agent access',
      'Semantic Assets Manager',
      'Import/create ElevenLabs custom voices',
      'AI prompt enhancement',
      'Better fonts',
      'And more...',
    ],
    cta: 'Start with Professional',
    href: 'https://app.melius.com/billing',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For higher limits',
    credits: 'Custom limits',
    equivalent: 'Volume discounts available',
    features: [
      'Everything in Professional',
      'Priority queue access',
      'Real-time support',
      'Unlimited agent skills',
      'Dedicated Slack channel',
      'Volume discounts',
      'And more...',
    ],
    cta: 'Contact Sales',
    href: 'https://app.melius.com/book-intro',
  },
];

/* -------------------------------------------------------------------------- */
/*  Subcomponents                                                            */
/* -------------------------------------------------------------------------- */

const COIN_SRC = '/media/melius/shared/melius-coin-silver.webp';

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={
        reducedMotion
          ? undefined
          : { duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }
      }
      className={cn(
        'relative flex h-full flex-col rounded-3xl border bg-white/[0.02] p-6 transition-colors duration-500',
        plan.featured
          ? 'border-white/20 bg-white/[0.04]'
          : 'border-white/10 hover:border-white/20 hover:bg-white/[0.05]',
      )}
    >
      {plan.featured ? (
        <span className="absolute -top-3 right-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
          Recommended
        </span>
      ) : null}

      <div className="mb-6">
        <h3 className="font-serif text-2xl font-light tracking-tight text-white">
          {plan.name}
        </h3>
        <p className="mt-2 text-sm font-light text-white/60">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="font-serif text-4xl font-light tracking-tight text-white">
            {plan.price}
          </span>
          {plan.originalPrice ? (
            <span className="text-sm text-white/40 line-through">
              {plan.originalPrice}
            </span>
          ) : null}
        </div>
        {plan.save ? (
          <span className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
            Save {plan.save}
          </span>
        ) : null}
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/5">
          <Image
            src={COIN_SRC}
            alt="Melius Coin"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <p className="text-sm text-white/80">{plan.credits}</p>
          <p className="text-xs text-white/50">{plan.equivalent}</p>
        </div>
      </div>

      <a href={plan.href} className="w-full">
        <Button
          variant={plan.featured ? 'primary' : 'outline'}
          size="lg"
          className="w-full"
        >
          {plan.cta}
        </Button>
      </a>

      <ul className="mt-6 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
            <svg
              aria-hidden
              className="mt-0.5 h-4 w-4 text-[#D4AF37]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export function Pricing() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative bg-[#030303] px-6 py-24 sm:px-10 md:px-16 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-16 text-center md:mb-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/60">
            <span className="mr-3 inline-block h-px w-8 align-middle bg-white/40" />
            Pricing
            <span className="ml-3 inline-block h-px w-8 align-middle bg-white/40" />
          </p>
          <h2 className="mt-6 font-serif text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] tracking-tight text-white">
            Our <span className="text-[#D4AF37]">pricing</span>
          </h2>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={
            reducedMotion
              ? undefined
              : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          }
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {PLANS.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
