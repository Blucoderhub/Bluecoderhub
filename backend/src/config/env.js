import dotenv from 'dotenv';

dotenv.config();

const required = ['JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173,http://localhost:8080')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
};

export function assertDatabaseConfigured() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
}

export { env };

export function assertDatabaseConfigured() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
}
