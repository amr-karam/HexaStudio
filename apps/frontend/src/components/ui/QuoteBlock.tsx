'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface QuoteBlockProps {
  quote: string;
  author?: string;
  role?: string;
  company?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
}

export function QuoteBlock({
  quote,
  author,
  role,
  company,
  image,
  imageAlt,
  className,
}: QuoteBlockProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('relative w-full', className)}>
      {/* Quote mark */}
      <div className="absolute -top-6 left-0 text-accent/20 select-none">
        <svg
          className="w-20 h-20"
          viewBox="0 0 120 120"
          fill="currentColor"
        >
          <path d="M40 0C17.9 0 0 17.9 0 40c0 34.4 40 72 40 72s40-37.6 40-72C80 17.9 62.1 0 40 0zm0 96c-15.4 0-28-12.6-28-28s12.6-28 28-28 28 12.6 28 28-12.6 28-28 28z" />
        </svg>
      </div>

      <div className="relative pl-12">
        {/* Quote text */}
        <motion.p
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-serif font-light text-white/90 leading-relaxed italic"
        >
          {quote}
        </motion.p>

        {/* Attribution */}
        {(author || role || company) && (
          <div className="mt-6 flex items-center gap-4">
            {/* Author image */}
            {image && (
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/30 flex-shrink-0">
                <Image
                  src={image}
                  alt={imageAlt || author || 'Author'}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
            )}

            {/* Author info */}
            <div className="text-left">
              {author && (
                <div className="text-white font-medium">{author}</div>
              )}
              {(role || company) && (
                <div className="text-neutral-400 text-sm">
                  {role}
                  {role && company && ' at '}
                  {company}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
