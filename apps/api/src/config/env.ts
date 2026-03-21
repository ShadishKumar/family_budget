import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  DIRECT_DATABASE_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().default('dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret-change-me'),
  GOOGLE_CLOUD_VISION_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
