# Pre-Release Checklist

**Release Version:** [x.y.z]

---

## Functional

- [ ] All pages render without errors
- [ ] All links and navigation work
- [ ] All forms submit correctly
- [ ] 3D scenes load and render
- [ ] Authentication flow works
- [ ] Search functionality works
- [ ] Filtering and pagination work
- [ ] File upload/download works

## Visual

- [ ] No visual regressions (compare with baseline)
- [ ] Responsive on 320px, 768px, 1024px, 1440px
- [ ] Dark mode works correctly
- [ ] Animations are smooth
- [ ] Fonts load correctly
- [ ] No layout shifts

## Performance

- [ ] Lighthouse scores ≥ 95 (all categories)
- [ ] Bundle size within budget
- [ ] 3D scenes maintain 60 FPS
- [ ] API response times within limits
- [ ] No memory leaks

## Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Reduced motion respected
- [ ] Focus indicators visible

## Security

- [ ] No secrets exposed
- [ ] JWT tokens expire correctly
- [ ] Rate limiting active
- [ ] CSP headers present
- [ ] Input validation enforced

## Integration

- [ ] API endpoints return expected data
- [ ] Strapi ↔ NestJS sync works
- [ ] Odoo ↔ NestJS sync works
- [ ] Webhook-triggered ISR works
- [ ] Email sending works

## Documentation

- [ ] CHANGELOG.md updated
- [ ] API docs current (Swagger)
- [ ] ADR documents up to date
- [ ] Playbook version updated

## Sign-offs

- [ ] Product Owner: [name]
- [ ] QA Lead: [name]
- [ ] Security Engineer: [name]
- [ ] DevOps Engineer: [name]
- [ ] Chief Architect: [name]
