/**
 * scaffold_component — HEXA STUDIO Component Scaffolding
 *
 * Generates a production-ready component scaffold using verified
 * HEXA STUDIO design tokens and motion system.
 *
 * @module evey-design/scaffold_component
 */

import type { Variants, Transition } from 'framer-motion'

/* -------------------------------------------------------------------------- */
/*  Token References                                                         */
/* -------------------------------------------------------------------------- */

const TOKEN_COLORS = {
  void: '#050505',
  voidDeep: '#020203',
  obsidian: '#0F0F10',
  obsidianRaised: '#161618',
  gold: '#D4AF37',
  goldBright: '#E5C76B',
  alabaster: '#FAFAF8',
  fg: '#1a1a1a',
  bg: '#ffffff',
  border: '#f5f5f4',
  muted: '#71717a',
} as const

const TOKEN_MOTION = {
  easeEntrance: [0.16, 1, 0.3, 1] as const,
  easeCinematic: [0.76, 0, 0.24, 1] as const,
  easeInteraction: [0.34, 1.56, 0.64, 1] as const,
  easeTransition: [0.25, 0.1, 0.25, 1] as const,
  easeSharp: [0.4, 0, 0.6, 1] as const,
  durationMicro: 0.2,
  durationComponent: 0.4,
  durationScene: 0.8,
  durationTransition: 0.7,
  staggerComponent: 0.05,
} as const

/* -------------------------------------------------------------------------- */
/*  Types                                                                    */
/* -------------------------------------------------------------------------- */

export interface ScaffoldOptions {
  /** Component name (PascalCase) */
  name: string
  /** Component variant */
  variant?: 'default' | 'glass' | 'outline' | 'filled' | 'minimal'
  /** Whether to include motion variants */
  animated?: boolean
  /** Whether to include dark mode support */
  darkMode?: boolean
  /** Motion preset to apply */
  motionPreset?: 'fadeLift' | 'scaleSpring' | 'overlay' | 'textReveal' | 'modalPanel' | 'none'
  /** Additional CSS class names */
  className?: string
  /** Custom props to include */
  props?: Record<string, string>
  /** Whether this is a client component */
  clientComponent?: boolean
}

export interface ScaffoldResult {
  /** File path for the component */
  filePath: string
  /** Generated component code */
  code: string
  /** Generated styles */
  styles: string
  /** Motion variants if animated */
  variants?: Variants
  /** Framer Motion transition if animated */
  transition?: Transition
}

/* -------------------------------------------------------------------------- */
/*  Motion Variant Generators                                                */
/* -------------------------------------------------------------------------- */

