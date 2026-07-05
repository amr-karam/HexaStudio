# Optional Improvements

While the project is approved for production, the following improvements are recommended for the next sprint:

1. **Increase Test Coverage**: Expand the Vitest suite to include integration tests for all Backend API endpoints and E2E tests via Playwright.
2. **Sentry Advanced Monitoring**: Implement Sentry Performance Monitoring (Tracing) to identify slow 3D render frames.
3. **Cloudflare WAF Tuning**: Implement specific WAF rules to protect the Strapi CMS from common exploits.
4. **Lighthouse Monitoring**: Integrate Lighthouse CI into the pipeline to prevent performance regressions.
5. **Sitemap Automation**: Fully automate `sitemap.xml` generation via a Strapi webhook.
