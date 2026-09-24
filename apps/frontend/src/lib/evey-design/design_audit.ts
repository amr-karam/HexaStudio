/**
 * design_audit — HEXA STUDIO Design Token Compliance Audit
 *
 * Scans for design token violations against the verified HEXA STUDIO
 * token set (globals.css + motion.ts). Reports violations with severity.
 *
 * @module evey-design/design_audit
 */

/* -------------------------------------------------------------------------- */
/*  Canonical Token Sets — From globals.css and motion.ts                     */
/* -------------------------------------------------------------------------- */

const VALID_COLORS = new Set([
  '#050505', '#020203', '#0F0F10', '#161618', '#1A1A1A',
  '#FAFAF8', '#ffffff', '#000000', '#D4AF37', '#E5C76B', '#A8862E',
  '#60a5fa', '#a855f7', '#f5f5f4', '#1a1a1a', '#A0A0A0', '#6A6A6E',
  '#ef4444', '#10b981', '#71717a', '#f87171', '#fca5a5', '#7f1d1d',
  '#34d399', '#6ee7b7', '#064e3b', '#052e1d', '#7f1d1d',
])

const VALID_EASINGS = new Set([
  'cubic-bezier(0.16, 1, 0.3, 1)',
  'cubic-bezier(0.76, 0, 0.24, 1)',
  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'cubic-bezier(0.25, 0.1, 0.25, 1)',
  'cubic-bezier(0.4, 0, 0.6, 1)',
  'linear',
])

const VALID_DURATIONS = new Set([0.01, 0.2, 0.4, 0.7, 0.75, 0.8, 1.4])

/* -------------------------------------------------------------------------- */
/*  Types                                                                    |
/* -------------------------------------------------------------------------- */

export interface AuditViolation {
  type: 'color' | 'easing' | 'duration' | 'token' | 'motion' | 'typography'
  severity: 'error' | 'warning' | 'info'
  message: string
  location: string
  actual: string
  expected: string
}

export interface AuditReport {
  totalViolations: number
  errors: number
  warnings: number
  info: number
  violations: AuditViolation[]
  passed: boolean
  summary: string
}

/* -------------------------------------------------------------------------- */
/*  Pattern Matchers                                                         |
/* -------------------------------------------------------------------------- */

function extractColors(code: string): string[] {
  const hexPattern = /#[0-9a-fA-F]{3,8}/g
  return code.match(hexPattern) || []
}

function extractEasing(code: string): string[] {
  const bezierPattern = /cubic-bezier\([^)]+\)/g
  return code.match(bezierPattern) || []
}

function extractDurations(code: string): number[] {
  const durationPattern = /duration:\s*([0-9.]+)/g
  const durations: number[] = []
  let match
  while ((match = durationPattern.exec(code)) !== null) {
    durations.push(parseFloat(match[1]))
  }
  const secondsPattern = /duration:\s*([0-9.]+)s/g
  while ((match = secondsPattern.exec(code)) !== null) {
    durations.push(parseFloat(match[1]))
  }
  return durations
}

/* -------------------------------------------------------------------------- */
/*  Audit Functions                                                          |
/* -------------------------------------------------------------------------- */

function auditColors(code: string, _location: string): AuditViolation[] {
  const violations: AuditViolation[] = []
  const colors = extractColors(code)

  for (const color of colors) {
    if (!VALID_COLORS.has(color)) {
      violations.push({
        type: 'color',
        severity: 'error',
        message: `Non-canonical color "${color}" found — must use HEXA STUDIO token`,
        location: _location,
        actual: color,
        expected: 'One of: ' + [...VALID_COLORS].join(', '),
      })
    }
  }

  return violations
}

function auditEasing(code: string, _location: string): AuditViolation[] {
  const violations: AuditViolation[] = []
  const easings = extractEasing(code)

  for (const easing of easings) {
    if (!VALID_EASINGS.has(easing)) {
      violations.push({
        type: 'easing',
        severity: 'warning',
        message: `Non-canonical easing "${easing}" — must use HEXA motion tokens`,
        location: _location,
        actual: easing,
        expected: 'One of: ' + [...VALID_EASINGS].join(', '),
      })
    }
  }

  return violations
}

