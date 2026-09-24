# HEXA STUDIO — Design System
* Version: 1.0.0
* Description: Supreme Law of Visual Luxury

## The 60-30-10 Color Rule

HEXA STUDIO adheres to a strict 60-30-10 color balance to ensure visual luxury and prevent "Design Slop."

| Ratio | Color | Hex | Purpose |
|-------|-------|-----|---------|
| 60%   | Void  | `${tokens.colors.void}` | Background/Base |
| 30%   | Obsidian | `${tokens.colors.obsidian}` | Main Accent |
| 10%   | Gold | `${tokens.colors.gold}` | Highlight/Call to Action |

## Editorial Typography

| Property | Value |
|----------|-------|
| Heading Font | Bodoni Moda |
| Body Font | Inter |
| Mono Font | JetBrains Mono |
| Heading Tracking | -0.02em |
| Body Size | 1rem |

## Motion Tokens

| Token | Value |
|-------|-------|
| Ease Default | --hexa-ease-out |

## Governance

- **Luxury Score Threshold**: 80 (CI/CD Gate)
- **Enforcement**: `check-design-tokens.mjs` pre-commit hook.
- **Generation**: `LuxuryForge` AI for auto-refactoring.