function getMotionPreset(preset: string): { variants: Variants; transition: Transition } | undefined {
  switch (preset) {
    case 'fadeLift':
      return {
        variants: {
          hidden: { opacity: 0, y: 24 },
          visible: (reduced: boolean) => reduced
            ? { opacity: 1, y: 0, transition: { duration: 0.01, ease: TOKEN_MOTION.easeSharp } }
            : { opacity: 1, y: 0, transition: { duration: TOKEN_MOTION.durationComponent, ease: TOKEN_MOTION.easeEntrance } },
          exit: { opacity: 0, y: 24, transition: { duration: 0.25 } },
        },
        transition: { duration: TOKEN_MOTION.durationComponent, ease: TOKEN_MOTION.easeEntrance },
      }
    case 'scaleSpring':
      return {
        variants: {
          hidden: { opacity: 0, scale: 0.92 },
          visible: (reduced: boolean) => reduced
            ? { opacity: 1, scale: 1, transition: { duration: 0.01, ease: TOKEN_MOTION.easeSharp } }
            : { opacity: 1, scale: 1, transition: { duration: TOKEN_MOTION.durationComponent, ease: TOKEN_MOTION.easeInteraction } },
        },
        transition: { duration: TOKEN_MOTION.durationComponent, ease: TOKEN_MOTION.easeInteraction },
      }
    case 'overlay':
      return {
        variants: {
          hidden: { opacity: 0 },
          visible: (reduced: boolean) => reduced
            ? { opacity: 1, transition: { duration: 0.01 } }
            : { opacity: 1, transition: { duration: 0.4 } },
          exit: { opacity: 0, transition: { duration: 0.3 } },
        },
        transition: { duration: 0.4 },
      }
    case 'textReveal':
      return {
        variants: {
          hidden: { y: '110%' },
          visible: (reduced: boolean) => reduced
            ? { y: '0%', transition: { duration: 0.01, ease: TOKEN_MOTION.easeSharp } }
            : { y: '0%', transition: { duration: TOKEN_MOTION.durationScene, ease: TOKEN_MOTION.easeEntrance } },
        },
        transition: { duration: TOKEN_MOTION.durationScene, ease: TOKEN_MOTION.easeEntrance },
      }
    case 'modalPanel':
      return {
        variants: {
          hidden: { opacity: 0, scale: 0.94, y: 16 },
          visible: (reduced: boolean) => reduced
            ? { opacity: 1, scale: 1, y: 0, transition: { duration: 0.01, ease: TOKEN_MOTION.easeSharp } }
            : { opacity: 1, scale: 1, y: 0, transition: { duration: TOKEN_MOTION.durationTransition, ease: TOKEN_MOTION.easeTransition } },
          exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.25, ease: TOKEN_MOTION.easeSharp } },
        },
        transition: { duration: TOKEN_MOTION.durationTransition, ease: TOKEN_MOTION.easeTransition },
      }
    default:
      return undefined
  }
}

/* -------------------------------------------------------------------------- */
/*  Style Generators                                                         */
/* -------------------------------------------------------------------------- */

function getVariantStyles(variant: string, animated: boolean, darkMode: boolean): string {
  const dark = darkMode
    ? `--sc-bg: ${TOKEN_COLORS.void};\n    --sc-fg: ${TOKEN_COLORS.alabaster};\n    --sc-border: ${TOKEN_COLORS.obsidianRaised};`
    : `--sc-bg: ${TOKEN_COLORS.bg};\n    --sc-fg: ${TOKEN_COLORS.fg};\n    --sc-border: ${TOKEN_COLORS.border};`

  const variantStyles: Record<string, string> = {
    default: `background: var(--sc-bg);\n    color: var(--sc-fg);\n    border: 1px solid var(--sc-border);`,
    glass: `background: rgba(255, 255, 255, 0.05);\n    backdrop-filter: blur(12px);\n    -webkit-backdrop-filter: blur(12px);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    color: var(--sc-fg);`,
    outline: `background: transparent;\n    border: 2px solid ${TOKEN_COLORS.gold};\n    color: ${TOKEN_COLORS.gold};`,
    filled: `background: ${TOKEN_COLORS.gold};\n    color: ${TOKEN_COLORS.void};\n    border: none;`,
    minimal: `background: transparent;\n    border: none;\n    color: var(--sc-fg);`,
  }

  const base = variantStyles[variant] || variantStyles.default
  return `${dark}\n${base}`
}

/* -------------------------------------------------------------------------- */
/*  Component Code Builders                                                  */
/* -------------------------------------------------------------------------- */

