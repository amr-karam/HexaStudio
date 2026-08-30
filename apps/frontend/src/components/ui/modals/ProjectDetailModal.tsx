'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressiveReveal from '@/components/effects/ProgressiveReveal';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextReveal } from '@/components/ui/TextReveal';
import { REDUCED_TRANSITION, makeTransition, modalPanel, overlay } from '@/lib/motion';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface ModalProject {
  title: string;
  category: string;
  image: string;
  slug: string;
  description?: string;
  status?: string;
}

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ModalProject;
}

export const ProjectDetailModal = ({ isOpen, onClose, project }: ProjectDetailModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { reduced } = useHEXAMotion();

  // Escape key closes the modal (replaces ad-hoc listener)
  useKeyboardShortcut('Escape', () => {
    if (isOpen) onClose();
  }, {
    // Allow Escape to work when inputs are focused
    ignoreInput: false,
    // Match original document target for cross-browser consistency
    target: 'document',
    // Prevent accidental navigation
    preventDefault: true
  });

  // Focus trap + initial focus (was 22 lines of duplicated Tab logic)
  useFocusTrap(dialogRef, isOpen);

  // Body scroll lock + inert (was 32 lines of ad-hoc DOM)
  useScrollLock(isOpen, { inertSelector: '#main-content' });

  // Document title sync (restores on close)
  useDocumentTitle(
    isOpen ? `${project.title} — ${project.category} | HEXA Studio` : '',
    { restoreOnUnmount: true },
  );

  // Remember trigger for focus restoration (initial focus now handled by useFocusTrap)
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    return () => {
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  const panelVariants = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : modalPanel;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlay}
          transition={reduced ? REDUCED_TRANSITION : { duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            tabIndex={-1}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={reduced}
            className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden bg-sl-obsidian border border-sl-silver/20 shadow-2xl"
          >
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="absolute top-6 end-6 z-20 w-12 h-12 flex items-center justify-center bg-sl-void/50 backdrop-blur-md border border-sl-silver/20 text-sl-mist/60 hover:text-sl-alabaster transition-colors duration-300 rounded-full"
              aria-label="Close modal"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
              <div className="relative lg:col-span-7 h-[50vh] lg:h-auto overflow-hidden bg-sl-obsidian-light">
                <motion.div
                  initial={reduced ? { scale: 1 } : { scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={reduced ? REDUCED_TRANSITION : { duration: 2, ease: makeTransition('entrance', 'camera') }}
                  className="h-full w-full relative"
                >
                  <ProgressiveReveal
                    src={project.image}
                    alt={project.title}
                    delay={0.1}
                    duration={1.0}
                    className="h-full w-full"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={reduced ? REDUCED_TRANSITION : { delay: 0.3, duration: 1 }}
                  className="absolute inset-0 bg-gradient-to-t from-sl-void/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-background/40 lg:via-transparent lg:to-transparent"
                />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-center p-8 md:p-16 bg-sl-obsidian gap-8">
                <div>
                    <div className="flex flex-col items-start gap-2">
                      <motion.span
                        initial={reduced ? { opacity: 1 } : { opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={reduced ? REDUCED_TRANSITION : { delay: 0.2, duration: 0.6, ease: makeTransition('entrance', 'component') }}
                        className="text-[11px] uppercase tracking-[0.5em] text-sl-gold-hover font-mono"
                      >
                        {project.category}
                      </motion.span>
                      {project.status && (
                        <span className="text-[9px] uppercase tracking-widest text-sl-gold-hover px-2 py-0.5 border border-sl-gold-subtle/30 rounded-full bg-sl-gold-subtle/10 font-mono">
                          {project.status}
                        </span>
                      )}
                    </div>

                  <div className="mt-6">
                     <TextReveal delay={reduced ? 0 : 0.3}>
                       <h2 id="project-modal-title" className="text-4xl md:text-6xl font-serif font-light tracking-tight text-sl-alabaster leading-tight">
                         {project.title}
                       </h2>
                     </TextReveal>
                  </div>
                </div>

                <motion.p
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduced ? REDUCED_TRANSITION : { delay: 0.4, duration: 0.8, ease: makeTransition('entrance', 'component') }}
                  className="text-base text-sl-mist/60 font-light leading-relaxed"
                >
                  {project.description || `A stunning ${project.category.toLowerCase()} project that showcases expertise in architectural visualization — from conceptual design to photorealistic presentation, every detail crafted with precision.`}
                </motion.p>

                <motion.div
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduced ? REDUCED_TRANSITION : { delay: 0.5, duration: 0.8, ease: makeTransition('entrance', 'component') }}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Link href={`/projects/${project.slug}`} className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full">
                      View in 3D
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" onClick={onClose} className="w-full sm:w-auto">
                    Close
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
