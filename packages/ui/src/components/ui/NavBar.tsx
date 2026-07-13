'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface NavBarProps {
  logo?: React.ReactNode;
  links?: { label: string; href: string }[];
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

export const NavBar = ({ logo, links, ctaText, ctaHref, className }: NavBarProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-40 transition-all duration-500 px-8 py-4 flex items-center justify-between",
      scrolled ? "bg-obsidian/40 backdrop-blur-lg border-b border-white/10 py-3" : "bg-transparent py-6",
      className
    )}>
      <div className="flex items-center gap-2 font-serif text-2xl font-bold text-white">
        {logo || (
          <>
            HEXA <span className="text-gold">STUDIO</span>
          </>
        )}
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        {links?.map((link) => (
          <a 
            key={link.href} 
            href={link.href} 
            className="relative text-sm uppercase tracking-widest text-white/60 hover:text-white transition-colors group"
          >
            {link.label}
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
          </a>
        ))}
      </div>

      {ctaText && (
        <Button variant="primary" size="sm" className="rounded-full px-6" asChild>
          <a href={ctaHref}>{ctaText}</a>
        </Button>
      )}
    </nav>
  );
};
