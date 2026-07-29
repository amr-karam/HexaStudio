'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from './cn';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative px-4 py-2 text-sm font-light tracking-wide rounded-lg transition-all duration-300',
                isActive
                  ? 'bg-[#D4A843]/10 text-[#D4A843]'
                  : 'text-[#666] hover:text-neutral-300 hover:bg-white/[0.03]',
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
                        ? 'bg-[#D4A843]/20 text-[#D4A843]'
                        : 'bg-[#1F1F1F] text-[#555]',
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
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-light tracking-wide transition-colors duration-300',
              isActive ? 'text-white' : 'text-[#666] hover:text-neutral-300',
            )}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-[#D4A843]/20 text-[#D4A843]' : 'bg-[#1F1F1F] text-[#555]',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4A843] rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
