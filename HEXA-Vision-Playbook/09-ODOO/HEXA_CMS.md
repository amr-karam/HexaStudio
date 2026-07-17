# Hexa CMS

**Last Updated:** 2026-07-16

---

## Relationship to Strapi

The marketing site content (portfolios, articles, services) is authored in
**Strapi** (`apps/cms`), not Odoo. Odoo owns **business state**; Strapi owns
**marketing content**.

## Bridge

`project.project.x_slug` is the join key:

```
Strapi portfolio.slug  ⇄  Odoo project.project.x_slug
```

`ProjectsService` enriches Strapi portfolio items with the Odoo `stage_id`
(real-time project status) on read. The `OdooWebhookController` is the hook
point for pushing Odoo status changes back into Strapi (status field update +
ISR revalidation).

## Future

A custom Odoo `hexa_cms` model is out of scope; the integration stays
unidirectional (Odoo → Strapi enrichment) to keep Odoo as the source of truth
for project state.
