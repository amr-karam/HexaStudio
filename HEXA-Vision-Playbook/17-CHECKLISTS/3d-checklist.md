# 3D Scene Quality Checklist

---

## Model Quality

- [ ] Model is Draco-compressed GLB
- [ ] File size < 5MB
- [ ] Polygon count < 500K per scene
- [ ] All transforms applied (location, rotation, scale)
- [ ] UV maps non-overlapping
- [ ] No missing textures
- [ ] No missing materials
- [ ] No N-gons (triangulate before export)
- [ ] No loose geometry

## Rendering

- [ ] Scene loads within 3 seconds
- [ ] 60 FPS maintained
- [ ] Draw calls < 100
- [ ] No z-fighting
- [ ] No visible seams in textures
- [ ] Lighting looks correct
- [ ] Shadows look correct (if enabled)
- [ ] Reflections look correct (if enabled)
- [ ] Anti-aliasing enabled

## Interaction

- [ ] Orbit controls work correctly
- [ ] Zoom limits are appropriate
- [ ] Pan limits prevent losing the scene
- [ ] Touch controls work on mobile
- [ ] Reset view button works
- [ ] Hotspot interactions work
- [ ] Scene transitions are smooth

## Performance

- [ ] LOD implemented (if distant objects)
- [ ] InstancedMesh for repeated objects
- [ ] Baked lighting (preferred)
- [ ] Texture sizes optimized
- [ ] Geometries disposed on unmount
- [ ] Materials disposed on unmount
- [ ] Textures disposed on unmount
- [ ] Memory < 500MB peak

## Accessibility

- [ ] Semantic DOM description present
- [ ] Keyboard navigation works
- [ ] Hotspots have aria-labels
- [ ] Auto-rotation disabled on reduced motion
- [ ] Scene controls available outside canvas

## Error Handling

- [ ] Error boundary wraps the scene
- [ ] Fallback UI shown if scene fails to load
- [ ] Loading state (skeleton or progress bar)
- [ ] WebGL not supported fallback
- [ ] Graceful degradation for low-end devices

## Cross-Browser

- [ ] Chrome — works correctly
- [ ] Firefox — works correctly
- [ ] Safari — works correctly
- [ ] Edge — works correctly
- [ ] Mobile Safari — works correctly
- [ ] Mobile Chrome — works correctly
