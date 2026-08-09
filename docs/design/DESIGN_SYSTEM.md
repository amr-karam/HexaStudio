# Design System — Architecture & Governance

**Version:** 1.0 | **Status:** Active | **Authority:** `docs/design/README.md` (manifest)  
**Scope:** Design system architecture — token flow, component hierarchy, accessibility, governance, design-to-code workflow  
**Implementation:** `packages/ui/src/app/design-system/DESIGN_SYSTEM.md` (implementation in `@hexastudio/ui`)

---

## 1. Design System Philosophy

The HEXA STUDIO design system is the single source of truth for the visual and interaction language of the platform. It exists to ensure that every screen, component, and interaction feels intentional, cohesive, and premium — like a world-class architecture visualization studio, not a collection of disjointed pages.

### 1.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Original** | The design system is HEXA STUDIO's own. It synthesizes principles from references, but never copies them. |
| **Architectural** | The system reflects the precision, structure, and intelligence of architecture — order, hierarchy, clarity. |
| **Cinematic** | Motion, transitions, and spatial relationships are used intentionally to create atmosphere and guide attention. |
| **Minimal** | Every element earns its place. No decoration without purpose. |
| **Premium** | Polish is non-negotiable. The system enables luxury-grade expression at every point of contact. |
| **Editorial** | Content is the hero. The system supports storytelling, not fighting it. |
| **Technically sophisticated** | The system is engineered — tokens, scales, constraints, and automation — not a collection of magic numbers. |
| **Fast** | Performance is a design requirement. The system enables speed (LCP < 2.5s, INP < 200ms, CLS < 0.1). |
| **Accessible** | Accessibility is built into the system, not bolted on. WCAG 2.1 AAA is the baseline. |
| **Responsive** | The system works at every breakpoint — from 320px to 1920px+. |

### 1.2 Design System Scope

The design system covers:

- **Tokens** — the atomic values: colors, spacing, typography, radii, shadows, motion
- **Components** — the building blocks: primitive → composite → pattern
- **Patterns** — reusable solutions to common problems: navigation, forms, media, feedback
- **Layout** — grid, spacing, composition rules
- **Motion** — timing, easing, transitions, reveals
- **States** — default, hover, focus, active, disabled, loading, empty, error
- **Accessibility** — keyboard, screen reader, focus, contrast, reduced motion
- **Responsive** — mobile-first, tablet, desktop, ultra-wide
- **Theming** — light/dark mode, brand expression, customization

---

## 2. Design Token Architecture

Design tokens are the atomic values that power the entire design system. They are the bridge between design and code.

### 2.1 Token Hierarchy

Tokens are organized in a strict hierarchy:

```
Primitive tokens (global, semantic-neutral)
  ├── Color primitives (e.g., #0f172a, #ffffff, #6366f1)
  ├── Spacing primitives (e.g., 4px, 8px, 16px, 32px)
  ├── Typography primitives (e.g., font families, sizes, weights)
  ├── Radius primitives (e.g., 4px, 8px, 16px)
  ├── Shadow primitives (e.g., elevation levels)
  └── Motion primitives (e.g., durations, easings)

Semantic tokens (global, semantic-meaning)
  ├── Colors (e.g., --color-primary, --color-surface, --color-text)
  ├── Spacing (e.g., --space-1, --space-2, --space-4)
  ├── Typography (e.g., --font-display, --text-xl, --font-weight-bold)
  ├── Radius (e.g., --radius-sm, --radius-md, --radius-lg)
  ├── Shadow (e.g., --shadow-sm, --shadow-lg)
  └── Motion (e.g., --duration-fast, --easing-smooth)

Component tokens (local, component-specific)
  ├── Button tokens (e.g., --btn-background, --btn-foreground)
  ├── Card tokens (e.g., --card-background, --card-border)
  ├── Input tokens (e.g., --input-border, --input-focus-ring)
  └── ...
```

