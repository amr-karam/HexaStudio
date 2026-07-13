export default [
  "strapi::logger",
  "strapi::errors",
  // Admin IP allowlist — restricts /admin to IPs in CMS_ALLOWED_IPS env var
  // Leave CMS_ALLOWED_IPS unset for unrestricted local dev access
  "global::admin-ip-guard",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
