import { Faixa } from 'styles/Farol';
import { FaixaTitulada } from 'styles/Farol/Titulada';
import { HeroGradientBackground } from './HeroGradientBackground';
import { Button } from './Button';
import { Link } from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const HeroSection = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Header with Nav */}
      <FaixaTitulada classes={{ backdrop: 'bg-gradient-primary' }}>
        <Faixa as='header' className='sticky top-0 z-[var(--z-snake)] bg-transparent'>
          <FaixaTitulada classes={{ title: 'text-primary-100 text-lg md:text-xl md:tracking-tight' }}>
            HEXA STUDIO
          </FaixaTitulada>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className='md:hidden p-2 text-primary-100 hover:text-primary-500 focus:outline-none'
          >
            {showMenu ? (
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l9 9' />
              </svg>
            ) : (
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            )}
          </button>

          {/* Navigation links */}
          <nav className='hidden md:flex md:space-x-4'>
            {[['Home', 'About', 'Projects', 'Contact'].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase()}`}
                className='text-primary-100 hover:text-primary-500 font-medium transition-colors'
              >
                {label}
              </Link>
            ))}
          </nav>
        </Faixa>
      </FaixaTitulada>

      {/* Main Hero Content */}
      <HeroGradientBackground>
        <div className='relative flex flex-col items-center justify-center min-h-screen px-4 py-12 md:py-20 text-center md:text-left'>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition='fade-in'
            className='text-display font-bold text-6xl tracking-tight leading-none text-primary-100'
          >
            Spatial Design
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition='fade-in'
            className='mt-4 max-w-2xl text-xl text-neutral-200'
          >
            Where architecture meets generative artistry. Explore immersive 3D worlds crafted with precision and poetry.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition='scale-up'
            className='mt-8 flex flex-col sm:flex-row sm:space-x-4'
          >
            <Button variant='contained' className='relative bg-primary-500 hover:bg-primary-600 transition-colors'>
              Start Exploring
            </Button>

            <Link href="/about" className='relative ml-6 text-sm text-neutral-400 hover:text-white transition-colors underline decoration-primary-500'>
              About
            </Link>
          </motion.div>
        </HeroGradientBackground>
      </>
    </>
  );
};

export default HeroSection;