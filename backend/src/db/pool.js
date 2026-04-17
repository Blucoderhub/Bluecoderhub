import pg from 'pg';
import { env, assertDatabaseConfigured } from '../config/env.js';

const { Pool } = pg;

let pool;

export function getPool() {
  assertDatabaseConfigured();
  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: env.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  }
  return pool;
}

export async function query(text, params = []) {
  const result = await getPool().query(text, params);
  return result;
}