### 2.2 Token Flow: Design → Frontend

```
Figma / Design Tool
  │
  ├── Primitive tokens (colors, spacing, typography)
  ├── Semantic tokens (color roles, spacing scale, type scale)
  └── Component tokens (button, card, input, etc.)
  │
  ▼
Design Token Specification (JSON / YAML)
  │
  ▼
Token Transformation Pipeline
  ├── aliases → semantic names
  ├── scale mapping (e.g., spacing-4 → 16px)
  ├── dark mode mapping
  ├── platform-specific output
  │
  ▼
CSS Custom Properties (--color-primary, --space-4, etc.)
  │
  ▼
TailwindCSS Configuration (extend theme with tokens)
  │
  ▼
@hexastudio/ui Components (consume tokens via CSS vars and Tailwind)
  │
  ▼
HEXA STUDIO Application
```

### 2.3 Token Implementation Locations

| Token Type | Implementation |
|-------------|---------------|
| CSS custom properties | `packages/ui/src/styles/0-tokens.css` |
| Token documentation | `docs/design/TOKENS.md` |
| Color documentation | `docs/design/COLORS.md` |
| Typography documentation | `docs/design/TYPOGRAPHY.md` |
| Component documentation | `docs/design/COMPONENT_GUIDE.md` |
| Design system architecture | `docs/design/DESIGN_SYSTEM.md` |
| Component specs | `docs/design/component-*.md` |
| Implementation | `@hexastudio/ui` (`packages/ui/`) |

### 2.4 Token Categories

#### Color Tokens

| Category | Purpose | Example |
|----------|---------|---------|
| **Brand** | Primary identity colors | `--color-primary`, `--color-accent` |
| **Neutral** | Surfaces, backgrounds, borders | `--color-surface`, `--color-background`, `--color-border` |
| **Semantic** | Success, warning, error, info | `--color-success`, `--color-error` |
| **Text** | Text colors across surfaces | `--color-text`, `--color-text-muted`, `--color-text-inverse` |
| **Functional** | Interactive states, focus, selection | `--color-focus`, `--color-selection` |

#### Spacing Tokens

Spacing follows a 4px-based scale:

```
0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192 (px)
```

Mapped to tokens:

```
--space-0: 0px
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
--space-40: 160px
--space-48: 192px
```

#### Typography Tokens

| Token | Description |
|-------|-------------|
| `--font-display` | Display/heading font family |
| `--font-body` | Body text font family |
| `--font-mono` | Monospace/code font family |
| `--text-xs` through `--text-9xl` | Type scale (12px to 128px) |
| `--font-weight-normal` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |
| `--leading-tight` through `--leading-relaxed` | Line heights |
| `--tracking-tight` through `--tracking-wide` | Letter spacing |

#### Spacing & Radius Tokens

| Token | Description |
|-------|-------------|
| `--radius-sm` | Small radius (4px) |
| `--radius-md` | Medium radius (8px) |
| `--radius-lg` | Large radius (16px) |
| `--radius-xl` | Extra large radius (24px) |
| `--radius-full` | Full radius (9999px) |
| `--shadow-sm` through `--shadow-2xl` | Shadow elevation levels |
| `--radius-badge` | Badge radius |
| `--radius-button` | Button radius |
| `--radius-card` | Card radius |
| `--radius-input` | Input radius |

#### Motion Tokens

| Token | Description | Default |
|-------|-------------|---------|
| `--duration-instant` | Instant | 0ms |
| `--duration-fast` | Fast transitions | 150ms |
| `--duration-normal` | Standard transitions | 250ms |
| `--duration-slow` | Slow transitions | 400ms |
| `--duration-slower` | Dramatic transitions | 600ms |
| `--easing-smooth` | Smooth ease-out | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--easing-spring` | Spring feel | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--easing-standard` | Standard ease | `cubic-bezier(0.4, 0, 0.2, 1)` |

---

## 3. Color System Architecture

