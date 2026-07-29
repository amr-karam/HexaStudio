import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
  NEXT_PUBLIC_REALTIME_URL: z.string().url().default('http://localhost:3002'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_REALTIME_URL: process.env.NEXT_PUBLIC_REALTIME_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n');
      console.error(`❌ Invalid environment variables:\n${messages}`);
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment configuration');
      }
    }
    return {
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
      NEXT_PUBLIC_REALTIME_URL: 'http://localhost:3002',
    };
  }
}
