# Responsive Design Checklist

**Breakpoints:** 320px (mobile) | 768px (tablet) | 1024px (desktop) | 1440px (wide)

---

## Global

- [ ] Content does not overflow on any breakpoint
- [ ] No horizontal scrolling on any breakpoint (except data tables)
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Text is readable without zoom
- [ ] Images scale appropriately
- [ ] No layout shifts on resize

## Navigation

- [ ] Desktop nav visible on ≥ 1024px
- [ ] Hamburger/mobile nav on < 1024px
- [ ] Mobile nav is fully functional
- [ ] Dropdown menus work on touch devices
- [ ] Active page highlighted correctly

## Typography

- [ ] Font sizes scale appropriately
  - Display: responsive clamp()
  - Body: base `1rem` with responsive scaling
- [ ] Line height adjusts for readability on mobile
- [ ] Text does not overflow containers
- [ ] Headings break appropriately (long words handled)

## Grid

- [ ] 1 column on mobile (< 768px)
- [ ] 2 columns on tablet (768px - 1023px)
- [ ] 3+ columns on desktop (≥ 1024px)
- [ ] Grid items do not overlap
- [ ] Spacing consistent at all breakpoints

## 3D Scenes

- [ ] Scene fills viewport width on mobile
- [ ] Touch controls work (pinch zoom, rotate)
- [ ] Scene does not overflow container
- [ ] UI overlays properly positioned on all sizes
- [ ] Scene description still accessible on mobile

## Forms

- [ ] Input fields full width on mobile
- [ ] Labels positioned above inputs on mobile
- [ ] Buttons full width on mobile
- [ ] No zoom on input focus (iOS)
- [ ] Form is usable with one hand

## Images

- [ ] Images scale down on smaller screens
- [ ] No pixelation on retina displays
- [ ] Aspect ratio maintained
- [ ] Lazy loading works on all breakpoints

## Tables

- [ ] Horizontal scroll on mobile (if table is wide)
- [ ] OR cards/stacked layout on mobile (alternative to tables)
- [ ] Sort/filter accessible on mobile

## Footer

- [ ] Links stack vertically on mobile
- [ ] No overlapping elements
- [ ] Copyright and legal text visible

## Testing

- [ ] 320px width — everything functional
- [ ] 768px width — everything functional
- [ ] 1024px width — everything functional
- [ ] 1440px width — everything functional
- [ ] Landscape orientation on mobile
- [ ] Foldable / split screen
- [ ] Dark mode on all breakpoints
