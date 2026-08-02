# Accessibility Guide

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Standard: WCAG 2.1 AA

All pages and features must meet WCAG 2.1 Level AA compliance.

---

## The Dual-Interface Principle

HEXA Vision uses a unique **Dual-Interface** approach:

```
┌──────────────────────────────────────┐
│           3D Scene (Visual)           │
│  ┌────────────────────────────────┐  │
│  │  Interactive 3D visualization  │  │
│  │  (Canvas/SVG/WebGL)            │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Semantic DOM (Accessible)     │  │
│  │  - Screen reader content       │  │
│  │  - Keyboard navigation         │  │
│  │  - ARIA live regions           │  │
│  │  - Focus management            │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

Every 3D scene must have a parallel semantic DOM that conveys the same information to assistive technologies.

---

## Keyboard Navigation

### Requirements

- All interactive elements are reachable via **Tab** key
- Visible focus indicators on all elements
- Logical tab order (matches visual order)
- No keyboard traps
- **Escape** closes modals, menus, overlays
- **Enter/Space** activates buttons and links
- **Arrow keys** for navigation within carousels, galleries, lists

### Tab Order

1. Skip to content link (first focusable element)
2. Main navigation
3. Page content (in visual order)
4. Footer navigation
5. Cookie consent / modals

### Focus Indicators

```css
/* Custom focus ring */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default outline when custom is visible */
:focus:not(:focus-visible) {
  outline: none;
}
```

---

## Screen Readers

### ARIA Landmarks

```html
<header role="banner">
<nav role="navigation" aria-label="Main navigation">
<main role="main">
<aside role="complementary" aria-label="Related projects">
<footer role="contentinfo">
```

### Live Regions

For dynamic content updates:

```html
<div aria-live="polite" aria-atomic="true">
  <!-- Dynamic updates here -->
</div>
```

### 3D Scene Descriptions

Every 3D scene must include:

```html
<div role="region" aria-label="3D architectural visualization">
  <h2>Sunset Villa — Living Room</h2>
  <p>This scene shows a modern open-plan living room with floor-to-ceiling windows,
     a stone fireplace, and minimalist furniture in neutral tones.</p>
  <button aria-label="Open project details">View Project</button>
</div>
```

---

## Color and Contrast

| Requirement | Ratio | Applies To |
|-------------|-------|------------|
| Normal text | 4.5:1 | Body text, labels, captions |
| Large text (18px+ / 14px bold+) | 3:1 | Headings, large labels |
| UI components | 3:1 | Icons, borders, input outlines |
| Focus indicators | 3:1 | Focus rings |

### Color Usage

- **Never rely on color alone** to convey information
- Use icons, text labels, and patterns alongside color
- Error states: color + icon + text message
- Success states: color + icon + text message

---

## Reduced Motion

### Implementation

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable parallax effects
  // Disable 3D auto-rotation
  // Use instant transitions instead of animated
  // Set animation duration to 0
}
```

### CSS

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### What to Disable

- Parallax scrolling effects
- Auto-rotating 3D scenes
- Page transitions / route animations
- Hover-scale effects
- Particle animations

---

## Forms

| Requirement | Implementation |
|-------------|----------------|
| Labels | Every input has a `<label>` |
| Required fields | `aria-required="true"` |
| Error messages | `aria-describedby` linking to error |
| Error summary | List of errors at top of form |
| Autocomplete | `autocomplete` attribute for common fields |
| Validation | Validate on blur, not on keydown |

### Form Error Pattern

```html
<div>
  <label for="email">Email address</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-error"
    aria-invalid="true"
  />
  <span id="email-error" role="alert">Please enter a valid email address.</span>
</div>
```

---

## 3D Scene Accessibility

### Hotspots

Every interactive 3D hotspot must:

1. Be in the tab order
2. Have an accessible name (aria-label)
3. Describe what happens on activation
4. Have a visible focus indicator

```typescript
// ✅ Good
<Html as="div" role="button" tabIndex={0}
  aria-label="View living room details"
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
  <span aria-hidden="true">🔍</span>
</Html>
```

### Scene Controls

- Provide buttons outside the canvas for: zoom, rotate, reset view
- Use `aria-label` on canvas: "3D architectural scene. Use buttons below to navigate."
- Announce scene changes with `aria-live`

---

## Testing

### Automated

| Tool | Integration |
|------|-------------|
| axe-core | Automated testing in CI |
| Lighthouse aXe | In CI pipeline |
| Playwright aXe | In E2E tests |

### Manual

| Test | Frequency |
|------|-----------|
| Keyboard navigation | Every PR with UI changes |
| Screen reader (VoiceOver/NVDA) | Every feature |
| Color contrast check | Every PR |
| Reduced motion check | Every PR |
| Zoom to 200% | Every PR |
| Mobile screen reader | Every release |

---

## Testing Checklist

### Before Merging

- [ ] Page can be fully navigated with keyboard
- [ ] Focus indicators are visible on all interactive elements
- [ ] No ARIA errors in accessibility tree
- [ ] Color contrast ratios meet WCAG AA
- [ ] Forms have proper labels, errors, and announcements
- [ ] Images have meaningful alt text (or `aria-hidden="true"` if decorative)
- [ ] 3D scenes have semantic DOM descriptions
- [ ] Reduced motion disables animations
- [ ] Page works at 200% zoom
- [ ] No content overlaps at 400% zoom (1280px viewport)
