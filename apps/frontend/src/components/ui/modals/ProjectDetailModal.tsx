'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextReveal } from '@/components/ui/TextReveal';

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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden bg-surface border border-border/50 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center bg-background/50 backdrop-blur-md border border-border/50 text-neutral-400 hover:text-foreground transition-colors duration-300 rounded-full"
              aria-label="Close modal"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
              <div className="relative lg:col-span-7 h-[50vh] lg:h-auto overflow-hidden bg-surface-light">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-background/40 lg:via-transparent lg:to-transparent" />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-center p-8 md:p-16 bg-surface gap-8">
                <div>
                    <div className="flex flex-col items-start gap-2">
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[11px] uppercase tracking-[0.5em] text-accent font-mono"
                      >
                        {project.category}
                      </motion.span>
                      {project.status && (
                        <span className="text-[9px] uppercase tracking-widest text-accent px-2 py-0.5 border border-accent/30 rounded-full bg-accent/10 font-mono">
                          {project.status}
                        </span>
                      )}
                    </div>

                  <div className="mt-6">
                    <TextReveal delay={0.3}>
                      <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight text-foreground leading-tight">
                        {project.title}
                      </h2>
                    </TextReveal>
                  </div>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-base text-neutral-400 font-light leading-relaxed"
                >
                  {project.description || `A stunning ${project.category.toLowerCase()} project that showcases expertise in architectural visualization — from conceptual design to photorealistic presentation, every detail crafted with precision.`}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Link href={`/portfolio/${project.slug}`} className="w-full sm:w-auto">
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
