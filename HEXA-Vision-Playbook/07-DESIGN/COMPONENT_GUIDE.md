# Component Guide: HEXA Vision

This guide documents the standardized UI components of the HEXA Vision design system. All components are built using Tailwind 4 and CSS variables.

## 1. Button System
- **Component:** `Button.tsx`
- **Variants:**
    - `primary`: Black background, white text. High emphasis.
    - `secondary`: Neutral light background. Medium emphasis.
    - `outline`: Bordered, transparent background. Low emphasis.
    - `ghost`: No border/background. Subtle.
- **Sizes:** `sm`, `md`, `lg`.
- **Behavior:** Includes `isLoading` state with a minimalist spinner and `active:scale-95` haptic feedback.

## 2. Input System
- **Component:** `Input.tsx`
- **Style:** Underline-only style for a minimalist, architectural feel.
- **States:**
    - **Default:** Neutral border.
    - **Focus:** Brand accent color border.
    - **Error:** Red border with descriptive error text.
- **Labels:** Small, uppercase, tracked labels.

## 3. Card System
- **Component:** `Card.tsx`
- **Variants:**
    - `glass`: Uses `var(--glass-bg)` and `backdrop-blur`. Standard for 3D overlays.
    - `solid`: Deep neutral background. Used for structured data.
- **Padding:** Standard `p-6` for internal content.

## 4. Modal System
- **Component:** `Modal.tsx`
- **Behavior:** Centered overlay with a blurred backdrop (`backdrop-blur-sm`).
- **Transitions:** Soft fade-in with `duration-300`.
- **Structure:** Includes an optional title and a close button in the top-right.

## 5. Navigation System
- **Component:** `Navbar.tsx`
- **Style:** Fixed top navigation with a subtle blur (`backdrop-blur-md`) and minimal border.
- **Items:** High-contrast white for active states, neutral-500 for inactive.
- **Typography:** All-caps, tracked labels for a professional architectural studio feel.
