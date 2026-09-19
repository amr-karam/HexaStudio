/**
 * a11y_check — HEXA STUDIO Accessibility Compliance Check
 *
 * Scans components for accessibility violations against WCAG 2.1 AA standards
 * and HEXA STUDIO's motion accessibility contract (prefers-reduced-motion).
 *
 * @module evey-design/a11y_check
 */

/* -------------------------------------------------------------------------- */
/*  Token Definitions                                                          |
/* -------------------------------------------------------------------------- */

import { REDUCED_TRANSITION } from '../motion'

/* -------------------------------------------------------------------------- */
/*  Types                                                                    |
/* -------------------------------------------------------------------------- */

export interface A11yViolation {
  rule: string
  severity: 'error' | 'warning' | 'info'
  message: string
  element?: string
  impact: 'critical' | 'serious' | 'moderate'
  wcagLevel: 'A' | 'AA' | 'AAA'
  suggestion: string
}

export interface A11yCheckResult {
  passed: boolean
  violations: A11yViolation[]
  totalViolations: number
  errors: number
  warnings: number
  info: number
  score: number // 0-100
  summary: string
}

/* -------------------------------------------------------------------------- */
/*  Accessibility Rules                                                      |
/* -------------------------------------------------------------------------- */

/**
 * Check for missing alt attributes on images.
 */
function checkAltText(code: string, _location: string): A11yViolation[] {
  const violations: A11yViolation[] = []
  const imgPattern = /<img[^>]*>/g
  const matches = code.match(imgPattern) || []

  for (const img of matches) {
    if (!img.includes('alt=') && !img.includes('aria-label')) {
      violations.push({
        rule: 'image-alt',
        severity: 'error',
        message: 'Image missing alt attribute or aria-label',
        element: img.slice(0, 50),
        impact: 'critical',
        wcagLevel: 'A',
        suggestion: 'Add alt="" for decorative images or a descriptive alt attribute for informative images',
      })
    }
  }

  return violations
}

/**
 * Check for missing aria-label or aria-labelledby on interactive elements.
 */
function checkInteractiveLabels(code: string, _location: string): A11yViolation[] {
  const violations: A11yViolation[] = []

  // Check buttons without accessible names
  const buttonPattern = /<button[^>]*>/g
  const buttons = code.match(buttonPattern) || []
  for (const btn of buttons) {
    if (!btn.includes('aria-label') && !btn.includes('aria-labelledby') && !btn.includes('>') && !btn.includes('title=')) {
      violations.push({
        rule: 'button-name',
        severity: 'error',
        message: 'Button missing accessible name',
        element: btn.slice(0, 50),
        impact: 'critical',
        wcagLevel: 'A',
        suggestion: 'Add aria-label, aria-labelledby, or inner text content',
      })
    }
  }

  return violations
}

/**
 * Check for missing form labels.
 */
function checkFormLabels(code: string, _location: string): A11yViolation[] {
  const violations: A11yViolation[] = []

  const inputPattern = /<input[^>]*>/g
  const inputs = code.match(inputPattern) || []
  for (const input of inputs) {
    if (!input.includes('aria-label') && !input.includes('aria-labelledby') && !input.includes('id=') && !input.includes('name=')) {
      violations.push({
        rule: 'label',
        severity: 'warning',
        message: 'Input missing associated label',
        element: input.slice(0, 50),
        impact: 'serious',
        wcagLevel: 'A',
        suggestion: 'Add htmlFor/id pairing or aria-label',
      })
    }
  }

  return violations
}

/**
 * Check for missing heading hierarchy (h1 > h2 > h3...).
 */
