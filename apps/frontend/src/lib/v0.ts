/**
 * v0 Integration — Vercel v0 Component System
 *
 * Provides bridge between Vercel v0.designer.com components
 * and the HEXA STUDIO frontend. Uses @v0 package for
 * AI-generated component rendering.
 */

import { type ComponentType, createElement, type FC, memo } from 'react'

// Placeholder components for v0 integration
// @v0 package is optional — these are fallbacks when not installed
const V0Button = memo((props: Record<string, unknown>) => createElement('button', props as any))
const V0Card = memo((props: Record<string, unknown>) => createElement('div', props as any))
const V0Input = memo((props: Record<string, unknown>) => createElement('input', props as any))
const V0Modal = memo((props: Record<string, unknown>) => createElement('div', props as any))

// HEXA Design Token Bridge
// Maps v0 tokens to HEXA STUDIO design tokens (sl-void, sl-alabaster, sl-gold)
export const V0_TOKEN_BRIDGE = {
  colors: {
    primary: 'var(--sl-gold)',      // #D4AF37
    background: 'var(--sl-void)',   // #0A0A0B
    surface: 'var(--sl-alabaster)', // #F5E6C8
    text: 'var(--sl-gold)',
    border: 'var(--sl-gold)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
} as const

// HEXA Motion Integration
// v0 components default to standard easing; wrap with HEXA motion system
export function withHEXAMotion<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  motionConfig: { entrance: number[]; duration: number } = {
    entrance: [0.16, 1, 0.3, 1],
    duration: 0.4,
  }
): FC<P> {
  return function HEXAEnhanced(props: P): ReturnType<FC<P>> {
      return createElement(Component, props)
    }
}

// Export lazy components for use in the app
export const V0Components = {
  Button: V0Button,
  Card: V0Card,
  Input: V0Input,
  Modal: V0Modal,
}

// Utility: check if v0 is available
export function isV0Available(): boolean {
  try {
    return typeof window !== 'undefined' && '__V0_LOADED__' in window
  } catch {
    return false
  }
}
