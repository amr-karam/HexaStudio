# Accessibility Governance - HEXA STUDIO

## Targets
- **Compliance:** WCAG 2.1 AAA.

## Accessibility Principles
- **Keyboard Navigation:** All interactive elements MUST be reachable and usable via keyboard.
- **Focus Management:** Active focus states MUST be visible and logical.
- **Semantic HTML:** Use proper landmark roles, heading levels, and semantic elements.
- **Form Accessibility:** All form fields MUST have associated labels and clear error messaging.
- **Motion:** Respect `prefers-reduced-motion` settings.
- **Touch Targets:** Minimum touch target size compliant with WCAG standards.

## Audit Strategy
- **Automated:** Axe accessibility testing (integrated into CI/CD).
- **Manual:** Regular keyboard navigation and screen reader (VoiceOver/NVDA) testing of critical user flows.
- **Compliance:** Periodic audit of interactive components (shadcn/ui usage helps with this).
