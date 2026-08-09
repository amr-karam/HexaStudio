'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

export interface TimelineBlockProps {
  events: TimelineEvent[];
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

export function TimelineBlock({ events, className, layout = 'vertical' }: TimelineBlockProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Timeline line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-accent/30 to-transparent"
          style={layout === 'horizontal' ? { top: '50%', left: '0', bottom: 'auto', width: '100%', height: '2px' } : undefined}
        />

        {/* Events */}
        <div
          className={cn(
            'space-y-8',
            layout === 'horizontal' && 'flex flex-col md:flex-row md:space-x-12 md:space-y-0'
          )}
        >
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'relative flex items-start',
                layout === 'horizontal' && 'flex-row items-center md:w-1/2'
              )}
            >
              {/* Timeline dot */}
              <div className="absolute left-4 top-6 w-8 h-8 rounded-full bg-accent border-4 border-background flex items-center justify-center z-10 shadow-lg">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>

              {/* Content */}
              <div className={cn(
                'ml-12',
                layout === 'horizontal' && 'md:ml-0 md:mr-12 md:text-right'
              )}>
                {/* Date */}
                <span className="text-accent text-sm font-medium uppercase tracking-wider">
                  {event.date}
                </span>

                {/* Title */}
                <h3 className="mt-2 text-xl font-serif font-light text-foreground">
                  {event.title}
                </h3>

                {/* Description */}
                {event.description && (
                  <p className="mt-2 text-neutral-400 font-light leading-relaxed">
                    {event.description}
                  </p>
                )}

                {/* Image */}
                {event.image && (
                  <div className={cn(
                    'mt-4 rounded-xl overflow-hidden',
                    layout === 'horizontal' && 'md:mt-4'
                  )}>
                    <Image
                      src={event.image}
                      alt={event.imageAlt || event.title}
                      width={layout === 'horizontal' ? 400 : 600}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Connector line (for vertical layout) */}
                {layout === 'vertical' && index < events.length - 1 && (
                  <div className="absolute left-8 top-12 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
