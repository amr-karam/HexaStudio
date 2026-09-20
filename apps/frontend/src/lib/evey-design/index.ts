/**
 * evey-design Plugin
 *
 * Provides 5 design tooling utilities built on the verified HEXA STUDIO
 * token set (apps/frontend/src/app/globals.css + src/lib/motion.ts).
 *
 * @module evey-design
 * @version 1.0.0
 */

// ── Tool: design_token_lookup ──────────────────────────────────────────────
export { design_token_lookup, type TokenLookupResult } from './design_token_lookup'

// ── Tool: scaffold_component ───────────────────────────────────────────────
export { scaffold_component, type ScaffoldOptions, type ScaffoldResult } from './scaffold_component'

// ── Tool: design_audit ─────────────────────────────────────────────────────
export { design_audit, type AuditReport, type AuditViolation } from './design_audit'

// ── Tool: motion_variants ──────────────────────────────────────────────────
export { motion_variants, type MotionVariantOptions, type MotionVariantResult } from './motion_variants'

// ── Tool: a11y_check ───────────────────────────────────────────────────────
export { a11y_check, type A11yCheckResult, type A11yViolation } from './a11y_check'