function checkHeadingHierarchy(code: string, _location: string): A11yViolation[] {
  const violations: A11yViolation[] = []

  const headingPattern = /<h([1-6])[^>]*>/g
  const headings: { level: number; index: number }[] = []
  let match

  while ((match = headingPattern.exec(code)) !== null) {
    headings.push({ level: parseInt(match[1]), index: match.index })
  }

  // Check for skipped levels (e.g., h1 -> h3)
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1]
    const curr = headings[i]
    if (curr.level - prev.level > 1) {
      violations.push({
        rule: 'heading-order',
        severity: 'warning',
        message: `Heading level skipped from h${prev.level} to h${curr.level}`,
        impact: 'moderate',
        wcagLevel: 'AA',
        suggestion: `Use h${prev.level + 1} instead of h${curr.level}`,
      })
    }
  }

  // Check for missing h1
  const hasH1 = headings.some(h => h.level === 1)
  if (!hasH1) {
    violations.push({
      rule: 'page-has-heading',
      severity: 'warning',
      message: 'Page missing h1 heading',
      impact: 'serious',
      wcagLevel: 'A',
      suggestion: 'Add a single h1 heading to the page',
    })
  }

  return violations
}

/**
 * Check for reduced-motion support (HEXA STUDIO motion accessibility contract).
 */
function checkReducedMotion(code: string, _location: string): A11yViolation[] {
  const violations: A11yViolation[] = []

  // Check if motion components respect prefers-reduced-motion
  const motionPattern = /<motion\.\w+/g
  const hasMotion = motionPattern.test(code)

  if (hasMotion && !code.includes('prefers-reduced-motion') && !code.includes('reduced') && !code.includes('reduce')) {
    violations.push({
      rule: 'motion-reduced',
      severity: 'warning',
      message: 'Motion component may not respect prefers-reduced-motion',
      impact: 'serious',
      wcagLevel: 'AA',
      suggestion: 'Wrap motion variants with reduced motion check or use REDUCED_TRANSITION',
    })
  }

  // Check if REDUCED_TRANSITION is imported/used
  if (hasMotion && !code.includes('REDUCED_TRANSITION') && !code.includes('reducedMotion')) {
    violations.push({
      rule: 'motion-reduced-fallback',
      severity: 'info',
      message: 'No reduced motion fallback detected in motion usage',
      impact: 'moderate',
      wcagLevel: 'AA',
      suggestion: 'Import REDUCED_TRANSITION from @/lib/motion for safe fallbacks',
    })
  }

  return violations
}

/**
 * Check for focus management (focus-visible styles).
 */
function checkFocusVisible(code: string, _location: string): A11yViolation[] {
  const violations: A11yViolation[] = []

  // Check for interactive elements without focus styles
  const interactivePattern = /onClick|onPress|onPointerDown/g
  const hasInteractions = interactivePattern.test(code)

  if (hasInteractions && !code.includes('focus-visible') && !code.includes('focusVisible') && !code.includes(':focus')) {
    violations.push({
      rule: 'focus-visible',
      severity: 'warning',
      message: 'Interactive element missing focus-visible styles',
      impact: 'serious',
      wcagLevel: 'AA',
      suggestion: 'Add focus-visible ring styles matching the HEXA STUDIO ring token',
    })
  }

  return violations
}

/**
 * Check color contrast (simplified heuristic based on token values).
 */
function checkContrast(code: string, _location: string): A11yViolation[] {
  const violations: A11yViolation[] = []

  // Check for light text on light backgrounds (common issue)
  const lightTextPattern = /#[Ee][Aa][Ff]{2,}|#[Ff][Aa][Ff]{2,}|#FAFAF8|#fafaf9/g
  const lightBgPattern = /#[Ff][Aa][Ff]{2,}|#fafaf9|#f5f5f4|#f5f4f2/g

  const lightTexts = code.match(lightTextPattern) || []
  const lightBgs = code.match(lightBgPattern) || []

  // If both light text and light bg are used in the same component, warn
  if (lightTexts.length > 0 && lightBgs.length > 0) {
    violations.push({
      rule: 'color-contrast',
      severity: 'warning',
      message: 'Possible low contrast: light text on light background detected',
      impact: 'serious',
      wcagLevel: 'AA',
      suggestion: 'Use --color-gold (#D4AF37) or other high-contrast tokens for text on light backgrounds',
    })
  }

  return violations
}