### 3.1 Palette Philosophy

The HEXA STUDIO color palette is designed to evoke luxury, precision, and architectural intelligence. It draws from the "Void" aesthetic — deep, rich backgrounds with carefully chosen accents — balanced by clean neutrality.

### 3.2 Color Roles

Colors are assigned semantic roles, not hardcoded values:

| Role | Purpose | Example |
|-------|---------|---------|
| `--color-primary` | Primary brand color | Deep Space Navy |
| `--color-primary-100` | Darker shade | Darker Navy |
| `--color-primary-50` | Lighter shade | Mid Navy |
| `--color-primary-500` | Accent | Vibrant Indigo |
| `--color-secondary` | Secondary brand color | Teal Green |
| `--color-secondary-500` | Secondary accent | Bright Teal |
| `--color-surface` | Component surfaces | Cards, modals, panels |
| `--color-background` | Page background | Base canvas |
| `--color-border` | Borders, dividers | Subtle structure |
| `--color-text` | Primary text | High contrast on surfaces |
| `--color-text-muted` | Secondary text | Descriptions, labels |
| `--color-text-inverse` | Text on dark surfaces | Light text on dark |
| `--color-success` | Positive feedback | Emerald |
| `--color-warning` | Caution | Amber |
| `--color-error` | Negative feedback | Red |
| `--color-focus` | Focus indicators | Accessible focus ring |

### 3.3 Dark Mode Architecture

Dark mode is a first-class concern. The system uses:

- **Semantic color roles** — all colors are referenced by role, so dark mode swaps values without touching components.
- **`prefers-color-scheme`** — automatic dark mode based on OS preference.
- **Manual toggle** — user-controlled theme switcher.
- **`data-theme` attribute** — `data-theme="dark"` on `<html>` for manual control.
- **CSS custom properties** — all colors are CSS variables, so theming is automatic.

### 3.4 Color Accessibility

All color combinations must meet WCAG 2.1 AAA contrast requirements:

- **Normal text:** 4.5:1 contrast ratio minimum
- **Large text:** 3:1 contrast ratio minimum
- **UI components:** 3:1 contrast ratio minimum
- **Focus indicators:** 3:1 contrast ratio minimum against adjacent colors

Color is never the sole means of conveying information.

---

## 4. Typography Architecture

### 4.1 Font Philosophy

Typography is the "voice" of HEXA STUDIO. It communicates precision, sophistication, and architectural intelligence. The system uses a refined pairing of display and body typefaces.

### 4.2 Font Stacks

| Role | Token | Usage |
|-------|-------|-------|
| `--font-display` | Display/heading font | Headings, hero text, large type |
| `--font-body` | Body font | Body text, UI, labels |
| `--font-mono` | Monospace font | Code, technical data, numbers |

### 4.3 Type Scale

