# ♿ Accessibility (A11y) Standards

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Standard:** WCAG 2.1 Level AA

## Commitment

HEXA Studio is committed to creating digital experiences that are accessible to everyone, regardless of ability. All websites, applications, and digital content must meet WCAG 2.1 Level AA standards.

---

## Core Accessibility Principles (POUR)

### P - Perceivable
Information must be presented so users can perceive it:
- ✓ Provide text alternatives for images
- ✓ Provide captions for videos
- ✓ Use sufficient color contrast (4.5:1 minimum)
- ✓ Don't rely on color alone to convey meaning

### O - Operable
Interface components must be usable:
- ✓ All functionality available via keyboard
- ✓ No keyboard traps
- ✓ Skip navigation links for assistive users
- ✓ Sufficient time for user interactions
- ✓ Avoid seizure-inducing animations

### U - Understandable
Information must be clear and predictable:
- ✓ Use plain language
- ✓ Consistent navigation
- ✓ Clear labels and instructions
- ✓ Helpful error messages

### A - Robust
Code must be compatible with assistive technologies:
- ✓ Valid semantic HTML
- ✓ Proper ARIA attributes
- ✓ Support screen readers
- ✓ Mobile accessibility

---

## Implementation Requirements

### HTML & Semantics
```html
<!-- Use semantic HTML -->
<button>Submit</button>  ✓  Good
<div onclick="submit()">Submit</div>  ✗  Bad

<!-- Proper headings hierarchy -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>  ✓  Good

<h1>Page Title</h1>
<h3>Section</h3>  ✗  Bad (skipped h2)

<!-- Form labels -->
<label for="email">Email:</label>
<input id="email" type="email" />  ✓  Good
```

### Color Contrast
- **Normal text:** 4.5:1 minimum contrast ratio
- **Large text (18pt+):** 3:1 minimum ratio
- **UI components:** 3:1 minimum ratio
- **Tool:** Use WCAG Contrast Checker

### Images
```html
<!-- Meaningful images need alt text -->
<img src="project.jpg" alt="3D rendered office space" />  ✓

<!-- Decorative images have empty alt -->
<img src="decoration.png" alt="" />  ✓

<!-- Complex images need detailed description -->
<img src="chart.png" alt="Sales by quarter" />
<p>Q1: $100k, Q2: $150k, Q3: $120k, Q4: $200k</p>  ✓
```

### ARIA Attributes
```html
<!-- ARIA live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true">
  Content updates announced to screen readers
</div>

<!-- ARIA labels for icon-only buttons -->
<button aria-label="Close menu"><i class="icon-x"></i></button>

<!-- ARIA expanded for collapsibles -->
<button aria-expanded="false" aria-controls="menu">
  Menu
</button>
<div id="menu" hidden>
  <!-- menu items -->
</div>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order must be logical
- Visible focus indicator (min 3px)
- No keyboard traps

### Testing
- **Tools:** axe DevTools, WAVE, Lighthouse
- **Screen readers:** NVDA (Windows), JAWS (premium), VoiceOver (Mac)
- **Frequency:** Every sprint
- **Coverage:** 100% of public pages

---

## Performance & Accessibility

- Keyboard users appreciate fast interactions
- Reduced animations help vestibular-sensitive users
- Sufficient spacing helps motor-impaired users
- Clear language helps cognitive accessibility

---

## Related Documentation

- [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md)
- [ACCESSIBILITY_AUDIT.md](../15-QUALITY/ACCESSIBILITY_AUDIT.md)
- [ACCESSIBILITY_CHECKLIST.md](../17-CHECKLISTS/accessibility-checklist.md)
