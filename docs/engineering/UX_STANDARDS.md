# UX Standards

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## UX Philosophy

The la-log experience should be **Effortless**. The user should never feel "lost" or "confused." We prioritize a "Guided Journey" over a "Free-for-all" navigation.

## Interaction Principles

### 1. Predictability
Every action must have a predictable result.
- **Consistency:** A button style always performs the same type of action.
- **Feedback:** Every interaction provides immediate visual or haptic feedback.
- **Affordance:** Interactive elements must look interactive (e.g., hover states).

### 2. Reduction of Cognitive Load
Avoid overwhelming the user with too much information at once.
- **Progressive Disclosure:** Show only what is necessary; hide details behind "Learn More" or hover.
- **Chunking:** Group related information into clear, distinct sections.
- **Skeuomorphism (Light):** Use familiar metaphors (e.g., a "Gallery" for projects).

### 3. The "Zero-Friction" Path
Minimize the number of clicks to reach the primary goal (Contact/Inquiry).
- **Direct CTAs:** CTAs are always visible or easily accessible.
- **Smart Defaults:** Pre-fill forms where possible.
- **One-Click Actions:** Favor "Approve" or "Accept" buttons over complex forms.

## 3D UX Patterns

Working with 3D in a browser is challenging. We use these patterns to reduce friction:
- **Guided Tours:** Use "Auto-fly-to" animations to show the user the best views.
- **Contextual UI:** Show hotspots and info only when the camera is near the object.
- **Intuitive Controls:** Use standard OrbitControls but provide a "Reset View" button.
- **Progressive Loading:** Show a low-poly version or a loading screen before the full scene appears.

## UX Quality Gate

Every user flow must be audited for **Friction Points**:
1. **Map the flow:** List every step from start to finish.
2. **Identify friction:** Where does the user have to think? Where is the delay?
3. **Simplify:** Remove unnecessary steps or automate them.
4. **Verify:** Test with a user who has never seen the platform.

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to First Value | < 10 seconds (Initial 3D view) |
| Contact Conversion | > 5% of visitors |
| Portal Completion | > 90% of onboarding tasks finished |
| NPS | > 70 |
