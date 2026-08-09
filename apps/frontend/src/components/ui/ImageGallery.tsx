'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: 'auto' | '1/1' | '4/3' | '16/9' | '3/2';
}

interface ImageGalleryProps {
  images: GalleryImage[];
  className?: string;
  layout?: 'grid' | 'horizontal' | 'masonry';
  columns?: 2 | 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg';
  showCaptions?: boolean;
}

export function ImageGallery({
  images,
  className,
  layout = 'grid',
  columns = 3,
  gap = 'md',
  showCaptions = true,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap];

  const handleOpen = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedIndex(null);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  const handleKeydown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') handleClose();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  if (images.length === 0) return null;

  return (
    <>
      {/* Gallery grid */}
      <div
        className={cn('w-full', gapClass, className)}
        onKeyDown={handleKeydown}
      >
        {layout === 'grid' && (
          <div
            className={cn(
              'grid',
              columns === 2 && 'grid-cols-1 sm:grid-cols-2',
              columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
              columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
              columns === 5 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
              'gap-4'
            )}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const imageEl = target.closest('[data-gallery-index]');
              if (imageEl) {
                const index = parseInt(imageEl.getAttribute('data-gallery-index') || '0', 10);
                handleOpen(index);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const target = (e.target as HTMLElement).closest('[data-gallery-index]');
                if (target) {
                  const index = parseInt(target.getAttribute('data-gallery-index') || '0', 10);
                  handleOpen(index);
                }
              }
            }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                data-gallery-index={index}
                className="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 group hover:ring-2 hover:ring-accent/50 focus:outline-none focus:ring-2 focus:ring-accent"
                tabIndex={0}
                role="button"
                aria-label={`View image ${index + 1}: ${image.alt}`}
              >
                <div
                  className={cn(
                    'relative overflow-hidden',
                    image.aspectRatio !== 'auto' && `aspect-[${image.aspectRatio}]`
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                {showCaptions && image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-sm">
                    {image.caption}
                  </div>
                )}
                {showCaptions && !image.caption && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1} / {images.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {layout === 'horizontal' && (
          <div
            className={cn('flex gap-4 overflow-x-auto pb-4', gapClass)}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const imageEl = target.closest('[data-gallery-index]');
              if (imageEl) {
                const index = parseInt(imageEl.getAttribute('data-gallery-index') || '0', 10);
                handleOpen(index);
              }
            }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                data-gallery-index={index}
                className="relative flex-shrink-0 cursor-pointer transition-all duration-300 group hover:ring-2 hover:ring-accent/50 focus:outline-none focus:ring-2 focus:ring-accent"
                tabIndex={0}
                role="button"
                aria-label={`View image ${index + 1}: ${image.alt}`}
              >
                <div className="relative w-[300px] h-[200px] overflow-hidden rounded-xl">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="300px"
                  />
                </div>
                {showCaptions && image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm px-3 py-2 rounded-b-xl">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={handleClose}
            onKeyDown={handleKeydown}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={handleClose}
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <div
              className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                key={selectedIndex}
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                width={1200}
                height={800}
                className="max-h-[85vh] max-w-full object-contain"
                priority
              />
            </div>

            {/* Caption */}
            {images[selectedIndex].caption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white text-sm max-w-md px-4"
              >
                {images[selectedIndex].caption}
              </motion.div>
            )}

            {/* Navigation */}
            <div className="absolute inset-x-4 bottom-20 flex items-center justify-between">
              <button
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <div className="text-white text-sm">
                {selectedIndex + 1} / {images.length}
              </div>

              <button
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Zoom hint */}
            <div className="absolute bottom-4 right-4 text-white/60 text-xs flex items-center gap-1">
              <ZoomIn className="w-4 h-4" />
              <span>Click to expand</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
