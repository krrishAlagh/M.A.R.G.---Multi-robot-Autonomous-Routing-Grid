import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_JWT_SECRET = 'marg-edge-ai-fleet-mesh-secret-key-2026';
const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

if (jwtSecret === DEFAULT_JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[ENV] WARNING: Using default JWT_SECRET in production. Set a strong JWT_SECRET environment variable.');
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  // Render & Cloud Run inject PORT; fallback to 5005 for local dev
  PORT: parseInt(process.env.PORT || '5005', 10),
  APP_URL: process.env.APP_URL || 'http://localhost:3005',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DATA_DIR: path.resolve(process.cwd(), 'server/data'),
  JWT_SECRET: jwtSecret,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  ENABLE_TELEMETRY_SIMULATION: process.env.ENABLE_TELEMETRY_SIMULATION !== 'false',
  SIMULATION_INTERVAL_MS: parseInt(process.env.SIMULATION_INTERVAL_MS || '500', 10)
};
