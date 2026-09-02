'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
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

  const baseStyles =
    'relative overflow-hidden rounded-2xl border border-sl-gold-subtle/15 backdrop-blur-sm shadow-lg shadow-black/40';

  const variantStyles = {
    featured: 'bg-gradient-to-br from-surface-light to-surface-dark border-sl-gold-subtle/15 shadow-lg shadow-black/40',
    minimal:
      'bg-transparent border-sl-gold-subtle/10 shadow-none backdrop-blur-sm bg-clip-content',
    glass:
      'artisan-glass border-sl-gold-subtle/15 shadow-[var(--artisan-glass-shadow),var(--artisan-glass-highlight)]',
    solid: 'bg-sl-obsidian-dark border-sl-gold-subtle/15 shadow-lg shadow-black/40',
    luxury:
      'bg-gradient-to-br from-surface-dark via-surface to-surface-light border-sl-gold-subtle/20 shadow-xl shadow-sl-gold-subtle/10',
  };

  const hoverStyles = {
    featured: 'hover:border-sl-gold-subtle/40 hover:shadow-xl hover:shadow-sl-gold-subtle/15',
    minimal: 'hover:border-sl-gold-subtle/20 hover:shadow-md',
    glass: 'hover:artisan-glass-gold hover:border-sl-gold-subtle/40',
    solid: 'hover:border-sl-gold-subtle/20 hover:shadow-xl',
    luxury: 'hover:border-sl-gold-subtle/40 hover:shadow-2xl hover:shadow-sl-gold-subtle/15',
  };

  return (
    <MotionTag
      className={cn(baseStyles, variantStyles[variant], hover && hoverStyles[variant], className)}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={title ? title : 'Project image'}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}
      <div className="p-6">
        {title && (
          <h3 className="text-xl font-serif font-semibold text-sl-alabaster mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sl-mist/60 text-sm leading-relaxed">{description}</p>
        )}
        {children}
      </div>
    </MotionTag>
  );
};

export { Card };