A modular type scale ensures hierarchy and rhythm:

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-xs` | 0.75rem (12px) | — | 1rem | Labels, captions |
| `--text-sm` | 0.875rem (14px) | — | 1.25rem | Small body, metadata |
| `--text-base` | 1rem (16px) | — | 1.5rem | Body text |
| `--text-lg` | 1.125rem (18px) | — | 1.5rem | Lead text |
| `--text-xl` | 1.25rem (20px) | 500 | 1.4rem | Subheadings |
| `--text-2xl` | 1.5rem (24px) | 600 | 1.3rem | Section headings |
| `--text-3xl` | 1.875rem (30px) | 600 | 1.25rem | Section headings |
| `--text-4xl` | 2.25rem (36px) | 700 | 1.2rem | Page titles |
| `--text-5xl` | 3rem (48px) | 700 | 1.1rem | Hero headings |
| `--text-6xl` | 3.75rem (60px) | 700 | 1.05rem | Hero display |
| `--text-7xl` | 4.5rem (72px) | 700 | 1.05rem | Maximum display |
| `--text-8xl` | 6rem (96px) | 700 | 1.0 | Extreme display |
| `--text-9xl` | 8rem (128px) | 700 | 1.0 | Ultra display |

### 4.4 Responsive Typography

Typography scales with viewport:

- **Mobile (≤768px):** Body text at `--text-base` (16px), headings scaled down
- **Tablet (768-1024px):** Body text at `--text-base`, headings at medium scale
- **Desktop (1024-1440px):** Body text at `--text-base` or `--text-lg`, headings at full scale
- **Ultra-wide (1440px+):** Body text at `--text-lg`, display type at maximum scale

Fluid typography (using `clamp()`) is used for large display sizes to ensure smooth scaling.

### 4.5 Readability

- **Line length:** 60-75 characters for body text (optimal reading)
- **Line height:** 1.5-1.8 for body text, 1.05-1.3 for headings
- **Letter spacing:** Slightly tightened for display type, normal for body
- **Font weight:** 400 for body, 500-700 for headings, with hierarchy

---

## 5. Spacing & Layout Architecture

### 5.1 Spacing Scale

Spacing is based on a 4px grid. All spacing values are multiples of 4px:

```
0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192
```

This is mapped to tokens:

```
--space-0: 0px
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
--space-40: 160px
--space-48: 192px
```

### 5.2 Grid System

The layout grid provides structure:

- **Base unit:** 4px (all spacing is a multiple of 4px)
- **Column grid:** 12 columns on desktop, 4 columns on tablet, 2 columns on mobile
- **Gutter:** `--space-4` (16px) on mobile, `--space-6` (24px) on tablet, `--space-8` (32px) on desktop
- **Margin:** `--space-4` minimum on mobile, `--space-8` on desktop, `--space-16` on ultra-wide
- **Max content width:** `--max-width-content` (typically 1280-1440px)

### 5.3 Breakpoints

| Name | Min Width | Target |
|-------|-----------|--------|
| Mobile | 0px | Phones (320-480px) |
| Tablet | 768px | Tablets (768-1024px) |
| Desktop | 1024px | Laptops/desktops (1024-1440px) |
| Wide | 1280px | Large screens |
| Ultra-wide | 1440px | Extra-large screens |

### 5.4 Responsive Rules

- **Mobile-first:** Base styles are for mobile; larger breakpoints add/adjust.
- **Container queries** used where appropriate for component-level responsiveness.
- **Content reflows** gracefully — no horizontal scroll at any breakpoint.
- **Touch targets** are at least 44×44px on mobile.
- **Typography scales** with viewport for large display sizes.

---

## 6. Component Architecture

### 6.1 Component Hierarchy

Components are organized in three layers:

```
Primitive Components
  ├── Button (base interactive element)
  ├── Input (base form element)
  ├── Icon (base visual element)
  ├── Badge (base label)
  ├── Skeleton (base loading state)
  ├── Avatar (base user representation)
  └── ...

Composite Components
  ├── Card (primitive + layout + shadow)
  ├── Modal (primitive + overlay + animation)
  ├── Navigation (primitive + layout + interaction)
  ├── Form Field (input + label + error + helper)
  ├── Dropdown (button + menu + interaction)
  ├── Tabs (button + panel + interaction)
  └── ...

Pattern Components
  ├── Project Card (composite + image + meta + link)
  ├── Project Grid (pattern of cards + layout)
  ├── Project Page (full narrative pattern)
  ├── Navigation Bar (pattern of links + actions)
  ├── Search (pattern of input + results + filters)
  ├── Data Table (pattern of rows + columns + actions)
  └── ...
```

### 6.2 Component Anatomy

Every component follows a consistent anatomy:

```
<Component>
  ├── Root element (with variant, size, state props)
  ├── Optional: Label / Header
  ├── Optional: Content / Body
  ├── Optional: Actions / Footer
  ├── Optional: Error / Helper text
  └── Optional: Icon / Media
