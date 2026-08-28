/**
 * HEXA-NEW Motion Tokens
 * 
 * Animation system for the Bento Grid redesign
 * Built on top of the existing HEXA motion system
 * 
 * @version 1.0.0
 */

import { EASE, DURATION, STAGGER } from '../motion';

// ============================================================================
// BENTO GRID ANIMATION PRESETS
// ============================================================================

export const BENTO_ANIMATION = {
  /** Entrance animation for each card */
  cardEntrance: {
    ease: EASE.entrance,
    duration: DURATION.component,
  },

  /** Stagger timing for grid items */
  stagger: {
    container: STAGGER.component,
    cards: 0.08,
  },

  /** Hover interactions */
  hover: {
    ease: EASE.interaction,
    duration: DURATION.micro,
  },

  /** Focus states */
  focus: {
    ease: EASE.transition,
    duration: DURATION.micro,
  },
} as const;

/**
 * BentoCard entrance variants for Framer Motion
 */
export const bentoCardDefaults = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: BENTO_ANIMATION.cardEntrance,
  },
  exit: {
    opacity: 0,
    y: -24,
    scale: 0.96,
    transition: {
      duration: 0.2,
      ease: EASE.transition,
    },
  },
};

/**
 * Staggered container for Bento Grid
 */
export const bentoGridStagger = (staggerHours: number = BENTO_ANIMATION.stagger.cards) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerHours,
      delayChildren: staggerHours * 2,
    },
  },
});

/**
 * Hover animation for interactive cards
 */
export const hoverLift = {
  whileHover: {
    y: -4,
    scale: 1.02,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5), 0 12px 48px rgba(212, 175, 55, 0.3)',
    transition: {
      duration: 0.3,
      ease: EASE.interaction,
    },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

/**
 * Magnetic hover effect
 */
export const magneticHover = {
  whileHover: {
    scale: 1.05,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

/**
 * Shimmer loading animation
 */
export const shimmerTransition = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  },
};

// ============================================================================
// COMMAND PALETTE ANIMATIONS
// ============================================================================

export const COMMAND_PALETTE_ANIMATION = {
  open: {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: -20,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: EASE.entrance,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.15,
        ease: EASE.transition,
      },
    },
  },

  suggestion: {
    initial: {
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: EASE.entrance,
      },
    },
  },
};

// ============================================================================
// SIDEBAR ANIMATIONS
// ============================================================================

export const SIDEBAR_ANIMATION = {
  collapseExpand: {
    initial: { width: '280px' },
    animate: { width: '72px' },
    transition: {
      duration: 0.4,
      ease: EASE.transition,
    },
  },

  itemHover: {
    hover: {
      x: 4,
      transition: {
        duration: 0.2,
        ease: EASE.interaction,
      },
    },
  },
};

// ============================================================================
// INDEX EXPORT
// ============================================================================

export { hoverLift as DEFAULT_HOVER, magneticHover as MAGNETIC_HOVER };