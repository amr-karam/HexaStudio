'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  variant?: 'featured' | 'minimal' | 'glass' | 'solid' | 'luxury';
  as?: 'div' | 'article' | 'section';
  hover?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Card = ({
  title,
  description,
  image,
  variant = 'featured',
  as = 'div',
  hover = true,
  children,
  className,
}: CardProps) => {
  const MotionTag =
    as === 'article' ? motion.article : as === 'section' ? motion.section : motion.div;

  // When only children are provided (no title, description, or image),
  // skip the padded wrapper so children can use h-full to fill the card.
  const hasOwnContent = !!(title || description || image);

  return (
    <MotionTag
      whileHover={hover ? { y: -4 } : undefined}
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-500',
        variant === 'featured' &&
          'border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent',
        variant === 'minimal' && 'border-transparent hover:bg-white/5',
        variant === 'glass' &&
          'border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl hover:border-[var(--glass-border-hover)]',
        variant === 'solid' && 'bg-surface border-border/50',
        variant === 'luxury' &&
          'border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl hover:border-accent/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]',
        className
      )}
    >
      {image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt={title || 'Project image'}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      {hasOwnContent ? (
        <div className="p-6">
          {title && (
            <h3 className="text-xl font-serif mb-2 group-hover:text-accent transition-colors duration-300">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-white/60 line-clamp-2 mb-4 transition-colors duration-300 group-hover:text-white/80">
              {description}
            </p>
          )}
          {children}
        </div>
      ) : (
        children
      )}
    </MotionTag>
  );
};

export { Card };
