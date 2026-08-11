'use client';

import { HeroGradientBackground } from './HeroGradientBackground';
import { Button } from './Button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

const NAV_LINKS = ['Home', 'About', 'Projects', 'Contact'] as const;

export const HeroSection = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Header with Nav */}
      <header className="sticky top-0 z-10 bg-transparent">
        <div className="bg-gradient-primary">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-primary-100 text-lg md:text-xl md:tracking-tight font-display">
              HEXA STUDIO
            </span>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 text-primary-100 hover:text-primary-500 focus:outline-none"
              aria-label="Toggle menu"
              aria-expanded={showMenu}
            >
              {showMenu ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l9 9" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Navigation links */}
            <nav className="hidden md:flex md:space-x-4">
              {NAV_LINKS.map((label) => (
                <Link
                  key={label}
                  href={`/${label.toLowerCase()}`}
                  className="text-primary-100 hover:text-primary-500 font-medium transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <HeroGradientBackground>
        <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12 md:py-20 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-display font-bold text-6xl tracking-tight leading-none text-primary-100"
          >
            Spatial Design
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl text-xl text-neutral-200"
          >
            Where architecture meets generative artistry. Explore immersive 3D worlds crafted with precision and poetry.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row sm:space-x-4"
          >
            <Button variant="primary" className="relative bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] transition-colors">
              Start Exploring
            </Button>

            <Link
              href="/about"
              className="relative ml-6 text-sm text-neutral-400 hover:text-white transition-colors underline decoration-primary-500"
            >
              About
            </Link>
          </motion.div>
        </div>
      </HeroGradientBackground>
    </>
  );
};

export default HeroSection;
