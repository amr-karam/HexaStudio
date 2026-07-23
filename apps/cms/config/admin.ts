export default ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
  },
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT"),
    },
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env("CLIENT_URL", "https://hexastudio.net"),
      async handler(uid, { documentId, locale, status }) {
        const document = await strapi.documents(uid).findOne({ documentId });
        const slug = document?.slug ?? document?.title;

        // Map content types to frontend URL patterns
        switch (uid) {
          case "api::article.article":
            return slug
              ? `${env("CLIENT_URL", "https://hexastudio.net")}/api/preview?url=/blog/${encodeURIComponent(slug)}&secret=${env("PREVIEW_SECRET")}&status=${status}`
              : null;

          case "api::project.project":
            return slug
              ? `${env("CLIENT_URL", "https://hexastudio.net")}/api/preview?url=/projects/${encodeURIComponent(slug)}&secret=${env("PREVIEW_SECRET")}&status=${status}`
              : null;

          case "api::page.page": {
            // Map well-known page slugs to their routes
            const pageRoutes: Record<string, string> = {
              about: "/about",
              terms: "/terms",
              privacy: "/privacy",
              services: "/services",
              contact: "/contact",
            };
            const pathname = pageRoutes[slug as string] ?? `/${slug}`;
            return `${env("CLIENT_URL", "https://hexastudio.net")}/api/preview?url=${encodeURIComponent(pathname)}&secret=${env("PREVIEW_SECRET")}&status=${status}`;
          }

          // Content types without individual frontend pages
          case "api::service.service":
          case "api::category.category":
          case "api::testimonial.testimonial":
          case "api::team-member.team-member":
          case "api::faq.faq":
          case "api::achievement.achievement":
          case "api::portfolio.portfolio":
          default:
            return null;
        }
      },
    },
  },
});
