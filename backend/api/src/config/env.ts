import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables early
dotenv.config();

/**
 * Zod schema for environment variables.
 * This guarantees type-safety and ensures the app won't start if critical variables are missing.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  CORS_ORIGIN: z.string().default('*'),
  
  // Supabase Configuration
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  
  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  // JWT configuration (strictly required for winery management authentication)
  JWT_SECRET: z.string().min(16, "JWT_SECRET is required and must be at least 16 characters"),
});

// Parse the environment variables
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_env.error.format());
  process.exit(1); // Stop the application immediately
}

export const env = _env.data;
