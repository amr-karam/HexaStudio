'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/cn';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

const underlineActiveCls = 'text-foreground';
const underlineInactiveCls = 'text-tertiary hover:text-secondary';
const pillsActiveCls = 'bg-gold/10 text-gold border-gold/30';
const pillsInactiveCls = 'text-tertiary hover:text-secondary hover:bg-white/[0.03] border-border';

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}: TabsProps) {
  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="tablist"
      aria-label="Tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              role="tab"
              aria-selected={isActive}
              className={cn(
                'relative px-4 py-2 text-sm font-light tracking-wide rounded-lg border',
                'transition-all duration-200 ease-[var(--hexa-ease-interaction)]',
                isActive ? pillsActiveCls : pillsInactiveCls,
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full',
                      isActive
                        ? 'bg-gold/20 text-gold'
                        : 'bg-border text-tertiary',
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        }

        // Underline variant
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'relative px-4 py-2.5 text-sm font-light tracking-wide',
              'transition-colors duration-200 ease-[var(--hexa-ease-interaction)]',
              isActive ? underlineActiveCls : underlineInactiveCls,
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-gold/20 text-gold' : 'bg-border text-tertiary',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <motion.div
                layoutId="hexastudio-tab-underline"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