/**
 * Check for ARIA attributes on custom components.
 */
function checkAriaAttributes(code: string, _location: string): A11yViolation[] {
  const violations: A11yViolation[] = []

  // Check for role="button" without aria-label
  const roleButtonPattern = /role=["']button["']/g
  const roleButtons = code.match(roleButtonPattern) || []
  if (roleButtons.length > 0 && !code.includes('aria-label') && !code.includes('aria-labelledby')) {
    violations.push({
      rule: 'aria-required-attr',
      severity: 'warning',
      message: 'role="button" without aria-label',
      impact: 'serious',
      wcagLevel: 'A',
      suggestion: 'Add aria-label to elements with role="button"',
    })
  }

  return violations
}

/**
 * Check for lang attribute on the document.
 */
function checkLangAttribute(code: string, _location: string): A11yViolation[] {
  const violations: A11yViolation[] = []

  if (!code.includes('lang=') && !code.includes('lang="') && !code.includes("lang='")) {
    violations.push({
      rule: 'html-has-lang',
      severity: 'error',
      message: 'Missing lang attribute on <html> element',
      impact: 'critical',
      wcagLevel: 'A',
      suggestion: 'Add lang="en" (or appropriate language) to the <html> tag',
    })
  }

  return violations
}

/* -------------------------------------------------------------------------- */
/*  Main Check Function                                                      |
/* -------------------------------------------------------------------------- */

/**
 * Run accessibility compliance check on source code.
 *
 * @param code - Source code to audit
 * @param location - File path or identifier
 * @returns A11yCheckResult with all violations and a compliance score
 *
 * @example
 * ```ts
 * const result = a11y_check(componentCode, 'HeroSection.tsx')
 * if (!result.passed) console.warn(result.summary)
 * ```
 */
export function a11y_check(code: string, location: string): A11yCheckResult {
  const violations: A11yViolation[] = []

  violations.push(...checkAltText(code, location))
  violations.push(...checkInteractiveLabels(code, location))
  violations.push(...checkFormLabels(code, location))
  violations.push(...checkHeadingHierarchy(code, location))
  violations.push(...checkReducedMotion(code, location))
  violations.push(...checkFocusVisible(code, location))
  violations.push(...checkContrast(code, location))
  violations.push(...checkAriaAttributes(code, location))
  violations.push(...checkLangAttribute(code, location))

  const errors = violations.filter(v => v.severity === 'error').length
  const warnings = violations.filter(v => v.severity === 'warning').length
  const info = violations.filter(v => v.severity === 'info').length

  const score = Math.max(0, 100 - errors * 10 - warnings * 5)
  const passed = errors === 0

  const summary = passed
    ? `✅ Accessibility check passed for ${location} (score: ${score}/100)`
    : `❌ Accessibility check failed for ${location}: ${errors} errors, ${warnings} warnings (score: ${score}/100)`

  return {
    passed,
    violations,
    totalViolations: violations.length,
    errors,
    warnings,
    info,
    score,
    summary,
  }
}

/**
 * Batch accessibility check across multiple files.
 */
export function a11y_check_batch(files: Record<string, string>): Map<string, A11yCheckResult> {
  const results = new Map<string, A11yCheckResult>()
  for (const [location, code] of Object.entries(files)) {
    results.set(location, a11y_check(code, location))
  }
  return results
}

/**
 * Get the reduced-motion transition for safe motion fallbacks.
 * Re-exports from motion.ts for convenience.
 */
export function getReducedMotionTransition() {
  return REDUCED_TRANSITION
}

/**
 * Generate a compliance badge string.
 */
export function getA11yBadge(result: A11yCheckResult): string {
  if (result.passed && result.score >= 90) return '🟢 AAA'
  if (result.passed && result.score >= 70) return '🟡 AA'
  if (result.passed) return '🟠 A'
  return '🔴 Fail'
}
