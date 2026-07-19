export default ({ env }) => ({
  i18n: {
    enabled: true,
    config: {
      defaultLocale: "en",
      locales: ["en", "ar", "es", "fr", "de", "ja", "ko", "zh"],
    },
  },
  meilisearch: {
    config: {
      host: env("MEILISEARCH_HOST", "http://localhost:7700"),
      apiKey: env("MEILISEARCH_MASTER_KEY", ""),
    },
  },
  "config-sync": {
    enabled: true,
    configDir: "config/sync",
    excludedKeys: [],
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.gmail.com"),
        port: env.int("SMTP_PORT", 587),
        secure: false,
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
      },
      settings: {
        defaultFrom: env("SMTP_FROM", "noreply@hexastudio.net"),
        defaultReplyTo: env("SMTP_REPLY_TO", "info@hexastudio.net"),
      },
    },
  },
  publisher: {
    enabled: true,
    config: {
      relations: true,
    },
  },
  "preview-button": {
    enabled: true,
    config: {
      entries: [
        {
          uid: "api::page.page",
          target: "/preview/:id",
        },
      ],
    },
  },
  navigation: {
    enabled: true,
    config: {
      maxDepth: 6,
    },
  },
  redis: {
    enabled: true,
    config: {
      connections: {
        default: {
          connection: {
            host: env("REDIS_HOST", "127.0.0.1"),
            port: env.int("REDIS_PORT", 6379),
            password: env("REDIS_PASSWORD"),
          },
        },
      },
    },
  },
  "strapi-5-sitemap-plugin": {
    enabled: true,
    config: {
      autoGenerate: true,
    },
  },
  seo: {
    enabled: true,
  },
  "multi-select": {
    enabled: true,
  },
  "icons-field": {
    enabled: true,
  },
  "strapi-cache": {
    enabled: true,
  },
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        baseUrl: env(
          "MINIO_PUBLIC_URL",
          "https://files.hexastudio.net",
        ) + `/${env("AWS_BUCKET_NAME", "uploads")}`,
        s3Options: {
          accessKeyId: env("MINIO_ROOT_USER"),
          secretAccessKey: env("MINIO_ROOT_PASSWORD"),
          region: env("AWS_REGION", "us-east-1"),
          endpoint: env("MINIO_ENDPOINT", "http://minio:9000"),
          forcePathStyle: true,
          params: {
            Bucket: env("AWS_BUCKET_NAME", "uploads"),
          },
        },
      },
    },
  },
});
