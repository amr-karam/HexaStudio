"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { REDUCED_TRANSITION, makeTransition } from '@/lib/motion';
import { EASING, DUR, STAGGER_TOKENS } from '@/lib/motion/tokens';
import { CurrencySelector } from '@/features/currency/CurrencySelector';

interface NavDropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface NavDropdown {
  label: string;
  items: NavDropdownItem[];
}

interface NavItemData {
  label: string;
  href: string;
  dropdown?: NavDropdown;
}

interface NavbarMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItemData[];
  pathname: string;
  reduced: boolean;
}

export function NavbarMobileMenu({
  isOpen,
  onClose,
  navItems,
  pathname,
  reduced,
}: NavbarMobileMenuProps) {
  const [expandedDropdowns, setExpandedDropdowns] = useState<Set<string>>(new Set());
  const menuTransition = reduced ? REDUCED_TRANSITION : makeTransition('entrance', 'component');

  const toggleDropdown = (href: string) => {
    setExpandedDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  };

  const closeAllDropdowns = () => {
    setExpandedDropdowns(new Set());
  };

  const isDropdownActive = (href: string) => {
    return Array.from(expandedDropdowns).includes(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0 }}
          transition={menuTransition}
          className="fixed inset-0 z-40 flex flex-col items-center justify-start gap-8 bg-sl-void/98 backdrop-blur-3xl pt-32 pb-8 overflow-y-auto"
        >
          {navItems.map((item, idx) => (
            <React.Fragment key={item.href}>
              {item.dropdown ? (
                <motion.div
                  initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  transition={
                    reduced
                      ? REDUCED_TRANSITION
                      : {
                          delay: idx * STAGGER_TOKENS.lines,
                          duration: DUR.transition,
                          ease: EASING.easeOutExpo,
                        }
                  }
                >
                  <button
                    onClick={() => toggleDropdown(item.href)}
                    aria-expanded={isDropdownActive(item.href)}
                    aria-haspopup="true"
                    className={cn(
                      'flex w-full items-center justify-between gap-3 text-3xl sm:text-4xl font-light tracking-tighter transition-colors duration-500 py-3 min-h-[52px] pl-6 pr-4',
                      isDropdownActive(item.href)
                        ? 'text-sl-gold-hover'
                        : 'text-sl-mist/60 hover:text-sl-alabaster'
                    )}
                  >
                    <span>{item.label}</span>
                    <svg
                      className={cn(
                        'w-4 h-4 transition-transform duration-300',
                        isDropdownActive(item.href) && 'rotate-180'
                      )}
                      viewBox="0 0 10 6"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isDropdownActive(item.href) && (
                      <motion.div
                        initial={reduced ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={reduced ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
                        transition={reduced ? REDUCED_TRANSITION : { duration: DUR.transition, ease: EASING.easeOutExpo }}
                        className="overflow-hidden pl-6 pr-4 ml-4 border-l border-sl-gold-subtle/30"
                      >
                        <div className="space-y-3 py-3">
                          {item.dropdown.items.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => {
                                onClose();
                                closeAllDropdowns();
                              }}
                              aria-current={pathname === subItem.href ? 'page' : undefined}
                              className={cn(
                                'block text-lg sm:text-xl font-light tracking-tight transition-all duration-300 py-2 pl-4 hover:pl-6',
                                pathname === subItem.href
                                  ? 'text-sl-gold-hover'
                                  : 'text-sl-mist/50 hover:text-sl-alabaster'
                              )}
                            >
                              <span className="inline-block w-1 h-1 bg-sl-gold-subtle/50 mr-3 rounded-full" />
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  transition={
                    reduced
                      ? REDUCED_TRANSITION
                      : {
                          delay: idx * STAGGER_TOKENS.lines,
                          duration: DUR.transition,
                          ease: EASING.easeOutExpo,
                        }
                  }
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={cn(
                      'block text-3xl sm:text-4xl font-light tracking-tighter transition-colors duration-500 py-2 min-h-[44px] flex items-center justify-center',
                      pathname === item.href
                        ? 'text-sl-gold-hover'
                        : 'text-sl-mist/60 hover:text-sl-alabaster'
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              )}
            </React.Fragment>
          ))}

          <motion.div
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={
              reduced
                ? REDUCED_TRANSITION
                : {
                    delay: navItems.length * STAGGER_TOKENS.lines,
                    duration: DUR.transition,
                    ease: EASING.easeOutExpo,
                  }
            }
            className="mt-8 w-full px-6"
          >
            <CurrencySelector />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
