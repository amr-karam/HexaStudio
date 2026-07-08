# Local Testing Protocol

To ensure the staging environment behaves exactly like production, follow this testing suite.

## 1. Visual & Functional Verification
- [ ] **Hero Section:** Verify 3D canvas loads, mouse parallax works, and cinematic fly-throughs are smooth.
- [ ] **Project Gallery:** Ensure all project cards load images and transition to detail views.
- [ ] **Navigation:** Test all links in the Navbar (Portfolio, Services, Studio, Contact).
- [ ] **CMS Integration:** Log into Strapi (`/cms/admin`), create a test project, and verify it appears on the frontend.

## 2. Technical Verification
- **Console:** Open Chrome DevTools. Check for any `404` or `500` errors in the Network tab.
- **Performance:** Use Chrome Lighthouse to verify LCP < 1.2s.
- **Memory:** Monitor RAM usage on Ubuntu (`htop`) during 3D interactions to ensure no leaks.
- **Responsiveness:** Test on mobile viewport (320px, 768px) to verify "Interaction Zones" and layout.

## 3. Connectivity Test
```bash
# Test API accessibility
curl -f http://localhost/api/health

# Test CMS accessibility
curl -f http://localhost/cms/api/health
```
