'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItemProps {
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ label, href, active, onClick }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      'relative py-2 text-[10px] uppercase tracking-[0.3em] transition-colors duration-500',
      active
        ? 'text-accent'
        : 'text-neutral-500 hover:text-foreground'
    )}
  >
    {label}
    {active && (
      <motion.span
        layoutId="nav-indicator"
        className="absolute -bottom-1 left-0 h-[1px] w-full bg-accent"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Services', href: '/services' },
    { label: 'Blog', href: '/blog' },
    { label: 'Studio', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 transition-all duration-700 ease-out-expo',
          isScrolled
            ? 'py-4 bg-background/60 backdrop-blur-2xl border-b border-border/50'
            : 'py-8 bg-transparent'
        )}
      >
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.5, ease: 'var(--ease-luxury)' }}
          >
            <Image
              src="/logo.webp"
              alt="HexaStudio Logo"
              width={32}
              height={32}
              className="transition-transform duration-500"
            />
          </motion.div>
          <span className="text-xs font-medium uppercase tracking-[0.4em] text-foreground group-hover:text-accent transition-colors duration-500">
            HexaStudio
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-16">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 py-2"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block h-[1px] w-6 bg-foreground transition-transform duration-300"
          />
          <motion.span
            animate={isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
            className="block h-[1px] w-6 bg-foreground transition-all duration-300"
          />
          <motion.span
            animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block h-[1px] w-6 bg-foreground transition-transform duration-300"
          />
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'var(--ease-out-expo)' }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-16 bg-background/98 backdrop-blur-3xl"
          >
            {navItems.map((item, idx) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: idx * 0.1, duration: 0.8, ease: 'var(--ease-out-expo)' }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'text-4xl font-light tracking-tighter transition-colors duration-500',
                    pathname === item.href
                      ? 'text-accent'
                      : 'text-neutral-500 hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
