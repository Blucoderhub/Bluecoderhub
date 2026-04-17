import bcrypt from 'bcryptjs';
import { query, getPool } from '../src/db/pool.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

if (!email || !password) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to create an admin user.');
}

if (password.length < 12) {
  throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
}

const passwordHash = await bcrypt.hash(password, 12);

await query(
  `INSERT INTO users (email, password_hash, role)
   VALUES ($1, $2, 'admin')
   ON CONFLICT (email)
   DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', updated_at = NOW()`,
  [email, passwordHash]
);

await getPool().end();
console.log(`Admin user ready: ${email}`);
