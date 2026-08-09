'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface GalleryBlockImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface GalleryBlockProps {
  images: GalleryBlockImage[];
  layout?: 'grid' | 'horizontal' | 'carousel';
  columns?: number;
  caption?: string;
  className?: string;
}

export function GalleryBlock({
  images,
  layout = 'grid',
  columns = 3,
  caption,
  className,
}: GalleryBlockProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      {/* Caption */}
      {caption && (
        <p className="text-neutral-400 font-light text-lg mb-6 text-center">
          {caption}
        </p>
      )}

      {/* Gallery grid */}
      <div
        className={cn(
          'grid gap-4',
          layout === 'grid' && columns === 2 && 'grid-cols-1 sm:grid-cols-2',
          layout === 'grid' && columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          layout === 'grid' && columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          layout === 'grid' && columns === 5 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
          layout === 'horizontal' && 'flex gap-4 overflow-x-auto pb-4',
          layout === 'carousel' && 'relative'
        )}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              layout === 'horizontal' && 'flex-shrink-0',
              'relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 group hover:ring-2 hover:ring-accent/50'
            )}
            onClick={() => setLightboxIndex(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLightboxIndex(index);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`View ${image.alt}`}
          >
            <div
              className={cn(
                'relative',
                layout === 'horizontal' ? 'w-[300px] h-[200px]' : 'aspect-[4/3]'
              )}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-sm">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightboxIndex(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowLeft' && lightboxIndex !== null) {
              setLightboxIndex((prev) => {
                if (prev === null) return null;
                return prev === 0 ? images.length - 1 : prev - 1;
              });
            }
            if (e.key === 'ArrowRight' && lightboxIndex !== null) {
              setLightboxIndex((prev) => {
                if (prev === null) return null;
                return prev === images.length - 1 ? 0 : prev + 1;
              });
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].alt}
              width={1200}
              height={800}
              className="max-h-[85vh] max-w-full object-contain"
            />
          </div>

          {images[lightboxIndex].caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white text-sm max-w-md px-4">
              {images[lightboxIndex].caption}
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-20 left-4 right-4 flex items-center justify-between">
              <button
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1
                  );
                }}
                aria-label="Previous"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-white text-sm">
                {lightboxIndex + 1} / {images.length}
              </div>

              <button
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1
                  );
                }}
                aria-label="Next"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
