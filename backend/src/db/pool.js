import pg from 'pg';
import { env, assertDatabaseConfigured } from '../config/env.js';

const { Pool } = pg;

let pool;

function getSslConfig() {
  if (env.databaseUrl.includes('localhost') || env.databaseUrl.includes('127.0.0.1')) {
    return false;
  }
  if (env.nodeEnv === 'production') {
    return { rejectUnauthorized: true };
  }
  return { rejectUnauthorized: false };
}

export function getPool() {
  assertDatabaseConfigured();
  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: getSslConfig(),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    pool.on('error', (err) => {
      console.error('[db:pool:error]', err.message);
    });
  }
  return pool;
}

export async function query(text, params = []) {
  const result = await getPool().query(text, params);
  return result;
}
