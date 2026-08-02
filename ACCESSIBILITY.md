# ♿ HEXA STUDIO — ACCESSIBILITY GOVERNANCE (WCAG 2.1 AAA)

**Version:** 1.0.0  
**Authority Level:** 8  
**Scope:** WCAG 2.1 AAA Compliance, Reduced Motion, Keyboard Navigation, & ARIA  

---

## 1. ACCESSIBILITY DIRECTIVES

1. **Accessibility is Non-Negotiable**: Accessibility is an explicit product requirement, not optional polish.
2. **Reduced Motion System (`useMotionPolicy`)**: All WebGL particle systems, 3D camera shifts, and CSS animations MUST listen to `prefers-reduced-motion: reduce` and provide static visual fallbacks.
3. **Keyboard Nav & Focus**: All interactive elements (buttons, links, portal tabs, modals) MUST be reachable via keyboard (`Tab` / `Shift+Tab`) with visible focus rings (`ring-2 ring-gold`).
4. **ARIA Landmarks & Roles**: Main navigation MUST use `<nav aria-label="...">`, modal dialogs MUST use `role="dialog"` with `aria-labelledby`, and dynamic alerts MUST use `role="status"` or `aria-live="polite"`.
5. **Color Contrast**: All text MUST maintain a minimum contrast ratio of 4.5:1 (normal text) and 3:1 (large text) against Void Black backgrounds.
