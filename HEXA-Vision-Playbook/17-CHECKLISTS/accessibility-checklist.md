# Accessibility Checklist

**Standard:** WCAG 2.1 Level AA

---

## Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Visible focus indicators on all elements
- [ ] Logical tab order matches visual order
- [ ] No keyboard traps
- [ ] Escape closes modals, menus, overlays
- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys for navigation within components

## Screen Readers

- [ ] All images have meaningful alt text (or `aria-hidden="true"` if decorative)
- [ ] ARIA landmarks present (banner, navigation, main, complementary, contentinfo)
- [ ] Forms have `<label>` for every input
- [ ] Error messages linked with `aria-describedby`
- [ ] Dynamic content uses `aria-live` regions
- [ ] 3D scenes have semantic DOM descriptions
- [ ] `aria-label` on interactive elements without visible text
- [ ] Status messages use `role="status"` or `role="alert"`

## Color and Contrast

- [ ] Normal text contrast ≥ 4.5:1
- [ ] Large text contrast ≥ 3:1
- [ ] UI component contrast ≥ 3:1
- [ ] Focus indicator contrast ≥ 3:1
- [ ] No information conveyed by color alone

## Reduced Motion

- [ ] `prefers-reduced-motion: reduce` respected
- [ ] Parallax effects disabled
- [ ] Auto-rotation on 3D scenes disabled
- [ ] Page transitions instant
- [ ] Animations respect `animation-duration: 0.01ms`

## Forms

- [ ] Every input has a `<label>`
- [ ] Required fields marked with `aria-required`
- [ ] Error messages visible and announced
- [ ] Autocomplete attributes on common fields
- [ ] Validation on blur, not on keydown

## 3D Scenes

- [ ] Canvas has `aria-hidden="true"`
- [ ] Semantic description present
- [ ] Hotspots keyboard accessible
- [ ] Scene controls available outside canvas
- [ ] Scene changes announced via `aria-live`

## Testing

- [ ] Passes axe-core automated tests
- [ ] Passes Lighthouse accessibility audit (≥ 95)
- [ ] VoiceOver / NVDA tested
- [ ] 200% zoom — no content loss
- [ ] 400% zoom (1280px) — no horizontal scrolling
