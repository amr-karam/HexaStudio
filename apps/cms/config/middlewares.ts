export default [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "frame-ancestors": ["'self'", "http://localhost:3000", "http://localhost:3001", "https://hexastudio.net"],
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      origin: ["https://hexastudio.net", "http://localhost:3000", "http://localhost:3001"],
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
