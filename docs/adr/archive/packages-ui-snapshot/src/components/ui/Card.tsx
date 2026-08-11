'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  variant?: 'featured' | 'minimal' | 'luxury' | 'solid';
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

  const hasOwnContent = !!(title || description || image);

  return (
    <MotionTag
      whileHover={hover ? { y: -8 } : undefined}
      className={cn(
        'group relative overflow-hidden rounded-none border transition-all duration-700',
        variant === 'featured' &&
          'border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] text-[var(--color-primary)]',
        variant === 'minimal' && 'border-transparent bg-transparent hover:bg-[var(--color-neutral-100)]',
        variant === 'luxury' &&
          'border-[var(--color-accent)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] shadow-[0_0_0_0px_var(--color-accent)] hover:shadow-[0_0_30px_rgba(197,163,93,0.2)]',
        variant === 'solid' && 'border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)]',
        className
      )}
    >
      {image && (
        <div className="aspect-[4/3] overflow-hidden bg-[var(--color-neutral-200)]">
          <motion.img
            src={image}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt={title || 'Project image'}
            loading="lazy"
            decoding="async"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}
      {hasOwnContent ? (
        <div className="p-8">
          {title && (
            <h3 className="text-2xl font-serif mb-3 tracking-tight transition-colors duration-500 group-hover:text-[var(--color-accent)]">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm leading-relaxed text-[var(--color-neutral-500)] mb-6 transition-colors duration-500 group-hover:text-[var(--color-neutral-700)]">
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
