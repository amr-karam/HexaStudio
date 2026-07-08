# Design System Standards

**Last Updated:** 2026-07-08

---

## Principles

1. **Consistency** — Every component follows the same visual language
2. **Composability** — Components are composed from primitives
3. **Accessibility** — Every component meets WCAG 2.1 AA
4. **Performance** — Components are tree-shakeable and lightweight
5. **Theming** — Dark and light mode supported via CSS variables

## Component Hierarchy

```
Primitives (Button, Input, Text, Icon)
    └── Composites (Card, Form, Modal, Table)
            └── Patterns (ProjectCard, ContactForm, DataTable)
                    └── Pages (HomePage, ProjectPage, BlogPage)
```

## Design Tokens

All design tokens are defined in `tailwind.config.ts`:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#...',
          500: '#...',
          900: '#...',
        },
      },
      spacing: {
        'page': '1200px',
        'section': '80px',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
    },
  },
}
```

## Component Rules

### Button

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'ghost' \| 'danger' | 'primary' | Visual style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size |
| loading | boolean | false | Show spinner |
| disabled | boolean | false | Disabled state |
| fullWidth | boolean | false | 100% width |

### Card

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'elevated' \| 'outlined' | 'default' | Visual style |
| padding | 'none' \| 'sm' \| 'md' \| 'lg' | 'md' | Padding |
| hoverable | boolean | false | Hover effect |

### Typography

```typescript
// Font scale
const fontScale = {
  'display-xl': { size: '4.5rem', lineHeight: '1.1', weight: 'bold' },
  'display-lg':  { size: '3.75rem', lineHeight: '1.1', weight: 'bold' },
  'heading-xl':  { size: '2.25rem', lineHeight: '1.2', weight: 'semibold' },
  'heading-lg':  { size: '1.875rem', lineHeight: '1.3', weight: 'semibold' },
  'heading-md':  { size: '1.5rem', lineHeight: '1.4', weight: 'semibold' },
  'body-lg':     { size: '1.125rem', lineHeight: '1.6', weight: 'normal' },
  'body-md':     { size: '1rem', lineHeight: '1.6', weight: 'normal' },
  'body-sm':     { size: '0.875rem', lineHeight: '1.5', weight: 'normal' },
  'caption':     { size: '0.75rem', lineHeight: '1.4', weight: 'normal' },
};
```

## Spacing System

```typescript
const spacing = {
  '0': '0',
  '1': '0.25rem',  // 4px
  '2': '0.5rem',   // 8px
  '3': '0.75rem',  // 12px
  '4': '1rem',     // 16px
  '5': '1.25rem',  // 20px
  '6': '1.5rem',   // 24px
  '8': '2rem',     // 32px
  '10': '2.5rem',  // 40px
  '12': '3rem',    // 48px
  '16': '4rem',    // 64px
  '20': '5rem',    // 80px
  '24': '6rem',    // 96px
};
```

## Shadow System

```typescript
const shadows = {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  'glow': '0 0 20px rgb(var(--color-accent) / 0.3)',
};
```

## Glass Effect Pattern

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .glass {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

## Animation Tokens

```typescript
const animations = {
  'fast': '150ms ease-out',
  'normal': '300ms ease-out',
  'slow': '500ms ease-out',
  'page': '700ms cubic-bezier(0.16, 1, 0.3, 1)',
};
```

## Implementation Rules

1. All components must use TailwindCSS utility classes
2. No inline styles or styled-components
3. Component variants use `cva` (class-variance-authority)
4. Dark mode uses `dark:` variant
5. All interactive elements have focus rings
6. Use `data-testid` for test selectors