function buildComponentCode(opts: {
  name: string
  variant: string
  animated: boolean
  motionPreset: string
  className: string
  props: Record<string, string>
  clientComponent: boolean
  hasVariants: boolean
  transitionObj: Transition | undefined
}): string {
  const { name, variant, animated, motionPreset, className, props, clientComponent, hasVariants, transitionObj } = opts

  const useClient = clientComponent ? `'use client'\n` : ''
  const motionImport = animated
    ? `\nimport { ${motionPreset} } from '@/lib/motion';\n`
    : ''
  const fmImport = animated ? "import { motion } from 'framer-motion';\n" : ''
  const propInterface = Object.keys(props).length > 0
    ? `\ninterface ${name}Props {\n${Object.entries(props).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n`
    : ''

  const variantCode = animated && hasVariants
    ? `const ${name}Variants = ${JSON.stringify(
        hasVariants ? undefined : {},
        null,
        2,
      )};\n`
    : ''

  // Build the actual component body
  let body: string
  if (animated && hasVariants) {
    const styleStr = variant === 'glass'
      ? `\n      style={{\n        background: 'rgba(255,255,255,0.05)',\n        backdropFilter: 'blur(12px)',\n        WebkitBackdropFilter: 'blur(12px)',\n      }}`
      : ''
    body = `  return (\n    <motion.div\n      variants={${name}Variants}\n      initial="hidden"\n      animate="visible"\n      exit="exit"\n      transition={${JSON.stringify(transitionObj)}}\n      className="${className}"${styleStr}\n    >\n      {/* Content */}\n    </motion.div>\n  )`
  } else {
    const styleStr = variant === 'glass'
      ? `\n      style={{\n        background: 'rgba(255,255,255,0.05)',\n        backdropFilter: 'blur(12px)',\n        WebkitBackdropFilter: 'blur(12px)',\n      }}`
      : ''
    body = `  return (\n    <div className="${className}"${styleStr}>\n      {/* Content */}\n    </div>\n  )`
  }

  const jsDoc = `/**\n * ${name} — Auto-scaffolded with HEXA STUDIO design tokens\n * Variant: ${variant} | Animated: ${animated} | Dark Mode: ${opts.clientComponent}\n */\n`

  return `${useClient}${fmImport}${motionImport}${propInterface}${variantCode}\n${jsDoc}export function ${name}(${Object.keys(props).join(', ')}) {\n${body}\n}`
}

/* -------------------------------------------------------------------------- */
/*  Main Scaffold Function                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Scaffold a production-ready React component with HEXA STUDIO design tokens.
 *
 * @param options - Scaffolding options
 * @returns ScaffoldResult with file path, generated code, and styles
 *
 * @example
 * ```ts
 * const result = scaffold_component({
 *   name: 'HeroSection',
 *   variant: 'glass',
 *   animated: true,
 *   motionPreset: 'fadeLift',
 *   darkMode: true,
 * })
 * ```
 */
export function scaffold_component(options: ScaffoldOptions): ScaffoldResult {
  const {
    name,
    variant = 'default',
    animated = false,
    darkMode = false,
    motionPreset = 'none',
    className = '',
    props = {},
    clientComponent = true,
  } = options

  const filePath = `apps/frontend/src/components/${name}.tsx`

  // Build motion variants if animated
  let variants: Variants | undefined
  let transitionObj: Transition | undefined
  let hasVariants = false

  if (animated && motionPreset !== 'none') {
    const preset = getMotionPreset(motionPreset)
    if (preset) {
      variants = preset.variants
      transitionObj = preset.transition
      hasVariants = true
    }
  }

  // Build the component code using the builder
  const componentCode = buildComponentCode({
    name,
    variant,
    animated,
    motionPreset,
    className,
    props,
    clientComponent,
    hasVariants,
    transitionObj,
  })

  const styles = getVariantStyles(variant, animated, darkMode)

  return {
    filePath,
    code: componentCode,
    styles,
    variants,
    transition: transitionObj,
  }
}

/**
 * Generate the import path for a scaffolded component.
 */
export function getComponentImportPath(name: string): string {
  return `@/components/${name}`
}

/**
 * Generate a complete file tree for a multi-file component.
 */
export function scaffoldComponentFiles(name: string, options: ScaffoldOptions): Record<string, string> {
  const base = scaffold_component({ ...options, name })
  const files: Record<string, string> = {
    [base.filePath]: base.code,
    [`apps/frontend/src/components/${name}.css`]: `/* ${name} styles — HEXA STUDIO tokens */\n${base.styles}`,
  }
  return files
}
