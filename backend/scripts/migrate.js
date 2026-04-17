import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool } from '../src/db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../src/db/schema.sql');

const sql = await fs.readFile(schemaPath, 'utf8');
await getPool().query(sql);
await getPool().end();
console.log('Database migration completed.');
