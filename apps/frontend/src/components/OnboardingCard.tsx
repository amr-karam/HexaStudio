'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE, DURATION, REDUCED_TRANSITION } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/features/portal/components/PortalIcons';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface OnboardingStep {
  title: string;
  description: string;
  icon?: string;
}

interface OnboardingCardProps {
  steps: OnboardingStep[];
  /** CSS class applied to the outermost wrapper. */
  className?: string;
  /** Callback fired when the user clicks "Get Started" on the final step. */
  onComplete?: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Step Indicator (dots)                                                       */
/* -------------------------------------------------------------------------- */

const StepIndicator = ({
  total,
  current,
  reducedMotion,
}: {
  total: number;
  current: number;
  reducedMotion: boolean;
}) => (
  <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Onboarding steps">
    {Array.from({ length: total }, (_, i) => (
      <motion.span
        key={i}
        role="tab"
        aria-selected={i === current}
        aria-label={`Step ${i + 1} of ${total}`}
        animate={
          reducedMotion
            ? undefined
            : { width: i === current ? 24 : 8, opacity: i === current ? 1 : 0.4 }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: DURATION.micro, ease: EASE.entrance }
        }
        className={cn(
          'h-2 rounded-full transition-colors duration-300',
          i === current ? 'bg-sl-gold-subtle' : 'bg-sl-silver/30',
        )}
      />
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Slide variants                                                             */
/* -------------------------------------------------------------------------- */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

/* -------------------------------------------------------------------------- */
/*  OnboardingCard                                                              */
/* -------------------------------------------------------------------------- */

/**
 * OnboardingCard — Multi-step artisan glass card with gold accents.
 *
 * Steps through a series of screens with smooth Framer Motion transitions.
 * Back is disabled on the first step; Next becomes "Get Started" on the last.
 * Respects `prefers-reduced-motion` and manages focus on step change.
 */
export function OnboardingCard({ steps, className, onComplete }: OnboardingCardProps) {
  const reducedMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      onComplete?.();
      return;
    }
    setDirection(1);
    setCurrentStep((prev) => prev + 1);
  }, [isLast, onComplete]);

  const goBack = useCallback(() => {
    if (isFirst) return;
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  }, [isFirst]);

  /* Focus management: move focus to the next button on step change */
  useEffect(() => {
    nextButtonRef.current?.focus();
  }, [currentStep]);

  const step = steps[currentStep];

  return (
    <div
      className={cn(
        'relative rounded-2xl border border-sl-silver/20 bg-white/[0.02] backdrop-blur-sm p-8 md:p-10',
        className,
      )}
      role="region"
      aria-label="Onboarding steps"
    >
      {/* Step indicator */}
      <div className="mb-8">
        <StepIndicator total={steps.length} current={currentStep} reducedMotion={reducedMotion} />
      </div>

      {/* Step content with slide transition */}
      <div className="relative min-h-[220px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial={reducedMotion ? 'center' : 'enter'}
            animate="center"
            exit={reducedMotion ? 'center' : 'exit'}
            transition={
              reducedMotion
                ? REDUCED_TRANSITION
                : { duration: DURATION.component, ease: EASE.entrance }
            }
            className="flex flex-col items-center text-center"
            role="tabpanel"
            aria-label={`Step ${currentStep + 1}: ${step.title}`}
          >
            {/* Icon */}
            {step.icon && (
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-sl-gold-subtle/40 bg-sl-gold-subtle/10">
                <Icon
                  name={step.icon as React.ComponentProps<typeof Icon>['name']}
                  size={28}
                  strokeWidth={1.5}
                  className="text-sl-gold-hover"
                />
              </div>
            )}

            {/* Title */}
            <h3 className="mb-3 font-serif text-2xl font-light tracking-tight text-sl-alabaster">
              {step.title}
            </h3>

            {/* Description */}
            <p className="max-w-sm text-sm leading-relaxed text-sl-silver/70">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="md"
          disabled={isFirst}
          onClick={goBack}
          aria-label="Go to previous step"
          className="min-w-[100px]"
        >
          Back
        </Button>

        <Button
          ref={nextButtonRef}
          variant={isLast ? 'primary' : 'secondary'}
          size="md"
          onClick={goNext}
          aria-label={isLast ? 'Complete onboarding' : 'Go to next step'}
          className="min-w-[120px]"
        >
          {isLast ? 'Get Started' : 'Next'}
        </Button>
      </div>

      {/* Gold accent line at bottom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-24 bg-gradient-to-r from-transparent via-sl-gold-subtle/40 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

export type { OnboardingStep, OnboardingCardProps };