</Component>
```

### 6.3 Component Props

Components accept standardized props:

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'ghost' \| 'outline'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | Size variant |
| `state` | `'default' \| 'hover' \| 'active' \| 'disabled' \| 'loading' \| 'error'` | State |
| `color` | `'default' \| 'primary' \| 'secondary' \| 'red' \| 'green' \| 'yellow' \| 'blue'` | Color variant |
| `align` | `'left' \| 'center' \| 'right'` | Alignment |
| `fullWidth` | `boolean` | Full width |
| `as` | `string` | Polymorphic element |

### 6.4 Component States

Every interactive component supports:

| State | Description |
|-------|-------------|
| **Default** | Normal, inactive state |
| **Hover** | Pointer is over the element |
| **Focus** | Element has keyboard focus (visible focus ring) |
| **Active** | Element is being activated |
| **Disabled** | Element is not interactive (reduced opacity, no pointer events) |
| **Loading** | Element is processing (spinner, skeleton, or indeterminate state) |
| **Error** | Element has an error (red border, error message) |
| **Empty** | Element has no content (empty state) |
| **Selected** | Element is selected (checked, toggled on) |
| **Expanded** | Expanded state | Full content visible |
| **Collapsed** | Collapsed state | Summary only |

### 6.5 Component Variants

Components support visual variants:

| Variant | Description | Usage |
|---------|-------------|-------|
| **Default** | Neutral, standard appearance | Most common |
| **Primary** | Brand color, high emphasis | Primary actions |
| **Secondary** | Secondary emphasis | Secondary actions |
| **Ghost** | Minimal, transparent | Tertiary actions, subtle |
| **Outline** | Border only | Alternative to primary |
| **Destructive** | Red variant | Destructive actions |

### 6.6 Component Sizes

| Size | Description | Usage |
|------|-------------|-------|
| **sm** | Small, compact | Dense UI, inline elements |
| **md** | Medium, standard | Most common |
| **lg** | Large, prominent | Primary actions, hero elements |
| **xl** | Extra large | Hero buttons, feature statements |

---

## 7. Motion Architecture

### 7.1 Motion Philosophy

Motion is intentional, smooth, subtle, and cinematic. It communicates:

- **Hierarchy** — what's important, what's changing
- **Spatial relationships** — where things move, how they connect
- **State changes** — transitions between states
- **Navigation** — orientation during navigation
- **Brand personality** — refined, precise, premium

### 7.2 Motion Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 0ms | No animation |
| `--duration-fast` | 150ms | Micro-interactions, hover |
| `--duration-normal` | 250ms | Standard transitions |
| `--duration-slow` | 400ms | Page transitions, reveals |
| `--duration-slower` | 600ms | Dramatic reveals |
| `--easing-smooth` | `cubic-bezier(0.16, 1, 0.3, 1)` | Standard ease-out |
| `--easing-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Spring/bounce |
| `--easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard ease |

### 7.3 Animation Categories

| Category | Duration | Easing | Example |
|----------|----------|--------|---------|
| **Micro-interactions** | 150ms | smooth | Button hover, hover states |
| **Toggles** | 200ms | smooth | Expand/collapse, switch |
| **Stagger reveals** | 250-400ms | smooth | Lists, grids, staggered |
| **Page transitions** | 300-500ms | smooth | Route changes |
| **Scroll reveals** | 400-600ms | smooth | Elements appearing on scroll |
| **Hero animations** | 500-800ms | spring | Hero text, hero elements |
| **3D transitions** | 600-1000ms | custom | 3D scene transitions |

### 7.4 Reduced Motion

The system fully supports `prefers-reduced-motion`:

- Animations are reduced or eliminated for users who prefer reduced motion
- Critical information is never conveyed only through animation
- Transitions are shortened or replaced with instant changes
- Parallax, auto-rotation, and continuous motion are disabled

Implementation:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 7.5 Motion Implementation

Motion is implemented through:

- **Framer Motion** — declarative animations, page transitions, layout animations
- **GSAP** — complex timelines, scroll-triggered animations, parallax
- **CSS transitions** — simple state changes (hover, focus, toggle)
- **CSS animations** — keyframe animations (loading spinners, pulse effects)

---

## 8. State Architecture

### 8.1 State Types

Every component must handle these states:

| State | Description | UI Pattern |
|-------|-------------|------------|
| **Default** | Normal, interactive state | Standard appearance |
| **Hover** | Pointer over element | Subtle visual change (opacity, scale, shadow) |
| **Focus** | Keyboard focus | Visible focus ring (3:1 contrast minimum) |
| **Active** | Being activated | Slight visual change |
| **Disabled** | Not interactive | Reduced opacity, `pointer-events: none` |
| **Loading** | Processing | Spinner, skeleton, or indeterminate state |
| **Empty** | No content | Empty state illustration + message + action |
| **Error** | Error condition | Red border, error message, retry option |
| **Success** | Success condition | Green indication, success message |
| **Selected** | Selected/toggled on | Visual indication of selection |
| **Expanded** | Expanded state | Full content visible |
| **Collapsed** | Collapsed state | Summary only |

### 8.2 Loading States

Loading states use:

- **Skeleton screens** — for content loading (preferred over spinners for content)
- **Spinners** — for actions, small operations
- **Progress bars** — for known-duration operations
- **Indeterminate states** — for unknown-duration operations

### 8.3 Empty States

Empty states are designed, not afterthoughts:

- **Illustration** — simple, relevant visual
- **Message** — clear explanation of why it's empty
- **Action** — what the user can do (button, link)

### 8.4 Error States

Error states are clear and actionable:

- **Message** — what went wrong, in plain language
- **Solution** — what the user can do
- **Retry** — option to retry the action
- **Alternative** — alternative path if available

---

## 9. Accessibility Architecture

### 9.1 Accessibility Standards

The design system targets **WCAG 2.1 AAA** as the baseline, with AAA where achievable.

### 9.2 Color & Contrast

- **Normal text:** 4.5:1 contrast minimum
- **Large text:** 3:1 contrast minimum
- **UI components:** 3:1 contrast minimum
- **Focus indicators:** 3:1 contrast minimum against adjacent colors
- **State indicators:** Not solely color — also use icons, patterns, text

### 9.3 Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus order is logical and follows visual order
- Focus is never trapped (unless in a modal with escape route)
- Focus is visible (focus ring with 3:1 contrast)
- Skip links are provided for main content

### 9.4 Screen Readers

- Semantic HTML is used throughout
- ARIA attributes are used where necessary (but not as a substitute for semantic HTML)
- Labels are provided for all interactive elements
- States are announced (using `aria-live` regions where appropriate)
- Images have alt text (or are decorative with `alt=""`)
- Icons have accessible names (via `aria-label` or visually hidden text)

### 9.5 Focus Management

- Focus is managed in modals (focus trapped within modal)
- Focus is restored after modal closes
- Focus moves to new content after dynamic updates
- Focus is visible at all times

### 9.6 Reduced Motion

- `prefers-reduced-motion` is respected
- Animations are reduced or eliminated
- Critical information is not conveyed only through animation

### 9.7 Touch & Pointer

- Touch targets are at least 44×44px
- Pointer events are handled correctly
- Hover states are not the only way to access information

### 9.8 Forms

- All inputs have labels (not just placeholders)
- Error messages are associated with inputs (via `aria-describedby`)
- Required fields are indicated (not just by color)
- Errors are announced to screen readers
- Focus moves to errors when form is submitted with errors

---

## 10. Design-to-Code Workflow

### 10.1 Design → Code Flow

```
Design (Figma) → Token Extraction → Token Spec → CSS Variables → Tailwind Config → Components → Application
```

### 10.2 Design Token Extraction

Design tokens are extracted from design files:

1. **Colors** — palette colors mapped to semantic roles
2. **Spacing** — spacing values mapped to 4px scale
3. **Typography** — font sizes, weights, line heights mapped to type scale
4. **Radii** — corner radii mapped to radius scale
5. **Shadows** — elevation levels mapped to shadow scale
6. **Motion** — durations and easings mapped to motion tokens

### 10.3 Design Review Process

Before implementation:

1. Design is reviewed for accessibility
2. Design is reviewed for performance implications
3. Design is reviewed for responsive behavior
4. Design is reviewed for reduced motion compatibility
5. Design tokens are extracted and mapped
6. Components are identified (primitive, composite, pattern)
7. Implementation plan is created

### 10.4 Implementation Standards

When implementing a design:

1. Use existing tokens — never hardcode values
2. Use existing components — compose, don't rebuild
3. Add variants to existing components when needed (not new components)
4. Follow component anatomy conventions
5. Handle all states (default, hover, focus, active, disabled, loading, error, empty)
6. Ensure accessibility (keyboard, screen reader, focus, contrast)
7. Ensure responsive behavior (mobile, tablet, desktop, ultra-wide)
8. Add tests for new components
9. Update documentation

---

## 11. Design System Governance

### 11.1 Design System Ownership

The design system is owned collectively:

- **Design** — defines the visual and interaction language
- **Frontend** — implements the system in code
- **Architecture** — ensures the system is technically sound
- **Accessibility** — ensures the system is accessible
- **Performance** — ensures the system is performant

### 11.2 Design System Evolution

The design system evolves through:

1. **Proposal** — identify the need, propose the change
2. **Design** — design the solution (token, component, pattern)
3. **Review** — review for accessibility, performance, brand fit, maintainability
4. **Implementation** — implement in design tool and code
5. **Testing** — test across breakpoints, devices, assistive technologies
6. **Documentation** — update design system docs
7. **Adoption** — use in the application, deprecate old patterns

### 11.3 Versioning

The design system follows semantic versioning:

- **Major** — breaking changes (token changes, component API changes)
- **Minor** — new tokens, components, patterns (backwards compatible)
- **Patch** — fixes, refinements (backwards compatible)

### 11.4 Deprecation

When a token, component, or pattern is deprecated:

1. **Announce** — document the deprecation, explain the replacement
2. **Warn** — add deprecation warnings in code and docs
3. **Migrate** — provide migration guide
4. **Remove** — remove after migration period (at least 2 major versions)

### 11.5 Contribution

Contributions to the design system follow the standard workflow:

1. Identify the need
2. Propose the change (design or code)
3. Review (accessibility, performance, brand fit, maintainability)
4. Implement
5. Test
6. Document
7. Merge

---

## 12. References

### Internal

- `docs/design/TOKENS.md` — Token philosophy and scale
- `docs/design/COLORS.md` — Color palette and rationale
- `docs/design/TYPOGRAPHY.md` — Typography system and rationale
- `docs/design/COMPONENT_GUIDE.md` — Component architecture guide
- `docs/design/BRAND_GUIDELINES.md` — Brand guidelines
- `docs/design/FRONTEND_EXCELLENCE.md` — Frontend excellence standards
- `docs/design/UX_STRATEGY.md` — UX strategy
- `packages/ui/src/app/design-system/DESIGN_SYSTEM.md` — Implementation design system doc
- `packages/ui/src/styles/0-tokens.css` — Token implementation

### External

- WCAG 2.2 — Accessibility standards
- WAI-ARIA — Accessible Rich Internet Applications
- Material Design — Design system reference
- Apple Human Interface Guidelines — Design system reference
- Ant Design — Design system reference

---

*This document is the architecture of the HEXA STUDIO design system. It defines how the system is structured, how tokens flow, how components are organized, how accessibility is handled, and how the system evolves. For the visual design guidelines, see the implementation document at `packages/ui/src/app/design-system/DESIGN_SYSTEM.md`.*