function auditDurations(code: string, _location: string): AuditViolation[] {
  const violations: AuditViolation[] = []
  const durations = extractDurations(code)

  for (const duration of durations) {
    if (!VALID_DURATIONS.has(duration)) {
      violations.push({
        type: 'duration',
        severity: 'info',
        message: `Duration ${duration}s not in canonical token set`,
        location: _location,
        actual: `${duration}s`,
        expected: 'One of: ' + [...VALID_DURATIONS].join(', '),
      })
    }
  }

  return violations
}

function auditTokens(code: string, _location: string): AuditViolation[] {
  const violations: AuditViolation[] = []

  const rawVarPattern = /var\(--[a-z-]+\)/g
  const matches = code.match(rawVarPattern) || []

  for (const match of matches) {
    const isCanonical = match.includes('--sl-') || match.includes('--color-')
    if (!isCanonical) {
      violations.push({
        type: 'token',
        severity: 'warning',
        message: `Direct CSS var reference "${match}" — prefer token lookup utility`,
        location: _location,
        actual: match,
        expected: 'Use design_token_lookup() or CSS custom properties from globals.css',
      })
    }
  }

  if (code.includes('@ts-ignore')) {
    violations.push({
      type: 'token',
      severity: 'error',
      message: '@ts-ignore is forbidden — fix the type issue instead',
      location: _location,
      actual: '@ts-ignore',
      expected: 'Fix TypeScript types properly',
    })
  }

  if (code.includes('eslint-disable')) {
    violations.push({
      type: 'token',
      severity: 'error',
      message: 'eslint-disable is forbidden — fix the lint issue instead',
      location: _location,
      actual: 'eslint-disable',
      expected: 'Fix ESLint rules properly',
    })
  }

  return violations
}

function auditTypography(code: string, _location: string): AuditViolation[] {
  const violations: AuditViolation[] = []

  const forbiddenFonts = ['Arial', 'Helvetica', 'Roboto', 'system-ui']
  for (const font of forbiddenFonts) {
    if (code.includes(font)) {
      violations.push({
        type: 'typography',
        severity: 'warning',
        message: `Forbidden font "${font}" — use HEXA typography tokens`,
        location: _location,
        actual: font,
        expected: 'Playfair Display, Inter, or JetBrains Mono',
      })
    }
  }

  return violations
}

/* -------------------------------------------------------------------------- */
/*  Main Audit Function                                                      |
/* -------------------------------------------------------------------------- */

export function design_audit(code: string, location: string): AuditReport {
  const violations: AuditViolation[] = []

  violations.push(...auditColors(code, location))
  violations.push(...auditEasing(code, location))
  violations.push(...auditDurations(code, location))
  violations.push(...auditTokens(code, location))
  violations.push(...auditTypography(code, location))

  const errors = violations.filter(v => v.severity === 'error').length
  const warnings = violations.filter(v => v.severity === 'warning').length
  const info = violations.filter(v => v.severity === 'info').length

  const passed = errors === 0 && warnings === 0

  const summary = passed
    ? `Design audit passed for ${location} (${violations.length} checks, 0 violations)`
    : `Design audit failed for ${location}: ${errors} errors, ${warnings} warnings, ${info} info`

  return {
    totalViolations: violations.length,
    errors,
    warnings,
    info,
    violations,
    passed,
    summary,
  }
}

export function design_audit_batch(files: Record<string, string>): Map<string, AuditReport> {
  const results = new Map<string, AuditReport>()
  for (const [loc, code] of Object.entries(files)) {
    results.set(loc, design_audit(code, loc))
  }
  return results
}

export function design_audit_quick(code: string, location: string): boolean {
  return design_audit(code, location).passed
}

export function formatAuditReport(report: AuditReport): string {
  const lines: string[] = []
  lines.push(report.summary)
  lines.push('')

  if (report.violations.length > 0) {
    lines.push('Violations:')
    for (const v of report.violations) {
      const icon = v.severity === 'error' ? '🔴' : v.severity === 'warning' ? '🟡' : '🔵'
      lines.push(`  ${icon} [${v.type}] ${v.message}`)
      lines.push(`     Location: ${v.location}`)
      lines.push(`     Actual: ${v.actual}`)
      lines.push(`     Expected: ${v.expected}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}
