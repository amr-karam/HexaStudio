# Accessibility Checklist

**Standard:** WCAG 2.2 Level AA

---

## Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Visible focus indicators on all elements
- [ ] Logical tab order matches visual order
- [ ] No keyboard traps
- [ ] Escape closes modals, menus, overlays
- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys for navigation within components
- [ ] All project cards keyboard-operable (Tab to focus, Enter/Space to activate)
- [ ] PauseAnimationsButton keyboard-accessible (Tab + Enter/Space, aria-pressed)

---

## Focus Management

- [ ] Modals: focus trap (Tab cycles within modal)
- [ ] Menus: focus trap while open
- [ ] Escape closes modal/menu and restores focus to trigger element
- [ ] Route changes: focus moves to new page heading or `<main>`
- [ ] Background content inert during modals/menus (`aria-hidden="true"`, `inert` attribute)

---

## Screen Readers

- [ ] All images have meaningful alt text (or `aria-hidden="true"` if decorative)
- [ ] ARIA landmarks present (banner, navigation, main, complementary, contentinfo)
- [ ] Forms have `<label>` for every input
- [ ] Error messages linked with `aria-describedby`
- [ ] Dynamic content uses `aria-live` regions
- [ ] 3D scenes have semantic DOM descriptions (SceneAccessibility)
- [ ] `aria-label` on interactive elements without visible text
- [ ] Status messages use `role="status"` or `role="alert"`

---

## ARIA for Loaders

- [ ] Determinate loaders: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- [ ] Indeterminate loaders: `role="status"` with descriptive text
- [ ] Loaders announce completion via `aria-live="polite"`

---

## Color and Contrast

- [ ] Normal text contrast >= 4.5:1
- [ ] Large text contrast >= 3:1
- [ ] UI component contrast >= 3:1
- [ ] Focus indicator contrast >= 3:1
- [ ] No information conveyed by color alone

---

## Reduced Motion

- [ ] `prefers-reduced-motion: reduce` respected (verified via Playwright reduced-motion project)
- [ ] No continuous motion (shaders, particles, rotation, float, parallax, camera orbit)
- [ ] No scroll-linked spatial movement
- [ ] Page transitions instant (no wipes/curtains)
- [ ] Loaders static (no pulse/spin/progress animation)
- [ ] Counters jump to final value
- [ ] Cursor effects disabled
- [ ] Smooth scroll disabled (`behavior: auto`)
- [ ] Camera snaps to stable target
- [ ] 3D scenes render at final state (no entrance animation)
- [ ] Marquee: static text
- [ ] Brief opacity crossfade permitted only when aiding comprehension (max 0.2s)
- [ ] Content accessible without animation (never delayed)

---

## Pause Control

- [ ] PauseAnimationsButton visible and keyboard-operable
- [ ] `aria-pressed` attribute reflects current state
- [ ] State persisted in localStorage
- [ ] Overrides OS preference when activated
- [ ] All paused effects show static fallback states

---

## Coarse Pointer (Touch)

- [ ] Verified via Playwright mobile project
- [ ] Mouse-follow effects disabled on touch
- [ ] Parallax disabled on touch
- [ ] Cursor effects disabled on touch
- [ ] All touch targets >= 44x44 CSS pixels
- [ ] Hover-only interactions have tap alternatives

---

## Forms

- [ ] Every input has a `<label>`
- [ ] Required fields marked with `aria-required`
- [ ] Error messages visible and announced
- [ ] Autocomplete attributes on common fields
- [ ] Validation on blur, not on keydown

---

## 3D Scenes

- [ ] Canvas has `aria-hidden="true"`
- [ ] Semantic description present (SceneAccessibility)
- [ ] Hotspots keyboard accessible
- [ ] Scene controls available outside canvas
- [ ] Scene changes announced via `aria-live`
- [ ] WebGL fallback: cover image + project metadata + navigation
- [ ] No-JS: server-rendered 3D alternative content visible

---

## Content Availability

- [ ] No-JS: all content visible and usable without JavaScript
- [ ] WebGL unavailable: cover image + project metadata + navigation
- [ ] Model load failure: fallback with project info
- [ ] XR unsupported: descriptive fallback message

---

## Testing

- [ ] Passes axe-core automated tests
- [ ] Passes Lighthouse accessibility audit (>= 95)
- [ ] VoiceOver / NVDA tested
- [ ] 200% zoom — no content loss
- [ ] 400% zoom (1280px) — no horizontal scrolling
- [ ] Keyboard-only navigation tested (all interactive flows)
- [ ] Reduced motion emulation tested (Playwright)
- [ ] Focus trap tested (modal, menu)
- [ ] Route focus management tested
