'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ModalProject {
  title: string;
  category: string;
  image: string;
  slug: string;
  description?: string;
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
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-surface border border-border/50"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border/50 text-neutral-400 hover:text-foreground transition-colors duration-300"
              aria-label="Close modal"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[50vh]">
              <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full min-h-[40vh] lg:min-h-[90vh] bg-surface-light overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-background/40 lg:via-transparent lg:to-transparent" />
              </div>

              <div className="flex flex-col justify-center p-8 md:p-16 gap-8">
                <div>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[11px] uppercase tracking-[0.5em] text-accent"
                  >
                    {project.category}
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl md:text-6xl font-serif font-light tracking-tight text-foreground mt-6 leading-tight"
                  >
                    {project.title}
                  </motion.h2>
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
                  <Link href={`/portfolio/${project.slug}`}>
                    <Button variant="primary" size="lg">
                      View in 3D
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" onClick={onClose}>
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
