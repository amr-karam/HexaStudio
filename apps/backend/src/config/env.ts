import { z } from 'zod';

const envSchema = z.object({
  // Required — throw if missing
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  CMS_URL: z.string().url('CMS_URL must be a valid URL'),

  // MinIO
  MINIO_ROOT_USER: z.string().min(1, 'MINIO_ROOT_USER is required'),
  MINIO_ROOT_PASSWORD: z.string().min(8, 'MINIO_ROOT_PASSWORD is at least 8 characters'),
  MINIO_HOST: z.string().default('minio'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z
    .string()
    .default('false')
    .transform((v: string) => v === 'true'),

  // Odoo
  ODOO_HOST: z.string().min(1, 'ODOO_HOST is required'),
  ODOO_PORT: z.coerce.number().default(8069),
  ODOO_DB: z.string().min(1, 'ODOO_DB is required'),
  ODOO_USER: z.string().min(1, 'ODOO_USER is required'),
  ODOO_PASSWORD: z.string().min(1, 'ODOO_PASSWORD is required'),
  ODOO_DB_USER: z.string().default('odoo'),
  ODOO_DB_PASSWORD: z.string().default('odoo'),
  ODOO_MASTER_PASSWORD: z.string().optional(),
  ODOO_WEBHOOK_SECRET: z.string().min(32, 'ODOO_WEBHOOK_SECRET must be at least 32 characters'),

  // Slack
  SLACK_WEBHOOK_URL: z.string().url().optional(),

  // CMS (Strapi)
  CMS_API_TOKEN: z.string().optional(),

  // Redis
  REDIS_HOST: z.string().default('redis'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().min(1, 'REDIS_PASSWORD is required'),

  // Vector Store (Qdrant)
  VECTOR_HOST: z.string().default('qdrant'),
  VECTOR_PORT: z.coerce.number().default(6333),
  VECTOR_API_KEY: z.string().optional(),

  // AI / OpenAI
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),

  // AI / Gemini
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash'),
  AI_PROVIDER: z.enum(['openai', 'gemini']).default('openai'),

  // Optional
  PORT: z.coerce.number().default(4000),

  SENTRY_DSN: z.string().url().or(z.literal('')).optional().transform(v => v === '' ? undefined : v),
  SENTRY_RELEASE: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    const errors = Object.entries(formatted)
      .filter(([, v]) => v && typeof v === 'object' && '_errors' in v)
      .map(([key, v]) => `  ${key}: ${(v as { _errors: string[] })._errors.join(', ')}`)
      .join('\n');

    console.error('\n❌ Missing or invalid environment variables:\n');
    console.error(errors);
    console.error('\n💡 Copy .env.example to .env and fill in the values.\n');
    process.exit(1);
  }

  _env = result.data;
  return _env;
}
