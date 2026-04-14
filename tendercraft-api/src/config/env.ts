import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string): string | undefined {
  return process.env[key] || undefined;
}

export const env = {
  ANTHROPIC_API_KEY: required('ANTHROPIC_API_KEY'),
  FAL_KEY: required('FAL_KEY'),
  REPLICATE_API_TOKEN: optional('REPLICATE_API_TOKEN'),
  PORT: parseInt(process.env.PORT || '3001', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
