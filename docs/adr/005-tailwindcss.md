# ADR-005: TailwindCSS 4 for Styling

## Status
Accepted

## Date
2025-01-15

## Context
The design system requires:
- Rapid prototyping of luxury UI components
- Consistent spacing, typography, and color tokens
- Responsive design across all breakpoints
- Zero runtime CSS-in-JS overhead
- Integration with Next.js App Router

## Decision
We will use **TailwindCSS 4** with a centralized `tailwind.config` for all styling.

## Alternatives Considered
| Alternative | Pros | Cons |
|-------------|------|------|
| CSS Modules | Zero runtime, scoped styles | Verbose, no design tokens, slower iteration |
| Styled Components | Dynamic theming, colocation | Runtime overhead, SSR complexity |
| Vanilla Extract | Type-safe, zero runtime | Steeper learning curve, smaller ecosystem |
| Panda CSS | Type-safe, atomic | Newer, less community support |

## Rationale
1. **Speed**: Utility-first approach enables rapid iteration without writing custom CSS.
2. **Consistency**: Centralized config ensures all components use the same spacing scale, colors, and typography.
3. **Performance**: Tailwind 4 compiles to minimal CSS — no runtime JavaScript overhead.
4. **Responsive**: Built-in responsive prefixes (`md:`, `lg:`, `xl:`) simplify mobile-first design.
5. **Community**: Largest utility-first CSS ecosystem; extensive component libraries (e.g., Radix, shadcn/ui).

## Consequences
- Must enforce "utility classes only" rule — no custom CSS files.
- HTML can become verbose with many classes — mitigated by component abstraction.
- Requires build step (PostCSS) for production.

## References
- [TailwindCSS Docs](https://tailwindcss.com/)
- [TailwindCSS 4 Migration](https://tailwindcss.com/docs/upgrade-guide)
